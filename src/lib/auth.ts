import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

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

const githubProvider =
  process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
    ? [
        GitHub({
          clientId: process.env.AUTH_GITHUB_ID,
          clientSecret: process.env.AUTH_GITHUB_SECRET,
          authorization: {
            params: {
              scope: "read:user user:email repo delete_repo",
            },
          },
        }),
      ]
    : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [...githubProvider, ...devProvider],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // GitHub OAuth provider — token comes from account
      if (account?.access_token) {
        token.accessToken = account.access_token;
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
      return token;
    },
    async session({ session, token }) {
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
