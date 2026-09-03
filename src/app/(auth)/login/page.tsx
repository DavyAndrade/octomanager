import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Github } from "lucide-react";
import { SignInButton } from "@/components/auth/sign-in-button";

export const metadata: Metadata = {
  title: "Sign in",
};

const errorMessages: Record<string, string> = {
  Configuration: "Server configuration issue. Please try again later or contact support.",
  AccessDenied: "You denied permission or the request was cancelled. Try signing in again and approve the access request.",
  Verification: "The sign-in link has expired. Please request a new one by signing in again.",
  OAuthAccountNotLinked:
    "This GitHub account is already linked to a different sign-in method. Use the same method you originally used.",
  OAuthCallbackError: "GitHub sign-in was interrupted. Please try again — if the problem persists, check that your GitHub account is accessible.",
  MissingCSRF: "The security token expired. Please refresh the page and try again.",
  Default: "Something went wrong during sign-in. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Wrap in try/catch: if AUTH_SECRET is not set, auth() throws and we still
  // want the login page to render instead of a blank 500.
  try {
    const session = await auth();
    if (session) redirect("/dashboard");
  } catch {
    // Auth not configured yet — fall through and show the login UI.
  }

  const isDevMode =
    process.env.NODE_ENV === "development" && !!process.env.GITHUB_DEV_TOKEN;

  const { error } = await searchParams;
  const errorMessage = error ? errorMessages[error] ?? errorMessages.Default : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
            <Github className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Sign in to OctoManager
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Authenticate with your GitHub account to manage your repositories.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-500/20 bg-red-50/50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/20 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        {isDevMode ? (
          <div className="space-y-3">
            <SignInButton className="w-full" dev />
            <p className="text-xs text-muted-foreground">
              ⚠ Dev mode — using local gh CLI token
            </p>
          </div>
        ) : (
          <SignInButton className="w-full" />
        )}

        <p className="text-xs text-muted-foreground">
          OctoManager only requests access to your repositories.
          <br />
          We never store your data.
        </p>
      </div>
    </main>
  );
}
