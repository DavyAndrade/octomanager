# OctoManager — Milestones

Development is broken into 7 phases. Each phase maps directly to one or more git commits and has explicit acceptance criteria that define "done".

> **How to use this file:** Work through each task in order. Every phase ends with a commit. Check off tasks as you complete them. Update `CHANGELOG.md` at the end of each phase.

---

## Phase 1 — Base Setup

**Branch:** `main`
**Commit prefix:** `chore:` / `build:`
**Goal:** Production-ready scaffold with all tooling configured and documented.

### Tasks
- [x] Install runtime dependencies: `next-auth`, `octokit`, `@tanstack/react-query`, `zod`, `zustand`, `react-hook-form`, `@hookform/resolvers`, `framer-motion`, `server-only`, `sonner`, `lucide-react`
- [x] Install dev dependencies: `vitest`, `@vitejs/plugin-react`, `@vitest/ui`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `@playwright/test`, `msw`
- [x] Configure `next.config.ts` — security headers, GitHub avatar image domain
- [x] Configure `src/app/globals.css` — Zinc CSS variables for Tailwind v4 (light + dark)
- [x] Create `components.json` for shadcn/ui (zinc theme, CSS variables)
- [x] Create `.env.local.example` with all required variables documented
- [x] Add `!.env.local.example` exception to `.gitignore`
- [x] Add `vitest.config.ts`, `playwright.config.ts` (configured but not yet used)
- [x] Add `test`, `test:ui`, `test:e2e`, `test:coverage` scripts to `package.json`

### Acceptance Criteria
- `bun install` runs without errors
- `bun run build` or `bun run lint` exits 0
- `.env.local.example` is tracked by git
- `globals.css` defines all Zinc design tokens

**Commit:** `chore: project setup — deps, tooling, env template`

---

## Phase 2 — Documentation & AI Agent Guides

**Commit prefix:** `docs:`
**Goal:** Full project documentation that serves both human contributors and AI coding agents.

### Tasks
- [x] Write `README.md` — project description, tech stack, env vars, setup (manual + scripts), testing, deployment, contributing
- [x] Write `MILESTONES.md` (this file) — phased roadmap with acceptance criteria
- [x] Write `docs/CLAUDE.md` — architecture, conventions, security guardrails for Claude agents
- [x] Write `docs/GEMINI.md` — same guide for Gemini agents
- [x] Write `LICENSE` (MIT)
- [x] Create `CHANGELOG.md` following Keep a Changelog format

### Acceptance Criteria
- All docs reference the correct file paths and scripts
- `docs/CLAUDE.md` and `docs/GEMINI.md` each contain: architecture overview, conventions, security guardrails, forbidden actions

**Commit:** `docs: add README, MILESTONES, CHANGELOG, LICENSE, AI agent guides`

---

## Phase 3 — Types, Schemas & Auth

**Commit prefix:** `feat:`
**Goal:** Type-safe foundation and working GitHub OAuth authentication.

### Tasks
- [x] `src/types/github.ts` — `Repository`, `RepoOwner`, `RepoUpdatePayload`, `RepoVisibility`, `RepoListParams`
- [x] `src/types/auth.ts` — extended `Session` with `accessToken` and `user.login`
- [x] `src/types/api.ts` — `ApiResponse<T>`, `ApiError`, `PaginatedResponse<T>`
- [x] `src/schemas/repo.ts` — Zod schemas: `updateRepoSchema`, `deleteRepoSchema`, `repoListParamsSchema`
- [x] `src/lib/auth.ts` — Auth.js config: GitHub provider, `jwt` + `session` callbacks, custom sign-in page
- [x] `src/app/api/auth/[...nextauth]/route.ts` — export `GET` and `POST` handlers
- [x] `src/proxy.ts` — route protection (replaces `src/middleware.ts`; Next.js 16 proxy convention)
- [x] `src/lib/utils.ts` — `cn()`, `formatRepoCount()`, `formatRelativeTime()`, `slugify()`

