# TUTOR.md — AI Agent Guide for OctoManager

This document is intended for GitHub Copilot (and any other AI agent) working on the OctoManager codebase. Read it entirely before making any changes.

---

## 🗺️ What Is OctoManager?

OctoManager is a modern, open-source web application that allows authenticated GitHub users to manage their own repositories from a clean, fast UI — toggle visibility, edit metadata, and delete repos safely, without repetitive manual confirmations on GitHub.com.

---

## 🏗️ Project Architecture

| Layer | Technology | Location |
|---|---|---|
| Framework | Next.js 16, React 19, TypeScript | `src/app/` |
| Auth | Auth.js v5 (next-auth beta) | `src/lib/auth.ts` |
| GitHub API | Octokit v5 | `src/lib/octokit.ts` |
| Server state | TanStack Query v5 | `src/hooks/` |
| Table | TanStack Table v8 | `src/components/repos/repo-table.tsx` |
| UI state | Zustand | `src/store/` |
| UI components | shadcn/ui + Tailwind CSS v4 (Zinc only) | `src/components/` |
| Forms | React Hook Form + Zod | `src/components/repos/` |
| Animations | Framer Motion | Used selectively |
| Runtime/PM | Bun | `bun.lock`, `package.json` |

### Request Flow

```
Browser (Client Component)
  └── TanStack Query hook (src/hooks/)
        └── fetch() → /api/repos/*
              └── Next.js Route Handler (src/app/api/repos/)
                    ├── auth() → validate session (Auth.js)
                    ├── Zod → validate request params/body
                    └── Octokit wrapper (src/lib/octokit.ts)
                          └── GitHub REST API
```

### Folder Responsibilities

```
src/
├── app/                   Next.js App Router pages and API routes
│   ├── (auth)/            Unauthenticated pages (login)
│   ├── (dashboard)/       Authenticated route group
│   └── api/               Server-only route handlers
├── components/
│   ├── ui/                shadcn/ui primitives — DO NOT modify manually
│   ├── auth/              Auth-related UI (sign-in button, dev-sign-in)
│   ├── repos/             Repository management components
│   │   ├── repo-table-columns.tsx   Column definitions (TanStack Table)
│   │   ├── repo-table.tsx           DataTable with sorting, pagination, row selection
│   │   ├── repo-list.tsx            Thin wrapper rendering RepoTable
│   │   ├── bulk-action-bar.tsx      Floating bar (Framer Motion) for bulk operations
│   │   ├── bulk-delete-modal.tsx    Confirmation dialog for bulk delete
│   │   ├── delete-repo-modal.tsx    Name-confirmation dialog for single delete
│   │   ├── edit-repo-modal.tsx      RHF + Zod form for updating repo metadata
│   │   ├── visibility-toggle.tsx    Optimistic Switch component
│   │   ├── search-bar.tsx           Debounced search input (300 ms)
│   │   ├── filter-bar.tsx           Visibility + sort filter controls
│   │   ├── repo-list-skeleton.tsx   Loading skeleton
│   │   ├── empty-state.tsx          No repos found state
│   │   └── error-state.tsx          API error state
│   └── layout/            App shell (header, providers)
├── hooks/
│   ├── use-repos.ts                 TanStack Query hook — reactive, reads from Zustand store
│   └── use-repo-mutations.ts        Mutations: toggle, update, delete, bulk ops
├── lib/
│   ├── auth.ts            Auth.js v5 config — server-only
│   ├── octokit.ts         GitHub API client — server-only
│   ├── query-client.ts    TanStack Query singleton
│   └── utils.ts           Shared utilities (cn, formatRepoCount, formatRelativeTime, slugify)
├── schemas/
│   └── repo.ts            Zod validation schemas for all repo operations
├── store/
│   └── ui-store.ts        Zustand store for UI state (search, filters, modals, selection)
├── types/
│   ├── github.ts          Repository, RepoOwner, RepoUpdatePayload, RepoListParams, etc.
│   ├── auth.ts            Extended Session with accessToken and login
│   └── api.ts             ApiResponse<T>, ApiError, PaginatedResponse<T>
└── proxy.ts               Route protection (Next.js 16 middleware convention)
```

### Dependency Direction

Dependencies must flow **inward**: outer layers may import from inner layers, never the reverse.

```
components/ → hooks/ → app/api/ → lib/ → schemas/ / types/
```

