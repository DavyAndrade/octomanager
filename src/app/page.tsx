import { GitFork, Eye, Trash2, ArrowRight, Coffee, Star, Lock, Globe, Terminal, Command } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/auth/sign-in-button";

/*
  THESIS: The product is a workbench; the landing page IS the workbench.
  OWN-WORLD: Zinc-only, Geist + Geist Mono. 8px radius, 1px hairline borders, subtle lift.
  STORY: Visitor lands on a chrome-window mock of the dashboard with a real repo list,
         a blinking cursor, and a command bar. They feel the speed before signing in.
  FIRST VIEWPORT: 56px nav → split hero (headline + CTA | chrome-window mock) → keyboard hint bar.
  FORM: Code-led. No comp.
*/

const MOCK_REPOS = [
  { name: "octo-manager", visibility: "private" as const, language: "TypeScript", stars: 142, updated: "2h" },
  { name: "tailwind-cli-tools", visibility: "public" as const, language: "Rust", stars: 89, updated: "1d" },
  { name: "fzf-git", visibility: "public" as const, language: "Go", stars: 1247, updated: "3d" },
  { name: "dotfiles", visibility: "private" as const, language: "Lua", stars: 24, updated: "1w" },
  { name: "blog-source", visibility: "public" as const, language: "MDX", stars: 56, updated: "2w" },
];

const KEYBOARD_HINTS = [
  { keys: "⌘K", label: "search" },
  { keys: "Esc", label: "clear" },
  { keys: "Space", label: "select" },
  { keys: "?", label: "help" },
];

