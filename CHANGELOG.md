# Changelog

All notable changes to OctoManager are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Repository list with search, visibility filter, and sort controls
- Visibility toggle (public ↔ private) with optimistic update
- Edit repository modal (name, description, website, topics)
- Delete repository modal with name-confirmation safety check
- Dashboard page with Suspense-based streaming layout
- Landing page with hero section and sign-in CTA
- Login page with GitHub OAuth redirect

---

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
