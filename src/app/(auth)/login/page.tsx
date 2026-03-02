import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Github } from "lucide-react";
import { SignInButton } from "@/components/auth/sign-in-button";
import { DevSignInButton } from "@/components/auth/dev-sign-in-button";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
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

        {isDevMode ? (
          <div className="space-y-3">
            <DevSignInButton className="w-full" />
            <p className="text-xs text-amber-600 dark:text-amber-400">
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