- `src/lib/` must not import from `components/`, `hooks/`, or `app/`.
- `src/hooks/` must not import from `components/` or `app/api/`.
- `src/schemas/` and `src/types/` must not import from any other local layer.

---

## 🔑 Auth & Session Model

Auth.js v5 handles authentication with two providers:

1. **GitHub OAuth** (production) — scopes: `read:user user:email repo delete_repo`
2. **Credentials** (dev only) — auto-login using the local `gh` CLI token via `GITHUB_DEV_TOKEN`

The JWT callback captures `accessToken` and `login` from the GitHub account/profile. The session callback forwards them to the session object so API route handlers can access them via `auth()`. **The token never leaves the server.**

```ts
// Correct: server-side only
const session = await auth();
const octokit = getOctokit(session.accessToken);
```

---

## 🗃️ State Architecture

The project uses a strict separation between server state and UI state:

| Concern | Tool | Where |
|---|---|---|
| Repository data | TanStack Query | `src/hooks/use-repos.ts` |
| Write operations | TanStack Query mutations | `src/hooks/use-repo-mutations.ts` |
| Search / filters / sort | Zustand | `src/store/ui-store.ts` |
| Modal open/close | Zustand | `src/store/ui-store.ts` |
| Bulk row selection | Zustand + TanStack Table | `ui-store.ts` + `repo-table.tsx` |

### Zustand Store Shape (`useUIStore`)

```ts
// Search / filter / sort
searchQuery: string
visibilityFilter: "all" | "public" | "private" | "forks" | "sources"
sortBy: "updated" | "name" | "stars" | "forks"
sortDirection: "asc" | "desc"

// Single-repo modals (identified by repo full_name string)
editTargetId: string | null
deleteTargetId: string | null

// Bulk selection (keyed by repo numeric id)
selectedRepoIds: Set<number>
toggleSelected(id: number): void
selectAll(ids: number[]): void
clearSelection(): void

// Bulk delete modal
bulkDeleteOpen: boolean
openBulkDelete(): void
closeBulkDelete(): void
```

> **Never** store `Repository` objects in Zustand. Store only IDs and UI flags.

### DataTable Architecture

Built with **TanStack Table v8** (`@tanstack/react-table`):

- Column definitions live in `repo-table-columns.tsx`, exported as `buildRepoColumns(handlers)` factory.
- `repo-table.tsx` owns the `useReactTable` instance and local state for row selection, sorting, and pagination.
- Row selection is stored in TanStack Table's `RowSelectionState` (keyed by row index string) **and** mirrored to Zustand as `Set<number>` (keyed by `repo.id`). They are bridged by `onRowSelectionChange`.
- `BulkActionBar` reads `selectedRepoIds.size` from Zustand — it does not directly interact with TanStack Table.

### Optimistic Mutations Pattern

All mutations in `use-repo-mutations.ts` follow the same four-callback pattern:

```ts
useMutation({
  mutationFn: ...,
  onMutate: async (vars) => {
    // 1. Cancel in-flight queries
    // 2. Snapshot previous data
    // 3. Apply optimistic update to cache
    // 4. Return snapshot as context
  },
  onError: (err, vars, context) => {
    // Roll back cache to snapshot
    // Show error toast
  },
  onSuccess: () => {
    // Show success toast
  },
  onSettled: () => {
    // Invalidate relevant query keys (keeps cache fresh)
  },
})
```

Never skip `onSettled` — it is the safety net that keeps the cache synchronized with the server even when the optimistic update diverged.

---

## 📐 Conventions

### TypeScript

- **Strict mode is on.** No `any`, no `as unknown as X` unless absolutely unavoidable and commented.
- Always type function return values explicitly in `src/lib/` and `src/app/api/`.
- Use `interface` for object shapes, `type` for unions/intersections.
- Prefer `unknown` over `any` for error handling; narrow with type guards or Zod.

### File Naming

- Files: `kebab-case.tsx` / `kebab-case.ts`
- React components: `PascalCase` named export
- Hooks: `useCamelCase` — always prefixed with `use`
- Stores: `useCamelCaseStore`

### Components

- `src/components/ui/` files are generated by shadcn/ui — **do not edit them directly**. Create wrapper components instead.
- Use `"use client"` only when a component uses browser APIs, event listeners, or React hooks.
- Server Components are the default — prefer RSC whenever possible.
- Use **Zinc palette only** from Tailwind. Do not use `bg-blue-500`, `text-red-500`, or any other non-Zinc color classes. Use semantic CSS variables (`bg-destructive`, `text-muted-foreground`) defined in `src/app/globals.css`.

