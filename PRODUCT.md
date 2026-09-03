# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Solo developers managing their own GitHub repositories who need fast, bulk operations without navigating GitHub's cluttered settings pages.

## Product Purpose

Replace repetitive manual repo management (visibility toggles, metadata edits, deletions) with a single, fast interface. Success means a developer can manage dozens of repos in minutes instead of hours.

## Positioning

Speed and simplicity. OctoManager provides a clean, minimal UI for bulk repo operations that GitHub's native settings don't support efficiently. The experience prioritizes scanability and quick actions over feature completeness.

## Operating Context

- Developer has GitHub account with multiple repositories
- Authenticated via GitHub OAuth (repo + delete_repo scopes)
- Works across public and private repos, forks and sources
- Typical session: sign in → scan list → filter/search → bulk select → act

## Capabilities and Constraints

- Toggle visibility (public ↔ private) per-row or in bulk with optimistic UI
- Edit metadata: name, description, website, topics
- Safe deletion: single repo requires name confirmation; bulk shows summary modal
- Bulk select with floating action bar
- Search and filter by visibility, sort by name/stars/forks/updated
- Zinc-only design system (monochromatic, no colored accents)
- shadcn/ui component library (do not edit primitives directly)
- Auth.js v5 with GitHub provider only
- Performance: optimistic updates, minimal re-renders, memoized components

## Brand Commitments

- Name: OctoManager
- Voice: Clean, minimal, developer-focused
- License: MIT, open-source
- No data stored server-side beyond session tokens

## Evidence on Hand

- Full working application with landing page, dashboard, and API routes
- shadcn/ui primitives in src/components/ui/ (generated, not hand-edited)
- Tailwind CSS v4 with Zinc palette variables in globals.css
- Geist font family (sans + mono)

## Product Principles

1. Speed over features — every interaction should feel instant
2. Safety through confirmation — destructive actions require explicit user intent
3. Minimal cognitive load — scan, select, act; no hunting through menus
4. Zero lock-in — open-source, self-hosted, no data stored
5. Progressive disclosure — simple surface, power available when needed

## Accessibility & Inclusion

Keyboard navigable, screen reader compatible via shadcn/ui/Radix primitives. No product-specific a11y requirements established beyond standard compliance.
