# Changelog

All notable changes to OctoManager are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.4.2] — 2026-03-02

### Added
- Dev-mode auto-login via local `gh` CLI token (`GITHUB_DEV_TOKEN` env var)
- `src/components/auth/dev-sign-in-button.tsx` — shown on login page in dev mode
- Auth.js `Credentials` provider (`dev-github`) active only in development

### Fixed
- `AUTH_GITHUB_ID`/`SECRET` providers are now conditionally loaded (no crash when absent)
- `AUTH_SECRET` auto-generated and written to `.env.local` on dev setup

## [0.4.1] — 2026-03-02

### Fixed
- Renamed `src/middleware.ts` → `src/proxy.ts` to resolve Next.js 16 deprecation warning
- Clarified in README that `.env.local` / OAuth App credentials are deployer config, not per-user

## [0.4.0] — 2025-07-04

### Added
- DataTable with TanStack Table: sortable columns, pagination (20/page), row selection
- Bulk select with floating action bar (Framer Motion AnimatePresence)
- Bulk delete modal listing all selected repositories with confirmation
- Bulk toggle visibility (make public / make private) for selected repos
- `useBulkDeleteRepos` and `useBulkToggleVisibility` hooks with optimistic updates
- `selectedRepoIds` (Set<number>), `toggleSelected`, `selectAll`, `clearSelection` in Zustand store
- Dashboard page, landing page, login page, root layout, and protected dashboard layout
- Setup and start scripts: `setup.sh`, `setup.bat`, `start.sh`, `start.bat`
- Vitest config with unit-only include pattern (excludes Playwright e2e)
- Playwright config for e2e tests
- Unit tests: 29 passing (utils + Zod schemas)
- E2e test scaffold: `tests/e2e/auth.spec.ts`

### Fixed
- `octokit.ts`: `null` description/homepage converted to `undefined` for Octokit type compatibility
- `schemas/repo.ts`: `deleteRepoSchema` — migrated Zod v3 `errorMap` to Zod v4 `error` option
- Removed unused `useForm`/`zodResolver`/`deleteRepoSchema` imports from `delete-repo-modal.tsx`

## [0.3.0] — 2026-03-02

### Added
- Zustand `useUIStore` for search, filter, sort, and modal state
- `QueryClient` singleton with retry logic and stale/gc time tuning
- `useRepos` hook — TanStack Query with reactive filters from Zustand
- `useToggleVisibility`, `useUpdateRepo`, `useDeleteRepo` — optimistic mutations with Sonner toasts and cache rollback
- `src/hooks/use-repos.ts`, `src/hooks/use-repo-mutations.ts`

---

## [0.2.0] — 2026-03-02

### Added
- `src/lib/octokit.ts` — server-only Octokit factory with typed wrappers: `listRepos`, `updateRepo`, `deleteRepo`
- Rate-limit and HTTP error mapping (401, 403, 404, 422, 429)
- `GET /api/repos` — list repos with search, type, sort, and pagination
- `PATCH /api/repos/[owner]/[repo]` — update repo metadata and visibility
- `DELETE /api/repos/[owner]/[repo]` — delete repo (auth-gated)

---

## [0.1.0] — 2026-03-02

### Added
- Project scaffold: Next.js 16 (App Router), TypeScript strict mode, React 19, Bun runtime
- All runtime and dev dependencies installed
- `next.config.ts` — security headers and GitHub avatar image domain
- `src/app/globals.css` — Zinc design token CSS variables for Tailwind v4 (light + dark)
- `components.json` — shadcn/ui config (zinc theme, CSS variables)
- `.env.local.example` with documented required variables
- `.gitignore` updated to track `.env.local.example`
- `src/types/github.ts` — `Repository`, `RepoOwner`, `RepoUpdatePayload`, `RepoVisibility`, `RepoListParams`
- `src/types/auth.ts` — extended `Session` with `accessToken` and `user.login`
- `src/types/api.ts` — `ApiResponse<T>`, `ApiError`, `PaginatedResponse<T>`
- `src/schemas/repo.ts` — Zod: `updateRepoSchema`, `deleteRepoSchema`, `repoListParamsSchema`
- `src/lib/auth.ts` — Auth.js v5 GitHub provider, JWT/session callbacks, custom sign-in page
- `src/app/api/auth/[...nextauth]/route.ts` — Auth.js route handler
- `src/middleware.ts` — route protection and authenticated redirects
- `src/lib/utils.ts` — `cn()`, `formatRepoCount()`, `formatRelativeTime()`, `slugify()`
- `README.md` — full project documentation
- `MILESTONES.md` — phased roadmap with per-task acceptance criteria
- `CHANGELOG.md` (this file)
- `LICENSE` — MIT
- `docs/CLAUDE.md` — architecture, conventions, and security guardrails for Claude AI agents
- `docs/GEMINI.md` — architecture, conventions, and security guardrails for Gemini AI agents

[Unreleased]: https://github.com/your-org/octomanager/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/your-org/octomanager/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/your-org/octomanager/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/your-org/octomanager/releases/tag/v0.1.0
