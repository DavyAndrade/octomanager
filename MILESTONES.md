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

Ideas and improvements to be implemented in future branches. Listed in order of priority.

---

### 🔴 P1 — Mobile Responsiveness

**Goal:** The application currently breaks on small screens. Make the full UI responsive across mobile, tablet, and desktop viewports.

**Scope:**
- [ ] Responsive layout for the dashboard (repo table or card-based fallback on mobile)
- [ ] `AppHeader` adapts to small screens (collapsed nav, avatar dropdown)
- [ ] `BulkActionBar` repositioned for mobile
- [ ] `FilterBar` wraps or collapses properly on small viewports
- [ ] Modals (delete, edit) are usable on mobile
- [ ] `SearchBar` full-width on mobile

**Acceptance Criteria:**
- No horizontal overflow at 375px (iPhone SE) or 390px (iPhone 14)
- All interactive elements are reachable and tappable (min 44×44px touch targets)
- `bun run test` still passes after changes

---

### 🟡 P2 — Pagination Numbers

**Goal:** Improve navigation UX by showing page number buttons alongside the existing previous/next controls, similar to GitHub's pagination bar.

**Scope:**
- [ ] Render numbered page buttons between prev/next arrows
- [ ] Highlight the active page
- [ ] Ellipsis (`…`) for large page ranges (e.g. 1 2 … 7 8 9 … 24 25)
- [ ] Keyboard-accessible

**Acceptance Criteria:**
- Clicking a page number navigates directly to that page
- Active page is visually distinct
- Works correctly with the existing `useRepos` pagination state

---

### 🟢 P3 — "Buy Me a Coffee" on Landing Page

**Goal:** Replace the current "Open Source" highlight element on the landing page (`src/app/page.tsx`) with a "Buy Me a Coffee" link/button, so visitors can contribute financially.

**Scope:**
- [ ] Add Buy Me a Coffee button/badge to the landing page hero or footer area
- [ ] Apply the same badge to the GitHub repository `README.md`
- [ ] Style consistent with the existing Zinc design (or use the official BMAC badge)

**Acceptance Criteria:**
- Link opens the correct Buy Me a Coffee profile in a new tab
- Renders correctly in both light and dark mode
- Does not break existing landing page layout