### Acceptance Criteria
- TypeScript compiles with zero errors on these files
- `session.accessToken` is populated after sign-in (server-side only)
- Visiting `/dashboard` while logged out redirects to `/login`
- `/api/repos` without session returns `401`

**Commit:** `feat: add types, Zod schemas, Auth.js GitHub OAuth, and middleware`

---

## Phase 4 — GitHub API Layer

**Commit prefix:** `feat:`
**Goal:** Fully typed, error-handled server-side GitHub API with REST endpoints.

### Tasks
- [x] `src/lib/octokit.ts` — `server-only`, `getOctokit(token)` factory, `listRepos`, `updateRepo`, `deleteRepo`, rate-limit + HTTP error mapping
- [x] `src/app/api/repos/route.ts` — `GET` handler: list repos with search, type, sort, pagination
- [x] `src/app/api/repos/[owner]/[repo]/route.ts` — `PATCH` handler: update repo, `DELETE` handler: delete repo
- [ ] Manual smoke test: `GET /api/repos` returns repo list after sign-in

### Acceptance Criteria
- `src/lib/octokit.ts` cannot be imported client-side (enforced by `server-only`)
- All handlers validate inputs with Zod and return typed `ApiResponse<T>`
- `404`, `403`, `401`, `429` GitHub errors map to correct HTTP status codes
- No access token in any response body

**Commit:** `feat: implement Octokit integration and GitHub API routes`

---

## Phase 5 — State Management & Query Hooks

**Commit prefix:** `feat:`
**Goal:** Client-side data layer with caching, optimistic updates, and UI state.

### Tasks
- [x] `src/lib/query-client.ts` — singleton `QueryClient` with retry logic, stale/gc times
- [x] `src/store/ui-store.ts` — Zustand: search query, visibility filter, sort, modal state (delete/edit target)
- [x] `src/hooks/use-repos.ts` — `useRepos(page)`, query key factory `repoKeys`
- [x] `src/hooks/use-repo-mutations.ts` — `useToggleVisibility`, `useUpdateRepo`, `useDeleteRepo` — all with optimistic updates and Sonner toasts

### Acceptance Criteria
- Toggling visibility updates the UI immediately without a loading spinner
- On mutation error, the cache is rolled back to the previous state
- `useRepos` re-fetches when `searchQuery`, `visibilityFilter`, or `sortBy` changes

**Commit:** `feat: add Zustand store, QueryClient, and TanStack Query hooks`

---

## Phase 6 — UI Layer

**Commit prefix:** `feat:`
**Goal:** Complete, accessible, and responsive repository management interface.

### Tasks
- [x] Init shadcn/ui: `button`, `badge`, `dialog`, `input`, `textarea`, `label`, `separator`, `avatar`, `dropdown-menu`, `tooltip`, `card`, `skeleton`, `switch`, `form`, `select`
- [x] `src/components/layout/providers.tsx` — `SessionProvider` + `QueryClientProvider` + `Toaster`
- [x] `src/components/layout/app-header.tsx` — logo, user avatar, dropdown (profile, sign out)
- [x] `src/components/auth/sign-in-button.tsx`
- [x] `src/components/repos/search-bar.tsx` — debounced input (300ms), clear button
- [x] `src/components/repos/filter-bar.tsx` — visibility filter + sort selector + reset
- [x] `src/components/repos/visibility-toggle.tsx` — Switch with optimistic feedback and tooltip
- [x] `src/components/repos/delete-repo-modal.tsx` — Dialog with repo name confirmation
- [x] `src/components/repos/edit-repo-modal.tsx` — Dialog form (React Hook Form + Zod)
- [x] `src/components/repos/repo-card.tsx` — card with badges, stats, action buttons
- [x] `src/components/repos/repo-list.tsx` — DataTable wrapper with `AnimatePresence` (Framer Motion)
- [x] `src/components/repos/repo-list-skeleton.tsx` — loading skeleton for repo list
- [x] `src/components/repos/empty-state.tsx` — shown when no repos match
- [x] `src/components/repos/error-state.tsx` — shown on fetch error
- [x] `src/components/repos/repo-table-columns.tsx` — TanStack Table column definitions
- [x] `src/components/repos/repo-table.tsx` — DataTable with sorting, pagination, bulk row selection
- [x] `src/components/repos/bulk-action-bar.tsx` — floating Framer Motion bar for bulk operations
- [x] `src/components/repos/bulk-delete-modal.tsx` — bulk delete confirmation dialog
- [x] `src/hooks/use-repo-mutations.ts` extended with `useBulkDeleteRepos`, `useBulkToggleVisibility`
- [x] `src/store/ui-store.ts` extended with bulk selection state (`selectedRepoIds`, `toggleSelected`, `selectAll`, `clearSelection`, `bulkDeleteOpen`)
- [x] `src/app/layout.tsx` — root layout with `Providers` wrapper
- [x] `src/app/page.tsx` — landing page with hero, features, `SignInButton`
- [x] `src/app/(auth)/login/page.tsx` — minimal sign-in page
- [x] `src/app/(dashboard)/layout.tsx` — protected layout with `AppHeader`
- [x] `src/app/(dashboard)/dashboard/page.tsx` — dashboard with `<Suspense>` + SearchBar + FilterBar + RepoList

