---
name: OctoManager
description: A developer's workbench for managing GitHub repositories with speed and precision
colors:
  background: "#ffffff"
  foreground: "#09090b"
  card: "#ffffff"
  primary: "#18181b"
  primary-foreground: "#fafafa"
  secondary: "#f4f4f5"
  secondary-foreground: "#18181b"
  muted: "#f4f4f5"
  muted-foreground: "#71717a"
  accent: "#f4f4f5"
  accent-foreground: "#18181b"
  destructive: "#ef4444"
  destructive-foreground: "#fafafa"
  switch-active: "#3b82f6"
  border: "#e4e4e7"
  input: "#e4e4e7"
  ring: "#18181b"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 7vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  caption:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  full: "9999px"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "1rem"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
---

# Design System: OctoManager

## Overview

**Creative North Star: "The Developer's Workbench"**

OctoManager's visual identity is rooted in the workbench metaphor — a clean, organized space where every tool has its place and nothing gets in the way. The aesthetic is clinical precision meets warm craft: the cold efficiency of a terminal married to the tactile satisfaction of well-made tools.

The system operates on a strict monochromatic Zinc palette, trusting that restraint in color forces better hierarchy through typography, spacing, and weight. Color appears only where it must: destructive actions (red), active states (blue), and language indicators (tiny dots). Everything else lives in the grayscale spectrum, letting content and structure do the talking.

**Key Characteristics:**
- Monochromatic Zinc palette with no decorative color
- Soft, tactile component feel with subtle elevation
- Typographic hierarchy driven by weight and size, not color
- Minimal shadow vocabulary — one level for elevated surfaces
- Keyboard-first interaction patterns (Cmd+K search, Esc to clear)

## Colors

The palette is a full Zinc grayscale with semantic role assignments. No accent colors exist in the system; the only functional colors are destructive (red) for danger states and switch-active (blue) for toggle feedback.