const ACTIONS = [
  { key: "01", icon: Eye, name: "visibility.toggle", desc: "Switch repos public ⇄ private without the modal loop." },
  { key: "02", icon: GitFork, name: "metadata.update", desc: "Edit name, description, website, topics — one form." },
  { key: "03", icon: Trash2, name: "repo.delete", desc: "Type the repo name. Destructive actions need intent, not clicks." },
];

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-14 items-center justify-between gap-2 px-4">
          <div className="flex min-w-0 items-center gap-2 font-semibold tracking-tight">
            <Terminal className="h-4 w-4 shrink-0" />
            <span className="truncate">OctoManager</span>
            <span className="hidden font-mono text-[10px] font-normal text-muted-foreground sm:inline-block">
              ~/landing
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="https://github.com/DavyAndrade/octomanager"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub"
              className="hidden items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              source
            </Link>
            <Link
              href="https://buymeacoffee.com/davyandrade.dev"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Buy me a coffee"
              className="flex items-center gap-1.5 rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground sm:px-2.5 sm:py-1.5"
            >
              <Coffee className="h-4 w-4" />
              <span className="hidden sm:inline">Buy me a coffee</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — mobile-first: mock first (proof), then copy (why) */}
      <section className="flex-1 px-4 py-6 sm:py-12 lg:py-20">
        <div className="container mx-auto flex flex-col gap-8 lg:grid lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12 lg:gap-x-12">
          {/* Mock first on mobile (proof), then the copy on lg+ */}
          <div className="order-1 lg:order-2">
            <div className="lg:hidden">
              <DashboardMock density="compact" />
            </div>
            <div className="hidden lg:block">
              <DashboardMock density="full" />
            </div>
          </div>

          <div className="order-2 flex flex-col lg:order-1">
            <p className="mb-3 hidden font-mono text-xs text-muted-foreground sm:mb-5 sm:block">
              <span className="text-foreground">$</span> octo --what
            </p>
            <h1 className="text-balance text-[2rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.75rem]">
              Your GitHub repos,
              <br />
              <span className="text-muted-foreground">without the friction.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm text-muted-foreground sm:mt-5 sm:text-base lg:text-lg">
              Bulk toggle visibility, edit metadata, and delete repos from one keyboard-first surface. No settings-page maze.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
              <SignInButton className="w-full cursor-pointer sm:w-auto" />
              <Link
                href="https://github.com/DavyAndrade/octomanager"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center justify-center gap-1.5 px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                View source
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground sm:mt-8">
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                OAuth · no data stored
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                MIT license
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                self-host ready
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Keyboard hint bar */}
      <section className="border-y border-border bg-muted/40">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
          {KEYBOARD_HINTS.map(({ keys, label }) => (
            <span key={keys} className="inline-flex items-center gap-1.5">
              <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-background px-1.5 text-[10px] font-medium text-foreground">
                {keys}
              </kbd>
              <span>{label}</span>
            </span>
          ))}
        </div>
      </section>

      {/* Actions — labeled like commands */}
      <section className="px-4 py-16 sm:py-20">
        <div className="container mx-auto">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              What you can do
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              3 commands
            </span>
          </div>
          <ul className="divide-y divide-border border-t border-b border-border">
            {ACTIONS.map(({ key, icon: Icon, name, desc }) => (
              <li
                key={key}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 px-2 py-5 sm:gap-6 sm:px-4"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {key}
                </span>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-foreground" />
                    <code className="truncate text-sm font-semibold text-foreground">
                      {name}
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Close */}
      <section className="border-t border-border bg-muted/40 px-4 py-12">
        <div className="container mx-auto flex flex-col items-center gap-4 text-center">
          <Command className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            One keystroke. The whole repo list.
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Sign in with GitHub. No scopes beyond what you already trust. Open the dashboard and start moving.
          </p>
          <SignInButton className="cursor-pointer" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground sm:flex-row">
          <span className="font-mono">MIT · {new Date().getFullYear()} OctoManager</span>
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

function DashboardMock({ density = "full" }: { density?: "compact" | "full" }) {
  const isCompact = density === "compact";
  const visibleRepos = isCompact ? MOCK_REPOS.slice(0, 3) : MOCK_REPOS;
  const totalRepos = MOCK_REPOS.length;
  const visibleCount = visibleRepos.length;
  const trailingCount = totalRepos - visibleCount;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_1px_3px_0_rgb(0_0_0/0.08),0_1px_2px_-1px_rgb(0_0_0/0.08)]">
      {/* Chrome bar */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="flex-1 truncate text-center font-mono text-[10px] text-muted-foreground">
          octomanager · ~/repos
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">{totalRepos}</span>
      </div>

      {/* Command bar */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span className="font-mono text-xs text-muted-foreground">$</span>
        <span className="truncate font-mono text-xs text-foreground">repos --filter=&quot;&quot;</span>
        <span className="ml-0.5 inline-block h-3.5 w-1.5 shrink-0 animate-pulse bg-foreground" aria-hidden />
      </div>

      {/* Section nav */}
      <div className="flex items-center gap-3 overflow-x-auto border-b border-border bg-muted/30 px-3 py-1.5 font-mono text-[10px]">
        <span className="shrink-0 text-foreground">all</span>
        <span className="shrink-0 text-muted-foreground">your</span>
        <span className="shrink-0 text-muted-foreground">public</span>
        <span className="shrink-0 text-muted-foreground">private</span>
        <span className="shrink-0 text-muted-foreground">collab</span>
        <span className="ml-auto shrink-0 text-muted-foreground">{visibleCount} / {totalRepos}</span>
      </div>

      {/* Repo list */}
      <ul className="divide-y divide-border font-mono text-xs">
        {visibleRepos.map((repo) => (
          <li
            key={repo.name}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-2 sm:grid-cols-[1fr_auto_auto_auto]"
          >
            <div className="flex min-w-0 items-center gap-2">
              {repo.visibility === "private" ? (
                <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
              ) : (
                <Globe className="h-3 w-3 shrink-0 text-muted-foreground" />
              )}
              <span className="truncate text-foreground">{repo.name}</span>
            </div>
            <span className="hidden truncate text-muted-foreground sm:inline">{repo.language}</span>
            <span className="flex items-center gap-0.5 text-muted-foreground">
              <Star className="h-3 w-3" />
              {repo.stars.toLocaleString()}
            </span>
            <span className="hidden text-muted-foreground sm:inline">{repo.updated}</span>
          </li>
        ))}
        {isCompact && trailingCount > 0 && (
          <li className="px-3 py-2 text-center font-mono text-[10px] text-muted-foreground">
            + {trailingCount} more · sign in to see all
          </li>
        )}
      </ul>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-1.5 font-mono text-[10px] text-muted-foreground">
        <span className="truncate">0 selected · bulk action ready</span>
        <span className="ml-2 shrink-0">ready</span>
      </div>
    </div>
  );
}