### Acceptance Criteria
- Dashboard renders repo list from GitHub API
- Search + filter work and update the list
- Visibility toggle works with optimistic UI
- Edit modal pre-fills form and submits changes
- Delete modal requires typing repo name before enabling confirm button
- Skeleton shown during loading; empty state when filtered to zero results; error state on failure
- Fully keyboard navigable (Tab, Enter, Escape)

**Commit:** `feat: implement full UI — components, pages, and layout`

---

## Phase 7 — Scripts, Tests & Open Source Readiness

**Commit prefix:** `chore:` / `test:`
**Goal:** Fully automated setup, test coverage, and ready for public contributors.

### Tasks
- [x] `scripts/setup.sh` — `bun install`, copy `.env.local.example` → `.env.local`, print next steps
- [x] `scripts/setup.bat` — Windows equivalent
- [x] `scripts/start.sh` — `bun run dev`
- [x] `scripts/start.bat` — Windows equivalent
- [x] `vitest.config.ts` — jsdom env, path aliases, unit-only include pattern, coverage config
- [x] `playwright.config.ts` — Chromium, base URL, CI config
- [x] `tests/unit/utils.test.ts` — unit tests for `formatRepoCount`, `formatRelativeTime`, `slugify`
- [x] `tests/unit/schemas.test.ts` — Zod schema validation tests (valid + invalid cases)
- [x] `tests/e2e/auth.spec.ts` — e2e: unauthenticated redirect, sign-in flow
- [x] Add `test`, `test:e2e`, `test:coverage` scripts to `package.json`
- [x] Final `bun run build` passes with zero TypeScript errors

### Acceptance Criteria
- `./scripts/setup.sh` fully bootstraps a fresh clone
- `bun run test` passes all unit tests
- `bun run build` exits 0 with no type errors
- Repository is ready to be made public

**Commit:** `chore: add setup scripts, test infrastructure, and finalize open source prep`

---

## Backlog — Planned Features

Items below follow the same conventions as Phases 1–7 and the rules in `docs/CLAUDE.md`:
- Each item has an explicit **Branch**, **Commit prefix**, and **Acceptance Criteria**.
- Tasks are ordered by **Agentic TDD**: RED (failing test) → GREEN (minimal implementation) → REFACTOR.
- State rules apply: UI state → Zustand; server/cache state → TanStack Query.
- Zinc-only Tailwind palette. No edits to `src/components/ui/`.
- Listed in order of priority.

---

### 🔴 P1 — Mobile Responsiveness

**Branch:** `feat/mobile-responsive`
**Commit prefix:** `feat:`
**Goal:** The application currently breaks on small screens. Make the full UI responsive across mobile, tablet, and desktop viewports without altering any existing logic.

### Tasks

