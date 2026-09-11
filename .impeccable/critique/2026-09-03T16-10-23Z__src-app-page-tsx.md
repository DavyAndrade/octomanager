---
target: src/app/page.tsx
total_score: 18
max_score: 24
na_heuristics: 5,7,10
p0_count: 1
p1_count: 2
timestamp: 2026-09-03T16-10-23Z
slug: src-app-page-tsx
---
# Critique: src/app/page.tsx

**Method:** dual-agent (A: general · B: general)
**Target:** src/app/page.tsx
**Slug:** src-app-page-tsx
**Total score:** 18/24 (75%, Acceptable)
**Heuristics n/a:** 5, 7, 10 (Persuade surface)

## Design Specificity Verdict

High specificity on the proof — mono filenames, real OSS names, `octo --what`, `~/repos`, accurate star counts. Two leaks: `~/landing` in nav (line 50) breaks the terminal metaphor by labeling the page as a route, and `Buy me a coffee` in the nav reads as patron-promotion before value delivery. Brand drift: mock chrome says "octomanager" (lowercase) vs DESIGN.md "OctoManager."

## Detector findings

8 type-ramp violations, all `text-[…]` arbitrary values. Dominant: `10px` microcopy (6/8). One `11px` (line 128) and one `3.75rem` hero (line 83). Advisory severity, but a missing `xs` token. No false positives.

Shadow `shadow-[0_1px_3px…]` (line 218) also bypasses the documented "Subtle lift" token.

## Visual defects

- Mobile (375x800): hero mock stacks below copy, language column hidden, mock reads as near-empty list
- Desktop (1440x900): hero left column extends ~120px lower than right column, items-center makes visual weight lopsided
- Both: monospace `$ octo --what` kicker on left does not visually connect to `$ repos --filter=""` in the mock
- Both: `? help` in keyboard hint bar advertises a shortcut that does nothing on the landing
- Both: Coffee link in nav carries same weight as primary action before visitor understands the product

## Heuristics

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Mock teaches dashboard state; no real auth feedback |
| 2 | Match System / Real World | 3 | Terminal metaphor consistent; `~/landing` and `octo --what` are dev-tab jokes |
| 3 | User Control and Freedom | 2 | No skip link; signed-in users auto-redirect, no return option |
| 4 | Consistency and Standards | 3 | Source repeated 3x |
| 5 | Error Prevention | n/a | No form on landing |
| 6 | Recognition Rather Than Recall | 3 | Mock + ACTIONS list show every affordance |
| 7 | Flexibility and Efficiency | n/a | Persuade surface |
| 8 | Aesthetic and Minimalist Design | 3 | Mostly clean; Coffee + duplicate Source dilute focus |
| 9 | Help Users Recognize Errors | 1 | No error/loading UI on the only conversion path |
| 10 | Help and Documentation | n/a | Persuade surface |

**Total: 18/24 (75%, Acceptable)**

## Cognitive Load

Failures: 2/8
- **Minimal choices**: 5 mock rows + 3 actions + 4 nav items + 2 CTAs visible simultaneously
- **Working memory**: user must connect static mock to actual product; no "this is a preview" cue

## Strengths

- Terminal-native copywriting sells keyboard-first thesis with zero marketing words
- Restraint as identity: zinc holds, no decorative gradients, no fake testimonial strip
- Mock section nav teaches dashboard IA before sign-in

## Priority Issues

### [P0] Sign-in has no error/loading/recovery UI
- **Why:** Landing has exactly one conversion target. OAuth failure = silent bounce.
- **Fix:** Surface loading + error states from SignInButton; add aria-live region below CTA.
- **Command:** /impeccable harden

### [P1] Mobile hero strips the mock's value
- **Why:** At <lg mock stacks below copy and 3 of 5 columns hide. Thesis "feel the speed before signing in" only holds on desktop.
- **Fix:** At <sm show 3 rows + preview caption, or sequential row reveals.
- **Command:** /impeccable adapt

### [P1] Nav does two unrelated jobs (sign-in path + donation)
- **Why:** Buy me a coffee in 56px nav competes with primary CTA before value delivery.
- **Fix:** Move Coffee to footer only; replace nav slot with `? help` shortcut hint matching keyboard bar.
- **Command:** /impeccable clarify

### [P2] Source link repeated 3x (nav, hero, footer)
- **Why:** Dilutes hero CTA pair (Sign in / View source).
- **Fix:** Keep Source in nav + footer; drop the hero arrow link.
- **Command:** /impeccable distill

### [P2] Type ramp uses raw text-[10px] - 6 violations
- **Why:** DESIGN.md ramp has no xs token; arbitrary values are tokenization drift.
- **Fix:** Add `xs: 0.625rem` to ramp, replace arbitrary values.
- **Command:** /impeccable typeset

## Persona Red Flags

**Jordan (First-Timer):** Hero "without the friction" - friction of what? No plain-English "what is OctoManager" line before headline. `octo --what` is only framing and `octo` isn't a real CLI. Will abandon by second viewport.

**Casey (Mobile-Primary):** Hero mock stacks below copy on <lg. Three CTAs total (nav Coffee, hero SignInButton, close-section SignInButton). Bottom thumb zone has only close CTA. Mock's hidden columns leave a near-empty list.

## Minor Observations

- Line 218 mock uses arbitrary shadow; DESIGN.md defines "Subtle lift" token
- Line 193 new Date().getFullYear() per-request; harmless
- Line 226 mock chrome "octomanager" lowercase; brand "OctoManager"
- Line 89 "No settings-page maze" competitive copy without naming competitor
- Keyboard hint bar's `? help` opens only inside dashboard, not on landing

## Questions to Consider

- If first-timer scrolls past hero mock and never sees it (mobile), does "land on a workbench" thesis hold?
- CTA is "Sign in with GitHub" but value prop is "no settings-page maze" - why is only CTA a sign-in that IS a permissions page?
- Buy me a coffee in nav asks for money before user has tried the product. Is OctoManager a project, product, or pitch? Nav's first 56px decides.
