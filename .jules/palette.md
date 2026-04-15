# Palette's Journal - OctoManager UX/Accessibility Learnings

This journal records critical UX and accessibility learnings discovered during the development of OctoManager.

---

## 2025-05-14 - Keyboard Shortcut Hints for Efficiency
**Learning:** Adding keyboard shortcuts (like ⌘K for search) significantly improves efficiency for power users, but they must be visually discoverable without cluttering the UI.
**Action:** Use a subtle `KeyboardShortcutHint` component that adapts to the user's OS and hides when the input is focused or active to maintain a clean interface.

## 2025-05-21 - Tooltips on Disabled Buttons
**Learning:** Standard tooltips often fail on disabled buttons because `pointer-events: none` prevents hover events from reaching the trigger.
**Action:** Wrap disabled buttons in a non-interactive `div` with `cursor-not-allowed` to ensure tooltips still display and provide feedback on why the action is unavailable.