### API Routes

- Every route handler must call `auth()` at the top and return `401` if no session exists.
- Validate all inputs with Zod before any business logic.
- Return typed `ApiResponse<T>` or `ApiError` shapes — never return raw untyped objects.
- Use `NextResponse.json()` with explicit generics.

---

## 🔒 Security Guardrails

### GitHub Access Token — CRITICAL

> The GitHub OAuth access token **must never reach the client side.**

- `src/lib/auth.ts` and `src/lib/octokit.ts` import `"server-only"` — this is enforced at build time.
- The token is stored in Auth.js's encrypted JWT cookie. `session.accessToken` is intentionally forwarded in the `session` callback so route handlers can read it via `auth()`. **API routes run exclusively on the server** — this is safe.
- Do **not** replace `auth()` + `session.accessToken` with `getToken()` from `next-auth/jwt`. Auth.js v5 changed the session cookie name from `next-auth.session-token` to `authjs.session-token`, which causes `getToken()` to always return `null` and breaks every API route with a 401.
- Do **not** remove `session.accessToken = token.accessToken` from the `session` callback in `auth.ts`.
- **Never:**
  - Pass `accessToken` to a Client Component via props or context.
  - Include `accessToken` in any API response body.
  - Call `useSession()` to obtain a token and pass it to a fetch call.
  - Instantiate `Octokit` in a Client Component or any browser-side hook.

### Input Validation

- Treat URL params (`owner`, `repo`) as untrusted user input — always validate with Zod.
- Reject unknown fields — do not spread unvalidated objects into Octokit calls.
- The delete confirmation (repo name match) is a **UX safeguard only** — the actual deletion is protected by the authenticated server-side Octokit call.

### Environment Variables

- Only `NEXT_PUBLIC_*` variables are safe for client-side access.
- Never log or expose `AUTH_GITHUB_SECRET` or `AUTH_SECRET`.
- Reference `.env.local.example` for all required variables. Never commit `.env.local`.

---

## 🛠️ How to Safely Modify Code

### Adding a new API route

1. Create the file under `src/app/api/`.
2. First line of the handler body: `const session = await auth();` — return `401` if falsy.
3. Add a Zod schema in `src/schemas/` for any new request body.
4. Add a typed Octokit wrapper in `src/lib/octokit.ts` if calling a new GitHub endpoint.
5. Add query keys to `src/hooks/use-repos.ts` (or a new hooks file) for cache invalidation.

### Adding a bulk operation

1. Add the mutation in `src/hooks/use-repo-mutations.ts` following the `onMutate/onError/onSuccess/onSettled` pattern.
2. Extend `useUIStore` if new UI state is needed (e.g. a new modal flag).
3. Wire the trigger in `bulk-action-bar.tsx` — it reads `selectedRepoIds` from Zustand.
4. If a confirmation modal is needed, follow the pattern of `bulk-delete-modal.tsx`.

### Adding a new UI feature

1. Check `src/components/ui/` for existing shadcn/ui primitives.
2. Create new components in the relevant subfolder (`repos/`, `auth/`, `layout/`).
3. UI state (open/close, filters, selection) → `useUIStore` (Zustand).
4. Data mutations → TanStack Query `useMutation` with optimistic updates.

### Adding a DataTable column

- **Do not** edit `repo-table.tsx` to add columns.
- Add column definitions to `repo-table-columns.tsx` inside the `buildRepoColumns(handlers)` factory.

### Modifying existing mutations

Always implement all four callbacks: `onMutate`, `onError`, `onSuccess`, `onSettled`. Never skip any of them.

---

## 🧪 Testing

### Setup

| Tool | Scope | Config |
|---|---|---|
| Vitest | Unit tests | `vitest.config.ts` |
| Playwright | E2E tests | `playwright.config.ts` |

### Running Tests

```bash
bun run test          # Vitest unit tests (run once)
bun run test:watch    # Vitest in watch mode
bun run test:ui       # Vitest with browser UI
bun run test:coverage # Coverage report (threshold: 80%)
bun run test:e2e      # Playwright E2E tests
```

### Coverage

- Provider: `@vitest/coverage-v8`
- Minimum thresholds: **80%** lines, functions, branches, statements
- Excluded from coverage: shadcn/ui primitives, API routes, type files, proxy, auth config, query-client

