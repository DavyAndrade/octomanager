# GEMINI.md — AI Agent Guide for OctoManager

This document is intended for Gemini AI agents working on the OctoManager codebase. Read it entirely before making any changes.

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

### Zustand Store Shape

`useUIStore` (`src/store/ui-store.ts`) manages **UI-only** state:

```ts
// Search / filter / sort
searchQuery: string
visibilityFilter: "all" | "public" | "private" | "forks" | "sources"
sortBy: "updated" | "name" | "stars" | "forks"

// Single-repo modals (identified by repo full_name string)
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

The repository list uses **TanStack Table v8** (`@tanstack/react-table`):

- Column definitions live in `repo-table-columns.tsx` — exported as `buildRepoColumns(handlers)` factory.
- `repo-table.tsx` owns the `useReactTable` instance and local state for row selection, sorting, and pagination.
- Row selection is stored in TanStack Table's `RowSelectionState` (keyed by row index string) **and** mirrored to Zustand as `Set<number>` (keyed by `repo.id`). They are bridged by `onRowSelectionChange`.
- `BulkActionBar` reads `selectedRepoIds.size` from Zustand — it does not directly interact with TanStack Table.

---

## 📐 Conventions

### TypeScript
- **Strict mode is on.** Avoid `any`. Use `unknown` for error catching.
- Always type function return values explicitly in `src/lib/` and `src/app/api/`.
- Use `interface` for object shapes, `type` for unions/intersections.

### File Naming
- Files: `kebab-case.tsx` / `kebab-case.ts`
- React components: `PascalCase` named export
- Hooks: `useCamelCase` — always prefixed with `use`
- Stores: `useCamelCaseStore`

### Components
- `src/components/ui/` files are auto-generated by shadcn/ui — **do not edit them**. Create wrapper components instead.
- Use `"use client"` only when a component uses browser APIs, event listeners, or React hooks.
- Server Components are the default — prefer RSC when possible.
- Use **Zinc palette only** from Tailwind. Do not use blue, red, green, or any other color classes directly — use semantic variables (`bg-destructive`, `text-muted-foreground`, etc.) defined in `src/app/globals.css`.

### API Routes
- Every route handler must call `auth()` at the top and return `401` if no session.
- Validate all inputs with Zod before any business logic.
- Return typed `ApiResponse<T>` or `ApiError` shapes.

### State Management
- **Server state** (repositories, user data) → TanStack Query only.
- **UI state** (search, filters, modal state) → Zustand only.
- These two layers must remain separate — do not mix them.

---

## 🔒 Security Guardrails

### GitHub Access Token — CRITICAL

> The GitHub OAuth access token **must never reach the client side.**

- `src/lib/auth.ts` and `src/lib/octokit.ts` use `import "server-only"` to enforce this at build time.
- The token lives in the JWT cookie, managed by Auth.js. It is accessed only via `auth()` in server contexts.
- **Never:**
  - Pass `accessToken` to a Client Component via props or context.
  - Include `accessToken` in any API response body.
  - Call `useSession()` to obtain a token and pass it to a fetch call.
  - Instantiate `Octokit` in a Client Component or a browser-side hook.

### Input Validation
- Treat URL params (`owner`, `repo`) as untrusted user input — always validate.
- Reject unknown fields by using Zod's `strict()` or by not spreading unvalidated objects.
- The delete confirmation (repo name match) is a UX safeguard — the actual deletion is controlled by the authenticated Octokit call server-side.

### Environment Variables
- Only `NEXT_PUBLIC_*` variables are safe for client-side access.
- Never log or expose `AUTH_GITHUB_SECRET` or `AUTH_SECRET`.
- Reference `.env.local.example` for all required variables.

---

## 🛠️ How to Safely Modify Code

### Adding a new API route
1. Create the file under `src/app/api/`.
2. First line of handler body: `const session = await auth();` — return `401` if falsy.
3. Add a Zod schema in `src/schemas/` for any new request body.
4. Add a typed Octokit wrapper in `src/lib/octokit.ts` if calling a new GitHub endpoint.
5. Add query keys to `src/hooks/use-repos.ts` (or a new hooks file) for cache management.

### Adding a bulk operation
1. Add the mutation in `src/hooks/use-repo-mutations.ts`.
2. Extend `useUIStore` if new UI state is needed (e.g. a new modal flag).
3. Wire the trigger in `bulk-action-bar.tsx` — it reads `selectedRepoIds` from Zustand.
4. If a confirmation modal is needed, follow the pattern of `bulk-delete-modal.tsx`.

### Adding a new UI feature
1. Check `src/components/ui/` for existing shadcn/ui primitives.
2. Create new components in `src/components/repos/`, `auth/`, or `layout/`.
3. UI state (open/close, filters) → `useUIStore` (Zustand).
4. Data mutations → TanStack Query `useMutation` with optimistic updates.

### Modifying existing mutations
Every mutation should implement all four callbacks:
- `onMutate` — apply optimistic update, snapshot previous data
- `onError` — roll back to snapshot, show error toast
- `onSuccess` — show success toast
- `onSettled` — invalidate relevant query keys

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

## ❌ Things Gemini Must NOT Do

- Do not use Octokit in any file that doesn't have `import "server-only"`.
- Do not remove the `auth()` guard from any API route handler.
- Do not replace Bun with npm, yarn, or pnpm in scripts or documentation.
- Do not use non-Zinc Tailwind color classes (no `bg-blue-*`, `text-green-*`, etc.).
- Do not modify files inside `src/components/ui/` directly.
- Do not expose the GitHub access token to the client in any form.
- Do not skip Zod validation on API route inputs.
- Do not commit `.env.local` to version control — only `.env.local.example`.
- Do not use `any` type — use `unknown` and narrow with guards or Zod.
- Do not store `Repository` objects in Zustand — only IDs and UI flags.
- Do not use `errorMap` in Zod schemas — this is Zod v3 API. Use `error` (Zod v4).
- Do not add DataTable columns in `repo-table.tsx` — column definitions belong in `repo-table-columns.tsx`.
- Do not sync TanStack Table row selection to Zustand by row index — always map to `repo.id` (number).