#### RED — Playwright e2e tests (write first, before any implementation)
- [ ] `tests/e2e/responsive.spec.ts` — viewport 375px: assert no horizontal overflow (`document.documentElement.scrollWidth <= 375`)
- [ ] assert `AppHeader` renders without overflow at 375px
- [ ] assert all modal triggers (edit, delete) are reachable and have `min-height: 44px`

#### GREEN — Implementation (only after tests are written and failing)
- [ ] `src/components/repos/repo-table.tsx` — hide less-critical columns on small screens (use `hidden sm:table-cell` pattern); consider card-based fallback below `sm` breakpoint
- [ ] `src/components/layout/app-header.tsx` — collapse nav to hamburger/avatar-only below `sm`; no new state needed beyond existing Zustand store
- [ ] `src/components/repos/bulk-action-bar.tsx` — ensure the floating bar does not overflow at narrow widths
- [ ] `src/components/repos/filter-bar.tsx` — wrap selects on small viewports (`flex-wrap` already present; verify it is sufficient)
- [ ] `src/components/repos/search-bar.tsx` — full-width on mobile (`w-full sm:w-auto`)
- [ ] `src/components/repos/delete-repo-modal.tsx`, `edit-repo-modal.tsx` — ensure dialogs are scrollable and inputs are tappable on mobile

#### REFACTOR
- [ ] Extract any repeated breakpoint class groups into a shared constant or Tailwind `@apply` block in `globals.css` if it reduces duplication meaningfully

### Architectural Notes
- Use only Tailwind responsive prefixes (`sm:`, `md:`, `lg:`). No inline styles.
- Zinc palette only — no new color utilities.
- Do not add new packages.

### Acceptance Criteria
- No horizontal overflow (`scrollWidth > clientWidth`) at 375px (iPhone SE) or 390px (iPhone 14)
- All interactive elements meet 44×44px minimum touch target
- `bun run test` (Vitest) and `bun run test:e2e` (Playwright) pass
- `bun run build` exits 0 with no TypeScript errors

---

### 🟡 P2 — Pagination Numbers

**Branch:** `feat/pagination-numbers`
**Commit prefix:** `feat:`
**Goal:** Improve navigation UX by showing numbered page buttons alongside the existing prev/next controls, matching GitHub's pagination style.

### Tasks

#### RED — Unit tests (write first)
- [ ] `tests/unit/pagination.test.tsx` — test a `buildPageRange(current, total)` utility:
  - returns `[1, 2, 3, '…', 9, 10]` for current=1, total=10
  - returns `[1, '…', 4, 5, 6, '…', 10]` for current=5, total=10
  - returns `[1, 2, 3, 4, 5]` for total≤5 (no ellipsis)
- [ ] test that clicking a page number calls `setPage(n)` (mock Zustand action)

#### GREEN — Implementation
- [ ] `src/lib/utils.ts` — add `buildPageRange(current: number, total: number): (number | '…')[]`
- [ ] `src/components/repos/repo-table.tsx` — replace or extend the existing prev/next footer with numbered buttons using `buildPageRange`; active page uses `variant="default"`, others use `variant="outline"`; ellipsis rendered as a non-interactive `<span>`

#### REFACTOR
- [ ] Extract the pagination row into `src/components/repos/pagination-bar.tsx` if it grows beyond ~30 lines

