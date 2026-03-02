# OctoManager

A modern, open-source web application for managing your GitHub repositories — built with Next.js, Auth.js, Octokit, and shadcn/ui.

> Authenticate with GitHub OAuth and manage all your repositories from a clean, fast UI. Toggle visibility, update metadata, delete repos safely — without repetitive manual confirmations.

---

## ✨ Features

- 🔐 **GitHub OAuth** via Auth.js — secure, session-based authentication
- 📦 **Repository DataTable** — sortable columns, pagination, and full-text search
- ☑️ **Bulk select** — checkbox column, floating action bar to act on multiple repos at once
- 👁️ **Toggle visibility** (public ↔ private) per-row or in bulk, with optimistic UI
- ✏️ **Edit metadata** — name, description, website, topics
- 🗑️ **Safe deletion** — single repo requires name confirmation; bulk delete shows a summary modal
- ⚡ **Optimistic updates** — UI responds instantly, rolls back automatically on error
- 🎨 **Zinc-only design** — clean, minimal aesthetic with full dark mode support

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) + TypeScript |
| Runtime | [Bun](https://bun.sh) |
| Auth | [Auth.js v5](https://authjs.dev) (GitHub provider) |
| GitHub API | [Octokit v5](https://github.com/octokit/octokit.js) |
| Server state | [TanStack Query v5](https://tanstack.com/query) |
| Table | [TanStack Table v8](https://tanstack.com/table) |
| UI state | [Zustand](https://zustand-demo.pmnd.rs) |
| UI components | [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS v4](https://tailwindcss.com) |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Unit tests | [Vitest](https://vitest.dev) |
| E2E tests | [Playwright](https://playwright.dev) |

---

## 📋 Prerequisites

- [Bun](https://bun.sh) >= 1.0
- Node.js >= 20 (for Playwright)
- A [GitHub OAuth App](https://github.com/settings/developers)

---

## ⚙️ Environment Variables

> **This is deployer configuration, not end-user configuration.** Users of the app just click "Sign in with GitHub" — they never touch these variables. The env vars below are filled in once by whoever hosts/deploys the application.

Create a `.env.local` file at the project root (copy from `.env.local.example`):

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `AUTH_SECRET` | Random secret — run `openssl rand -base64 32` |
| `AUTH_GITHUB_ID` | GitHub OAuth App Client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App Client Secret |
| `NEXTAUTH_URL` | App URL (`http://localhost:3000` for dev) |

### How the OAuth flow works

1. The deployer registers a **GitHub OAuth App** once (see below).
2. Any user visits the app and clicks **Sign in with GitHub**.
3. GitHub redirects them to the authorization page — they approve the requested scopes (`repo`, `delete_repo`).
4. GitHub redirects back with an access token. Auth.js stores it server-side in a JWT cookie.
5. The app uses that token (via Octokit) to manage **that user's own repositories** — never the deployer's.

### Creating a GitHub OAuth App

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Set **Authorization callback URL** to:
   - Dev: `http://localhost:3000/api/auth/callback/github`
   - Prod: `https://yourdomain.com/api/auth/callback/github`
4. Copy the **Client ID** and generate a **Client Secret**

---

## 🚀 Setup

### Using scripts (recommended)

**Linux / macOS:**
```bash
chmod +x scripts/setup.sh && ./scripts/setup.sh
```

**Windows:**
```bat
scripts\setup.bat
```

### Manual setup

```bash
# 1. Install dependencies
bun install

# 2. Copy environment template
cp .env.local.example .env.local

# 3. Fill in your values in .env.local
# 4. Start the development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🏃 Running

**Linux / macOS:**
```bash
./scripts/start.sh
```

**Windows:**
```bat
scripts\start.bat
```

**Or directly:**
```bash
bun run dev    # development
bun run build  # production build
bun run start  # production server
```

---

## 🧪 Testing

```bash
bun run test          # Vitest unit tests
bun run test:ui       # Vitest with browser UI
bun run test:e2e      # Playwright end-to-end tests
bun run test:coverage # Coverage report
```

---

## 🏗️ Architecture

```
src/
├── app/              Pages and API routes (Next.js App Router)
│   ├── (auth)/       Unauthenticated pages (login)
│   ├── (dashboard)/  Protected route group (dashboard)
│   └── api/          Server-only route handlers
├── components/
│   ├── ui/           shadcn/ui primitives (do not edit directly)
│   ├── auth/         Sign-in button
│   ├── repos/        Repository table, bulk actions, modals
│   └── layout/       App header, providers
├── hooks/            TanStack Query hooks
├── lib/              Core utilities (auth, octokit, query-client)
├── schemas/          Zod validation schemas
├── store/            Zustand UI state (search, filters, bulk selection)
├── types/            TypeScript type definitions
└── proxy.ts              Route protection
```

See [`docs/CLAUDE.md`](docs/CLAUDE.md) or [`docs/GEMINI.md`](docs/GEMINI.md) for a full architecture and conventions guide (also useful for human contributors).

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Read [`docs/CLAUDE.md`](docs/CLAUDE.md) for conventions and security guardrails
4. Make your changes with tests
5. Run `bun run lint && bun run test` before committing
6. Open a Pull Request with a clear description

Please keep all changes strongly typed and follow the existing code style.

---

## 📄 License

MIT © OctoManager contributors. See [LICENSE](LICENSE).
