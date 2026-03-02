import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Github } from "lucide-react";
import { SignInButton } from "@/components/auth/sign-in-button";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

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

        <SignInButton className="w-full" />

        <p className="text-xs text-muted-foreground">
          OctoManager only requests access to your repositories.
          <br />
          We never store your data.
        </p>
      </div>
    </main>
  );
}
