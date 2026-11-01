# Command palette

The global search-and-action dialog, mounted in the header of every page that
renders chrome.

## Sub-features

- `palette-open`: the header search button, or `Ctrl+K` / `Cmd+K`.
- `palette-filter`: one input filtering page items and actions by label.
- `palette-navigate`: choosing a page item routes to it and closes the dialog.
- `palette-actions`: Toggle theme, Copy email, Download CV, RSS feed, GitHub,
  LinkedIn.
- `theme-toggle`: the header sun/moon button, outside the palette.
- `copy-toast`: the toast confirming a clipboard action.

## How to get to it (user POV)

Click the magnifier in the top-right of the header, or press Ctrl+K (Cmd+K on a
Mac). Type to filter. Enter chooses the highlighted row, Escape closes. The 404
page has a second opener: a `Search pages` button that raises the same dialog.

## Driving it with control-m4t

Preconditions:

- Any page with the global header is loaded; `/` is the default.
- A 1280x900 viewport; the palette opens at every width.

```sh
node .agents/skills/verify-m4t/control-m4t.mjs goto / --viewport=1280x900
node .agents/skills/verify-m4t/control-m4t.mjs press Control+k
node .agents/skills/verify-m4t/control-m4t.mjs wait --selector='[data-slot="dialog-content"][role="dialog"]'
node .agents/skills/verify-m4t/control-m4t.mjs fill '[data-slot="command-input"]' photo
node .agents/skills/verify-m4t/control-m4t.mjs count '[data-slot="command-item"]'
node .agents/skills/verify-m4t/control-m4t.mjs press Enter
node .agents/skills/verify-m4t/control-m4t.mjs eval 'location.pathname'
node .agents/skills/verify-m4t/control-m4t.mjs screenshot command-palette-photography.png
```

End state: `location.pathname` is `/photography`, `[data-slot="dialog-content"]`
counts zero, and the screenshot shows the photography page.

An action proves the side effect, not just the toast:

```sh
node .agents/skills/verify-m4t/control-m4t.mjs press Control+k
node .agents/skills/verify-m4t/control-m4t.mjs fill '[data-slot="command-input"]' 'copy email'
node .agents/skills/verify-m4t/control-m4t.mjs press Enter
node .agents/skills/verify-m4t/control-m4t.mjs text '[data-slot="toast-title"]'
node .agents/skills/verify-m4t/control-m4t.mjs eval 'navigator.clipboard.readText()'
```

End state: the toast reads `Email copied admin@m4t.tf` and the clipboard holds
`admin@m4t.tf`. The session grants clipboard permission, so this works headless.

## Gotchas

- No close button. Escape or a backdrop click closes the dialog.
- The input has no accessible name; select it with `[data-slot="command-input"]`.
- Item ids and list ids are generated. Use `data-value` or visible text.
- `Ctrl+K` toggles. Pressing it twice leaves the palette closed.
- The palette island is `client:load`; `fill` already waits for hydration, but a
  bare `press` immediately after `goto` can outrun it. Wait for the dialog first.
- Filtering "graphics" only matches while `PUBLIC_PREVIEW_GRAPHICS` is on.
