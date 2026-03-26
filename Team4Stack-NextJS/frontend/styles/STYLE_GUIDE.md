# Frontend Style Structure Guide

This project now uses a split global-style architecture.

## Folder Structure

- `app/globals.css`
  - Entry file only.
  - Contains shared imports in strict order.
- `styles/global/`
  - `01-foundation-animations-and-scroll.css`
  - `02-caret-and-interaction.css`
  - `03-layout-and-component-overrides.css`
  - `04-theme-tokens.css`
  - `05-layer-base.css`
  - `06-layer-components.css`
  - `07-layer-utilities.css`
  - `08-darkmode-and-fixes.css`

## Rules For Future CSS

1. Keep `app/globals.css` as import-only. Do not add large rule sets directly.
2. Add new styles to the most specific file in `styles/global/`.
3. If a file grows too much, split it into a new numbered file and add one more import.
4. Prefer component-scoped styles (`*.module.css`) for page/component-specific UI.
5. Avoid global overrides unless behavior truly needs to be app-wide.

## Recommended Next Steps

- Move large section-specific classes (for example team cards, landing buttons, and course widgets) into component-level CSS modules.
- Keep `styles/global` for tokens, utilities, and cross-app behavior only.