### Primary
- **Obsidian** (#18181b / zinc-900): Default button backgrounds, primary text in dark mode, focus rings. The workhorse of the system.
- **Snow** (#fafafa / zinc-50): Text on primary backgrounds, light mode foreground. High contrast against Obsidian.

### Secondary
- **Cloud** (#f4f4f5 / zinc-100): Muted backgrounds, secondary button fills, hover states on ghost elements. Light mode's default surface tint.
- **Obsidian** (#18181b): Secondary text on Cloud backgrounds.

### Muted
- **Cloud** (#f4f4f5 / zinc-100): Disabled states, placeholder backgrounds, skeleton fills.
- **Slate** (#71717a / zinc-500): Secondary text, captions, timestamps, helper labels. The system's "quiet voice."

### Accent
- **Cloud** (#f4f4f5 / zinc-100): Hover backgrounds for interactive elements, dropdown highlights, select item hovers.
- **Obsidian** (#18181b): Text on accent backgrounds.

### Destructive
- **Crimson** (#ef4444 / red-500): Delete buttons, error states, danger indicators. Used sparingly — the only red in the system.
- **Snow** (#fafafa): Text on destructive backgrounds.

### Functional
- **Switch Active** (#3b82f6 / blue-500): Toggle switch when ON. The only blue in the system — appears exclusively on the visibility toggle.
- **Border** (#e4e4e7 / zinc-200): Table borders, card outlines, input strokes, dividers. The structural skeleton.
- **Ring** (#18181b): Focus ring color for keyboard navigation.

### Named Rules
**The Zinc Rule.** All surfaces, backgrounds, and text use only the Zinc scale. No decorative colors appear anywhere in the interface. The sole exceptions are Crimson for destructive actions and Switch Active for toggle states — their rarity is the point.

## Typography

**Display Font:** Geist (with system-ui, sans-serif fallback)
**Body Font:** Geist (with system-ui, sans-serif fallback)
**Mono Font:** Geist Mono (with monospace fallback)

**Character:** Geist is a clean, geometric sans-serif designed for developer interfaces. Its slightly condensed proportions and tight letter-spacing create a sense of density without clutter — like a well-organized code editor.

### Hierarchy
- **Display** (700, clamp(2.5rem, 7vw, 3.5rem), 1.1): Hero headlines only. Landing page title. The largest text in the system.
- **Headline** (600, 1.5rem, 1.2): Section titles. Dashboard heading "Repositories". Page-level hierarchy.
- **Title** (600, 1.25rem, 1.3): Card titles, modal headings, dialog headers.
- **Body** (400, 1rem, 1.5): Default text. Descriptions, paragraphs, form labels. Max comfortable reading width ~65ch.
- **Label** (500, 0.875rem, 1.4): Button text, navigation items, interactive elements. Slightly heavier than body for clickability signal.
- **Caption** (400, 0.75rem, 1.4): Timestamps, metadata, helper text, badges. The quietest voice in the hierarchy.

### Named Rules
**The Weight Rule.** Hierarchy is expressed through font-weight, not color. Bold text is always interactive or a heading; regular text is always content. This creates an instant visual grammar: if it's bold, you can click it or it's telling you what section you're in.

## Layout

The layout is a single-column centered container with responsive width constraints. The container uses `container mx-auto` with horizontal padding, creating a focused reading column that never stretches too wide.

**Density:** Medium. Not cramped, not spacious. Elements have clear breathing room (16px gaps, 24px section breaks) but never feel sparse. The workbench is organized, not empty.

**Responsive behavior:** Dashboard uses a responsive card grid: 1 column on mobile, 2 columns on tablet (`sm:`), 3 columns on desktop (`lg:`). Cards stack naturally — no horizontal scroll. Filter controls collapse into a single dropdown on mobile (`flex-row` → single button on `sm:hidden`).

**Spacing rhythm:** 4px base unit. Components use 8px, 12px, 16px, 24px, 32px increments. No random values — everything lands on the grid.

## Elevation & Depth

The system uses minimal elevation — one shadow level for surfaces that float above the base layer. Most UI elements are flat, relying on background color shifts and border weight to distinguish layers.

### Shadow Vocabulary
- **Subtle lift** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): Cards, floating action bar, dropdown menus. The only shadow in the system. Applied to surfaces that need to separate from the background.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. The single shadow level appears only on surfaces that float above the base layer (cards, modals, floating action bars). Interactive elements (buttons, inputs, table rows) never have shadows — they communicate state through background color and border changes.

## Shapes

The form language is soft but not rounded. A single border-radius scale governs all components: small elements (badges, tags) use 6px, medium elements (buttons, inputs, cards) use 8px, and large elements (modals) use 12px. No element has sharp 90-degree corners, but nothing approaches pill-shaped either.

**Borders:** Thin (1px) and consistent. Every bordered element uses the same `--border` color. Borders are structural, not decorative — they define edges, not add ornament.

**Corners:** Gently curved. The 8px default radius creates approachable, modern components without the playful energy of larger radii. This is a workbench, not a toy.

## Components

### Buttons
- **Shape:** 8px radius, 32px height (default), 28px height (sm), 32px square (icon)
- **Primary:** Obsidian background, Snow text. Padding: 8px 16px. The "do this" button.
- **Hover:** Slightly lighter Obsidian (achieved via opacity shift). 150ms transition.
- **Outline:** Transparent background, 1px Border stroke, foreground text. For secondary actions.
- **Ghost:** Transparent background, no border. Hover reveals Accent background. For toolbar actions, navigation.
- **Destructive:** Crimson background, Snow text. 1px transparent stroke. Reserved for delete actions only.
- **Disabled:** 40% opacity. Cursor not-allowed. No hover state.

### Inputs
- **Style:** 1px Border stroke, transparent background, 8px radius, 36px height. Left padding for icon prefix.
- **Focus:** 2px Ring outline (Obsidian in light, Zinc-300 in dark), 2px offset. The border remains unchanged.
- **Placeholder:** Slate (#71717a) at 100% opacity.
- **Error:** 1px Crimson border, subtle Crimson tint background.

### Cards / Containers
- **Corner Style:** 8px radius
- **Background:** Card color (#ffffff light, #18181b dark)
- **Shadow Strategy:** Subtle lift shadow on floating cards (bulk action bar, dropdowns)
- **Border:** 1px Border color. Cards in the table area have a combined border-radius + border treatment.
- **Internal Padding:** 16px (default), 12px (compact)

### Repo Cards
- **Corner Style:** 8px radius
- **Background:** Card color, subtle accent tint on hover/select
- **Border:** 1px Border color. Selected cards get `border-foreground/30` for emphasis.
- **Internal Padding:** 16px, with 10px left padding to clear the checkbox
- **Layout:** Header (name + visibility badge) → description (2-line clamp) → meta (language dot + stars) → footer (visibility toggle + edit/delete icons)
- **Responsive:** 1 col mobile → 2 col tablet → 3 col desktop
- **Selection:** Checkbox top-left. Hidden on desktop hover (reveals on group-hover), always visible on touch (`pointer:coarse`), keyboard focus, and when selected.
- **Actions:** Visibility toggle (inline), Edit + Delete icon buttons (top-right of footer). Edit disabled for archived repos.

### Badges
- **Default:** Cloud background, foreground text. 4px radius, compact padding.
- **Secondary:** Slightly darker Cloud background. Used for "Archived" state.
- **Outline:** Transparent background, 1px Border stroke. Used for "Fork" indicator.
- **Size:** Minimal — 16px height, 10-11px text. Always inline with other content.

### Tooltips
- **Style:** Foreground background, Snow text. 6px radius. 8px padding.
- **Trigger:** On hover/focus with 300ms delay.
- **Content:** Short, actionable text. No titles or paragraphs.

### Switches
- **Style:** 36px × 20px track, 16px thumb.
- **Off:** Muted background, Border stroke.
- **On:** Switch Active (#3b82f6) background, Snow thumb.
- **Transition:** 200ms ease.

### Modals / Dialogs
- **Style:** Centered overlay with backdrop blur. Card background, 12px radius.
- **Shadow:** Subtle lift shadow.
- **Header:** Title weight text, close button (ghost, icon-only).
- **Body:** Body weight text, form fields if editing.
- **Footer:** Action buttons aligned right. Destructive on the left, primary on the right.

### Navigation
- **Style:** 56px header height, 1px bottom border. Logo left, actions right.
- **Typography:** Label weight for logo, Caption weight for links.
- **Active:** Foreground text (always visible, no active indicator needed).
- **Hover:** Slight opacity change.

## Do's and Don'ts

### Do:
- **Do** use font-weight to signal hierarchy: bold for interactive/heading, regular for content
- **Do** keep the Zinc palette sacred — no decorative colors anywhere
- **Do** use the single shadow level only for floating surfaces (cards, modals, action bars)
- **Do** maintain 4px grid alignment for all spacing values
- **Do** use Ghost buttons for toolbar actions and secondary navigation
- **Do** show destructive actions in Crimson, never in any other color

### Don't:
- **Don't** add shadows to buttons, inputs, or table rows
- **Don't** use color to distinguish interactive states — use background shifts and borders
- **Don't** exceed 12px border-radius on any component
- **Don't** add decorative gradients, patterns, or textures to backgrounds
- **Don't** use blue, green, yellow, or any accent color outside the Switch component
- **Don't** create visual hierarchy through color when font-weight can do the job
