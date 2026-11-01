# Photography lightbox

The photo grid and the media dialog that opens a frame.

## Sub-features

- `grid`: three columns of 24 frames, each a dialog trigger.
- `lightbox`: the media dialog with the photo, its caption and the camera line.
- `caption-toggle`: the `Caption` button hides and shows the caption block
  (`aria-pressed` tracks it).
- `surface-close`: clicking the dialog surface outside the photo closes it.

## How to get to it (user POV)

Open `/photography` from the home preview, the footer, or the command palette.
Click any frame. Click the photo to toggle the caption. Click the X, press
Escape, or click the dialog's empty margin to close.

## Driving it with control-m4t

Preconditions:

- `/photography` is reachable and the grid holds 24 frames.
- A 1280x900 viewport, so the media dialog takes its desktop layout.

```sh
node .agents/skills/verify-m4t/control-m4t.mjs goto /photography --viewport=1280x900
node .agents/skills/verify-m4t/control-m4t.mjs count 'button[data-slot="dialog-trigger"]'
node .agents/skills/verify-m4t/control-m4t.mjs click 'button[data-slot="dialog-trigger"]'
node .agents/skills/verify-m4t/control-m4t.mjs wait --selector='[data-slot="dialog-content"][role="dialog"]'
node .agents/skills/verify-m4t/control-m4t.mjs text '[data-slot="dialog-title"]'
node .agents/skills/verify-m4t/control-m4t.mjs attr '[data-slot="dialog-content"] button[aria-label="Caption"]' aria-pressed
node .agents/skills/verify-m4t/control-m4t.mjs click '[data-slot="dialog-content"] button[aria-label="Caption"]'
node .agents/skills/verify-m4t/control-m4t.mjs attr '[data-slot="dialog-content"] button[aria-label="Caption"]' aria-pressed
node .agents/skills/verify-m4t/control-m4t.mjs screenshot photography-lightbox.png
node .agents/skills/verify-m4t/control-m4t.mjs press Escape
node .agents/skills/verify-m4t/control-m4t.mjs count '[data-slot="dialog-content"]'
```

End state: 24 triggers, the dialog shows a caption and `Shot by the <camera>`,
`aria-pressed` flips when the photo is clicked, and the dialog count returns to
zero after Escape.

## Gotchas

- The close button is decorative at 1280px: the caption block overlaps its
  centre by about 20px (`md:static` caption, `z-10`, full dialog width), so a
  pointer click on the X is intercepted by the caption text. Use Escape or a
  backdrop click in a journey; report the overlapping hit target rather than
  changing the journey.
- The dialog is portalled to `body > [data-slot="dialog-portal"]`; while it is
  open the header, main and footer carry `aria-hidden` and `data-base-ui-inert`.
- Nothing is portalled until a dialog opens, so a `count` of zero before opening
  is expected, not a failure.
- Thumbnails are lazy CDN images that sit under a skeleton until `load`; the
  trigger exists before the image does.
