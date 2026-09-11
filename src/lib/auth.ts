import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

type GitHubRefreshResponse = {
  access_token?: unknown;
  expires_in?: unknown;
  refresh_token?: unknown;
};

async function refreshGitHubAccessToken(token: Record<string, unknown>) {
  const refreshToken = token.refreshToken;

  if (typeof refreshToken !== "string") {
    return { ...token, error: "RefreshAccessTokenError" };
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GITHUB_ID ?? "",
        client_secret: process.env.AUTH_GITHUB_SECRET ?? "",
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
    const refreshed = (await response.json()) as GitHubRefreshResponse;

    if (!response.ok || typeof refreshed.access_token !== "string") {
      throw new Error("GitHub token refresh failed");
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpiresAt:
        typeof refreshed.expires_in === "number"
          ? Date.now() + refreshed.expires_in * 1_000
          : undefined,
      refreshToken:
        typeof refreshed.refresh_token === "string"
          ? refreshed.refresh_token
          : refreshToken,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

// Dev-only: fetch GitHub user info using the local gh CLI token so the app
// can be tested without a registered OAuth App.
async function fetchGitHubUser(token: string) {
  const res = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Invalid GitHub token");
  return res.json() as Promise<{
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
  }>;
}

const devProvider =
  process.env.NODE_ENV === "development" && process.env.GITHUB_DEV_TOKEN
    ? [
        Credentials({
          id: "dev-github",
          name: "Dev GitHub (local token)",
          credentials: {},
          async authorize() {
            const token = process.env.GITHUB_DEV_TOKEN!;
            const user = await fetchGitHubUser(token);
            return {
              id: String(user.id),
              name: user.name ?? user.login,
              email: user.email,
              image: user.avatar_url,
              // Passed through to the JWT callback below
              login: user.login,
              accessToken: token,
            };
          },
        }),
      ]
    : [];

// Always register the GitHub OAuth provider. In production (Vercel) the env
// vars MUST be set; locally they are optional when GITHUB_DEV_TOKEN is used.
const githubProvider = [
  GitHub({
    clientId: process.env.AUTH_GITHUB_ID ?? "",
    clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
    authorization: {
      params: {
        scope: "read:user user:email repo delete_repo",
      },
    },
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [...githubProvider, ...devProvider],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // GitHub OAuth provider — token comes from account
      if (account?.access_token) {
        token.accessToken = account.access_token;
        token.accessTokenExpiresAt = account.expires_at
          ? account.expires_at * 1_000
          : undefined;
        token.refreshToken = account.refresh_token;
      }
      if (profile) {
        token.login = (profile as { login?: string }).login;
      }
      // Dev credentials provider — token comes from the user object
      if (user && "accessToken" in user) {
        token.accessToken = user.accessToken as string;
      }
      if (user && "login" in user) {
        token.login = user.login as string;
      }

      const expiresAt = token.accessTokenExpiresAt;
      if (
        typeof expiresAt === "number" &&
        Date.now() >= expiresAt - 60_000
      ) {
        return refreshGitHubAccessToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      // API routes receive this through server-side auth(). The auth session route
      // removes it before SessionProvider exposes the session to the browser.
      session.accessToken = token.accessToken as string | undefined;
      if (session.user) {
        session.user.login = token.login as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