### Agentic TDD (mandatory)

All code changes involving logic must follow the **Red → Green → Refactor** cycle:

1. **RED** — Write a failing test that describes the expected behavior. Do not write implementation yet.
2. **GREEN** — Write the minimal code required to make that test pass. Nothing more.
3. **REFACTOR** — Improve readability and reduce complexity. All tests must remain green.

> **Never generate a test and its implementation in the same response or step.**

### Test File Locations

- Unit tests: `tests/unit/**/*.{test,spec}.{ts,tsx}`
- E2E tests: `tests/e2e/**/*.spec.ts`
- Global setup: `tests/setup.ts` — mocks `server-only`, configures `@testing-library/jest-dom`

---

## 🚀 Running the Project

```bash
bun run dev       # Development server (http://localhost:3000)
bun run build     # Production build
bun run start     # Production server
bun run lint      # ESLint
```

### Installing Packages

```bash
bun add <package>        # runtime dependency
bun add -d <package>     # dev dependency
```

> Always use `bun`. Do not replace it with `npm`, `yarn`, or `pnpm`.

---

## ❌ What NOT To Do

| Forbidden action | Why |
|---|---|
| Call Octokit in any file without `import "server-only"` | Token leakage risk |
| Remove the `auth()` guard from any API route | Exposes unauthenticated endpoints |
| Replace `auth()` + `session.accessToken` with `getToken()` | Cookie name changed in Auth.js v5 — always returns null |
| Remove `session.accessToken = token.accessToken` from `auth.ts` | Breaks every API route |
| Use `npm`, `yarn`, or `pnpm` in any script or instruction | Project uses Bun exclusively |
| Use non-Zinc Tailwind color classes (`bg-blue-*`, `text-red-*`, etc.) | Violates design system |
| Edit files inside `src/components/ui/` directly | Files are auto-generated by shadcn/ui |
| Expose the GitHub access token to the client in any form | Security critical |
| Skip Zod validation on API route inputs | Input must always be validated server-side |
| Commit `.env.local` — only `.env.local.example` | Secrets must not be in source control |
| Use `any` type | Use `unknown` and narrow with type guards or Zod |
| Store `Repository` objects in Zustand | Only IDs and UI flags in Zustand |
| Use `errorMap` in Zod schemas | This is the Zod v3 API; use `error` (Zod v4) |
| Add DataTable columns inside `repo-table.tsx` | Column definitions belong in `repo-table-columns.tsx` |
| Sync TanStack Table row selection to Zustand by row index | Always map to `repo.id` (number) before calling `toggleSelected` |
| Generate a test and its implementation in the same step | Follow Agentic TDD — RED before GREEN |
| Add packages or dependencies not explicitly requested | YAGNI — only add what is needed |
| Add comments that explain *what* the code does | Only comment non-obvious *why* decisions |
| Skip `onSettled` in a mutation | Cache stays stale — always invalidate |
| Call Octokit from a Client Component or browser-side hook | Server-only client |

---

## 🤖 Prompt Discipline

When working on a specific problem:

- Send only the relevant file/function as context — avoid dumping entire files.
- Request deterministic, minimal changes — prefer **SEARCH / REPLACE** patch format over full rewrites.
- State explicit constraints upfront: if a function must not change its signature, say so before asking for changes.

### Anti-patterns to avoid

| Anti-pattern | Correct approach |
|---|---|
| Duplicated logic copy-pasted across files | Extract to a shared utility or hook |
| Over-engineered abstractions for a single use case | YAGNI — build only what is explicitly needed |
| Excessive comments explaining trivial code | Write self-explanatory code; comment only non-obvious decisions |
| Domain logic inside route handlers or components | Keep GitHub API logic in `src/lib/octokit.ts` |
| Inventing new packages or dependencies | Only use packages already in `package.json` unless explicitly authorized |

---

## 📄 Related Documents

| Document | Audience |
|---|---|
| [`README.md`](../README.md) | End users and contributors |
| [`docs/CLAUDE.md`](CLAUDE.md) | Claude AI agents |
| [`docs/GEMINI.md`](GEMINI.md) | Gemini AI agents |
| [`docs/TUTOR.md`](TUTOR.md) | GitHub Copilot and general AI agents |
| [`CHANGELOG.md`](../CHANGELOG.md) | Release history |
| [`MILESTONES.md`](../MILESTONES.md) | Project phases and acceptance criteria |
