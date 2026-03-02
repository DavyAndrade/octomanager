import { Github, GitFork, Eye, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/auth/sign-in-button";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: Eye,
    title: "Toggle visibility",
    description:
      "Switch repositories between public and private with a single click — no repeated confirmations.",
  },
  {
    icon: GitFork,
    title: "Update metadata",
    description:
      "Edit repository name, description, website, and topics from a clean form.",
  },
  {
    icon: Trash2,
    title: "Safe deletion",
    description:
      "Delete repositories safely with a name-confirmation step that prevents accidental removal.",
  },
];

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Github className="h-5 w-5" />
            OctoManager
          </div>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Open Source
          </Badge>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <Badge
          variant="secondary"
          className="mb-6 gap-1.5 px-3 py-1 text-xs font-medium"
        >
          <Github className="h-3.5 w-3.5" />
          GitHub OAuth · No data stored
        </Badge>

        <h1 className="mb-4 max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Manage your GitHub repos{" "}
          <span className="text-muted-foreground">without the friction</span>
        </h1>

        <p className="mb-10 max-w-lg text-base text-muted-foreground sm:text-lg">
          Toggle visibility, update metadata, and delete repositories — all
          from a single, fast interface. No manual navigation through GitHub
          settings.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <SignInButton />
          <Link
            href="https://github.com/DavyAndrade/octomanager"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View source
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/40 px-4 py-16">
        <div className="container mx-auto">
          <div className="grid gap-8 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background">
                  <Icon className="h-4 w-4 text-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        MIT License ·{" "}
        <Link
          href="https://github.com/DavyAndrade/octomanager"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Source code
        </Link>
      </footer>
    </main>
  );
}
