# CLAUDE.md — AI Agent Guide for OctoManager

This document is intended for Claude AI agents working on the OctoManager codebase. Read it entirely before making any changes.

---

## 🏗️ Project Architecture

OctoManager is a Next.js 16 (App Router) application that allows authenticated GitHub users to manage their repositories. It is built with:

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
│   ├── auth/              Auth-related UI (sign-in button)
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
├── hooks/                 TanStack Query hooks (client-side)
├── lib/
│   ├── auth.ts            Auth.js config — server-only
│   ├── octokit.ts         GitHub API client — server-only
│   ├── query-client.ts    TanStack Query singleton
│   └── utils.ts           Shared utilities (cn, formatters)
├── schemas/               Zod validation schemas
├── store/                 Zustand stores (UI state only)
│   └── ui-store.ts        search, filter, sort, modal IDs, bulk selection
├── types/                 TypeScript interfaces and types
└── proxy.ts               Route protection (Next.js 16 proxy convention)
```

### Dependency Direction

Dependencies must flow **inward**: outer layers may import from inner layers, never the reverse.

```
components/ → hooks/ → app/api/ → lib/ → schemas/ / types/
```

- `src/lib/` (auth, octokit, utils) must not import from `components/`, `hooks/`, or `app/`.
- `src/hooks/` must not import from `components/` or `app/api/`.
- `src/schemas/` and `src/types/` must not import from any other local layer.

Forbidden examples:
- An Octokit wrapper importing a React hook
- A Zod schema importing a UI component
- `src/lib/` importing framework-specific route objects

---

### Zustand Store Shape

`useUIStore` (`src/store/ui-store.ts`) manages **UI-only** state:

```ts
// Search / filter / sort
searchQuery: string
visibilityFilter: "all" | "public" | "private" | "forks" | "sources"
sortBy: "updated" | "name" | "stars" | "forks"

// Single-repo modals (store repo full_name as string ID)
editingRepoId: string | null
deletingRepoId: string | null

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

> **Never** store `Repository` objects in Zustand. Only IDs and UI flags.

### DataTable Architecture

The repository list is built with **TanStack Table v8** (`@tanstack/react-table`):

- Column definitions live in `repo-table-columns.tsx` — exported as `buildRepoColumns(handlers)` factory.
- `repo-table.tsx` owns the `useReactTable` instance, row selection state, sorting state, and pagination state.
- Row selection is stored as TanStack Table's `RowSelectionState` (keyed by row index string) **and** mirrored to Zustand as `Set<number>` (keyed by `repo.id`). The bridge is the `onRowSelectionChange` handler.
- The floating `BulkActionBar` reads `selectedRepoIds.size` from Zustand to decide visibility; it does not talk to TanStack Table directly.

---

## 📐 Conventions

### TypeScript
- **Strict mode is on.** No `any`, no `as unknown as X` unless absolutely unavoidable and commented.
- Always type function return values explicitly in `src/lib/` and `src/app/api/`.
- Use `interface` for object shapes, `type` for unions/intersections.
- Prefer `unknown` over `any` for error handling.

### File Naming
- Files: `kebab-case.tsx` / `kebab-case.ts`
- React components: `PascalCase` named export
- Hooks: `useCamelCase` — always prefixed with `use`
- Stores: `useCamelCaseStore`

### Components
- All components in `src/components/ui/` are generated by shadcn/ui — **do not edit them directly**. Add a new wrapper component instead.
- Use `"use client"` only when a component requires browser APIs, event handlers, or React hooks.
- Server Components are the default — keep them as RSC when possible.
- Use Tailwind **Zinc palette only**. No other color utility classes (e.g. no `bg-blue-500`, no `text-red-500` — use `bg-destructive` instead).
- Use CSS variables defined in `globals.css` for all theming.

### API Routes
- Every route handler must call `auth()` at the top and return `401` if no session.
- Validate all inputs with Zod before any business logic.
- Return typed `ApiResponse<T>` or `ApiError` — never return raw untyped objects.
- Use `NextResponse.json()` with explicit generics.

### State
- **Server state** (repo data) → TanStack Query only.
- **UI state** (search, filters, modal open/close) → Zustand only.
- Never store server data in Zustand. Never store UI toggle state in TanStack Query cache.

---

## 🔒 Security Guardrails

### GitHub Access Token — CRITICAL

> The GitHub OAuth access token **must never reach the client side.**

- `src/lib/auth.ts` and `src/lib/octokit.ts` both import `"server-only"`.
- The token is stored in the encrypted JWT cookie by Auth.js. `session.accessToken` is **intentionally** forwarded in the `session` callback so that server-side route handlers can read it via `auth()`. This is safe — API routes run exclusively on the server.
- Do **not** replace `auth()` + `session.accessToken` with `getToken()` from `next-auth/jwt`. Auth.js v5 changed the session cookie name from `next-auth.session-token` to `authjs.session-token`, which causes `getToken()` to return `null` and breaks every API route with a 401.
- Do **not** remove `session.accessToken = token.accessToken` from the `session` callback in `auth.ts`.
- Do **not** expose `session.accessToken` via any Client Component, `useSession()`, or JSON response body.
- Do **not** add `accessToken` to any API response body.
- Do **not** call Octokit from a Client Component or a custom hook that runs in the browser.

