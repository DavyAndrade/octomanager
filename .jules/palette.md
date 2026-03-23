# Palette's Journal - OctoManager UX/Accessibility Learnings

This journal records critical UX and accessibility learnings discovered during the development of OctoManager.

---

## 2025-05-14 - Keyboard Shortcut Hints for Efficiency
**Learning:** Adding keyboard shortcuts (like ⌘K for search) significantly improves efficiency for power users, but they must be visually discoverable without cluttering the UI.
**Action:** Use a subtle `KeyboardShortcutHint` component that adapts to the user's OS and hides when the input is focused or active to maintain a clean interface.
