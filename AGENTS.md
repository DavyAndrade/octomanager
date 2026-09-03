# AGENTS.md

## Quick commands

```bash
bun run dev          # dev server
bun run build        # production build (CI gate)
bun run lint         # eslint
bun run test         # vitest unit tests
bun run test:e2e     # playwright e2e
npx tsc --noEmit     # typecheck (CI runs this separately)
bun add <pkg>        # add runtime dep
bun add -d <pkg>     # add dev dep
```

CI order: `tsc → lint → test → build`. All must pass.

## Architecture

Next.js 16 App Router + React 19 + Bun. Auth via Auth.js v5 (GitHub provider). GitHub API via Octokit v5 (server-only).

```
Browser → TanStack Query hooks → /api/repos/* → auth() + Zod → Octokit → GitHub API
```

Path alias: `@/` → `src/`.

### State rules

- **Server/cache state** (repo data) → TanStack Query (`src/hooks/`)
- **UI state** (search, filters, modals, selection) → Zustand (`src/store/ui-store.ts`)
- Never store `Repository` objects in Zustand — only IDs and flags

### Dependency direction

`components/ → hooks/ → app/api/ → lib/ → schemas/ / types/`

Inner layers must never import outer layers.

## Gotchas

- **Auth.js v5**: never use `getToken()` from `next-auth/jwt`. Cookie name changed → returns null → 401 on every route. Always use `auth()` + `session.accessToken`.
- **`src/lib/octokit.ts`** and **`src/lib/auth.ts`** both have `import "server-only"` — must stay server-side.
- **shadcn/ui primitives** (`src/components/ui/`) are generated — never edit directly. Add wrapper components.
- **Zinc palette only** — use CSS variables from `globals.css`, no raw Tailwind color classes.
- **Zod v4** — uses `error` property, not `errorMap` from Zod v3.
- **DataTable columns** live in `repo-table-columns.tsx`, not `repo-table.tsx`.
- **Row selection bridge**: TanStack Table selection is keyed by row index (string), but Zustand `selectedRepoIds` is keyed by `repo.id` (number). Always convert.
- **`.env.local`** is gitignored; only `.env.local.example` is tracked.

## Testing

- Unit tests: `tests/unit/` — Vitest + jsdom + @testing-library
- E2E tests: `tests/e2e/` — Playwright
- Coverage threshold: 80% lines/functions/branches/statements
- shadcn/ui, API routes, layout/auth components, and complex composites are excluded from unit coverage — covered by e2e instead
- **Agentic TDD**: RED (failing test) → GREEN (minimal impl) → REFACTOR. Never generate test and implementation in the same step.

## Conventions

- Files: `kebab-case.tsx` / `kebab-case.ts`
- Components: `PascalCase` named export
- Hooks: `useCamelCase` (always prefixed `use`)
- Strict TypeScript — no `any`, prefer `unknown` for errors
- `"use client"` only when browser APIs, events, or hooks required
- No unrequested packages or comments explaining what code does
- Commit prefixes: `feat:`, `fix:`, `docs:`, `chore:`, `test:`

## Full reference

See `docs/CLAUDE.md` for detailed architecture, security guardrails, mutation patterns, and anti-patterns.
