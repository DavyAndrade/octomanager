import { Github } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/auth/sign-in-button";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <Github className="h-4 w-4" />
            OctoManager
          </div>
          <Link
            href="https://github.com/DavyAndrade/octomanager"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            className="flex items-center gap-1.5 rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground sm:px-2.5 sm:py-1.5"
          >
            <Github className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">source</span>
          </Link>
        </div>
      </header>

      <section className="flex flex-1 items-center px-4">
        <div className="container mx-auto flex max-w-xl flex-col items-center gap-6 py-12 text-center sm:py-20">
          <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
            Your GitHub repos,{" "}
            <span className="text-muted-foreground">without the friction.</span>
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Toggle visibility, edit metadata, and delete repos from one keyboard-first surface.
          </p>
          <SignInButton className="w-full cursor-pointer sm:w-auto" />
          <p className="font-mono text-xs text-muted-foreground">
            OAuth · no data stored · MIT
          </p>
        </div>
      </section>

      <footer className="border-t border-border py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} OctoManager</span>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/DavyAndrade/octomanager"
              className="transition-colors hover:text-foreground"
            >
              Source
            </Link>
            <Link
              href="https://buymeacoffee.com/davyandrade.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Buy me a coffee
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