### Architectural Notes
- Page state lives in `repo-table.tsx` (TanStack Table's `pagination` state) — do **not** move it to Zustand.
- `buildPageRange` is a pure utility: add it to `src/lib/utils.ts` alongside existing formatters.
- Use only existing shadcn/ui `Button` — do not install a pagination package.

### Acceptance Criteria
- Numbered buttons appear between prev/next arrows
- Active page is visually distinct (`variant="default"`)
- Ellipsis shown for ranges with > 5 pages
- Clicking any number navigates directly to that page
- `bun run test` passes including the new `pagination.test.tsx`

---

### 🟢 P3 — "Buy Me a Coffee" on Landing Page

**Branch:** `feat/buy-me-a-coffee`
**Commit prefix:** `feat:`
**Goal:** Replace the "Open Source" highlight on the landing page with a "Buy Me a Coffee" link so visitors can contribute financially.

### Tasks

#### RED — Unit/component test (write first)
- [ ] `tests/unit/components.test.tsx` — add: renders a link with `href` containing `buymeacoffee.com` and `target="_blank"` on the landing page

#### GREEN — Implementation
- [ ] `src/app/page.tsx` — replace the "Open Source" feature highlight with a BMAC button/badge; use an `<a>` with `target="_blank" rel="noopener noreferrer"`
- [ ] `README.md` — add BMAC badge below the project title

#### REFACTOR
- [ ] If the badge is reused elsewhere, extract to `src/components/ui/buy-me-a-coffee.tsx`

### Architectural Notes
- `src/app/page.tsx` is a Server Component — keep it as RSC (no `"use client"`).
- Style using Zinc tokens or the official BMAC badge image. No new color utilities.
- No new packages.

### Acceptance Criteria
- Link opens the correct Buy Me a Coffee profile URL in a new tab
- `rel="noopener noreferrer"` present on the anchor
- Renders correctly in both light and dark mode
- `bun run test` passes including the new test

---

### 🟢 P4 — GitHub-style Filter Revamp

**Branch:** `feat/github-style-filters`
**Commit prefix:** `feat:`
**Goal:** Replace the current two-dropdown filter bar (Visibility + Sort) with three dropdowns matching GitHub's layout: **Type**, **Language**, and **Sort**.

### Tasks

#### RED — Unit tests (write first)
- [ ] `tests/unit/store.test.ts` — add: `languageFilter` defaults to `""` (all); `setLanguageFilter` updates it; `resetFilters` resets it to `""`
- [ ] `tests/unit/search-filter.test.tsx` — add: `FilterBar` renders three selects (Type, Language, Sort); Language dropdown shows only languages derived from the repo list; Reset appears only when any filter differs from default

#### GREEN — Implementation (only after above tests are red)
- [ ] `src/types/github.ts` — add `RepoTypeFilter` values if changed; add `RepoLanguageFilter = string`
- [ ] `src/store/ui-store.ts` — add `languageFilter: string`, `setLanguageFilter(l: string): void`; update `resetFilters` to reset it; update `defaultState`
- [ ] `src/hooks/use-repos.ts` — derive available languages from the paginated result (`useMemo` over `data.items`); apply `languageFilter` as a client-side post-filter (do **not** add a new API param — `repository.language` is already in the response)
- [ ] `src/components/repos/filter-bar.tsx` — replace two selects with three: Type (consolidates current visibility options into `all | public | private | sources | forks`), Language (dynamic, from hook), Sort (`pushed` | `updated` | `full_name` | `stars`); update `isFiltered` logic
- [ ] `src/lib/octokit.ts` — no change needed for language (client-side filter); if Sort by Stars is desired server-side, GitHub API does not support `sort=stars` for `listForAuthenticatedUser` — keep stars sort as client-side only
- [ ] Update all references to old `visibilityFilter` values (`"owner"`, `"all"`) if renamed

#### REFACTOR
- [ ] If `filter-bar.tsx` exceeds ~120 lines, extract each select into its own sub-component under `src/components/repos/`

### Architectural Notes
- **Language filter is client-side only** — derived from `repository.language` in the already-fetched page. Do not add a `language` param to the API route or Zod schema.
- **Stars sort is client-side only** — GitHub API `listForAuthenticatedUser` does not accept `sort=stars`. Sort by `stargazers_count` after fetching.
- UI state (`languageFilter`) → Zustand only. Never cache filter state in TanStack Query.
- Do not store `Repository` objects in Zustand — derive language list from TanStack Query cache in the hook.

### Acceptance Criteria
- Language dropdown shows only languages present in the current fetched page
- Selecting a language hides non-matching repos without a new network request
- Sort by Stars orders by `stargazers_count` descending
- Reset button appears only when Type ≠ `all`, Language ≠ `""`, Sort ≠ `pushed`, or search ≠ `""`
- `bun run test` passes including all new and updated tests