### Input Validation
- Always parse route params (`owner`, `repo`) — they come from the URL and must be treated as untrusted.
- Strip or reject any payload fields not defined in the Zod schema.
- Repo name in delete confirmation must be matched server-side via the Octokit delete call — the UI confirmation is UX only.

### Environment Variables
- Only `NEXT_PUBLIC_*` variables may be used client-side.
- Never log `AUTH_GITHUB_SECRET` or `AUTH_SECRET`.
- See `.env.local.example` for the required variables.

---

## 🛠️ How to Safely Modify Code

### Adding a new API route
1. Create the file under `src/app/api/`.
2. Start with `const session = await auth();` and guard with `401`.
3. Add a Zod schema in `src/schemas/` if it validates a new payload shape.
4. Add a typed Octokit wrapper in `src/lib/octokit.ts` if needed.
5. Add or update query keys in `src/hooks/use-repos.ts`.

### Adding a bulk operation
1. Add the mutation in `src/hooks/use-repo-mutations.ts` (follow the same `onMutate`/`onError`/`onSuccess`/`onSettled` pattern).
2. Extend `useUIStore` if new UI state is needed (e.g. a new modal flag).
3. Wire the trigger in `bulk-action-bar.tsx` — it reads `selectedRepoIds` from Zustand.
4. If a confirmation modal is needed, follow the pattern of `bulk-delete-modal.tsx`.

### Adding a new UI feature
1. Check if a shadcn/ui component already covers the need (`src/components/ui/`).
2. If not, create a new component in the relevant subfolder (`repos/`, `auth/`, `layout/`).
3. Use `useUIStore` for any modal/filter/selection state.
4. Use a TanStack Query mutation for any write operation.
5. Implement optimistic updates if the operation is frequent (e.g. toggle visibility).

### Modifying existing mutations
- Always implement `onMutate` (optimistic), `onError` (rollback), `onSuccess` (toast), and `onSettled` (invalidate).
- Do not skip `onSettled` — it ensures the cache stays fresh even if the optimistic update diverged.

### Running the project
```bash
bun run dev       # development server
bun run build     # production build
bun run lint      # ESLint
bun run test      # Vitest unit tests
bun run test:e2e  # Playwright e2e tests
```

### Installing packages
```bash
bun add <package>        # runtime dependency
bun add -d <package>     # dev dependency
```

---

## ❌ Things Claude Must NOT Do

- Do not call Octokit from any file without `import "server-only"`.
- Do not remove the `auth()` guard from any API route.
- Do not replace `auth()` + `session.accessToken` with `getToken()` from `next-auth/jwt` — Auth.js v5 changed the cookie name and this breaks all API routes.
- Do not remove `session.accessToken = token.accessToken` from the `session` callback in `auth.ts`.
- Do not replace `bun` with `npm`, `yarn`, or `pnpm` in any script or instruction.
- Do not add non-Zinc Tailwind color classes.
- Do not edit files inside `src/components/ui/` — add wrappers instead.
- Do not store the GitHub access token in `localStorage`, a cookie set manually, or any client-accessible state.
- Do not skip Zod validation on API inputs.
- Do not commit `.env.local` — only `.env.local.example`.
- Do not store `Repository` objects in Zustand — only IDs and UI flags.
- Do not use `errorMap` in Zod schemas (Zod v4 uses `error` instead).
- Do not add columns to the DataTable by editing `repo-table.tsx` directly — column definitions live in `repo-table-columns.tsx`.
- Do not sync row selection from TanStack Table to Zustand by comparing indices — always convert to `repo.id` (numeric) before calling `toggleSelected`.
- Do not generate a test and its implementation in the same step — follow Agentic TDD (see below).
- Do not add packages or dependencies that were not explicitly requested.
- Do not add comments that explain *what* the code does — only add comments for non-obvious *why* decisions.

---

## 🤖 AI Development Rules

### Agentic TDD (mandatory)

All code changes involving logic must follow the Red → Green → Refactor cycle:

1. **RED** — Write a failing test that describes the expected behavior. Do not write implementation yet.
2. **GREEN** — Write the minimal code required to make that test pass. Nothing more.
3. **REFACTOR** — Improve readability and reduce complexity. All tests must remain green.

> Never generate a test and its implementation in the same response or step.

### Prompt discipline

When working on a specific problem:

- Send only the relevant file/function as context — avoid dumping entire files.
- Request deterministic, minimal changes — prefer **SEARCH / REPLACE** patch format over full rewrites.
- Explicit constraints must be stated: if a function must not change its signature, say so.

### Anti-patterns to avoid

| Anti-pattern | Correct approach |
|---|---|
| Duplicated logic copy-pasted across files | Extract to a shared utility or hook |
| Over-engineered abstractions for a single use case | YAGNI — build only what is explicitly needed |
| Excessive comments explaining trivial code | Write self-explanatory code; comment only non-obvious decisions |
| Domain logic inside route handlers or components | Keep GitHub API logic in `src/lib/octokit.ts` |
| Inventing new packages or dependencies | Only use packages already in `package.json` unless explicitly authorized |
