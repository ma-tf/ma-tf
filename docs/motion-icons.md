# Animated icons

`src/components/icons/**` holds hand-animated Phosphor icons, installed as source
through the shadcn registry rather than as a package. `animated-icon.tsx` is the
shared runtime; each icon file is geometry plus choreography, as ordinary data,
and is ours to retune.

- `weight` picks the stroke width and duotone backdrop the same way the static
  icons do, so an animated icon replaces a `@phosphor-icons/react` icon without a
  visual change at rest. Not every file ships every weight: where one is missing,
  `resolveWeight` falls back to the regular geometry while the stroke width still
  follows the prop, so a `weight="bold"` call site on a regular-only file gets a
  bold stroke over regular paths.
- Five call sites animate today: `MagnifyingGlass` in `CommandMenu` and in the
  palette's `CommandInput`, `Sun` and `Moon` in `ModeToggle`, `ArrowClockwise` on
  the ask failure's retry button, and `ArrowRight` on the ask submit.
- Two icons are animated outside this runtime, because their hosts are React-free:
  the CV link's `ReadCvLogo` and the motion control's `ArrowCounterClockwise` run
  CSS keyframes in `global.css` instead. Both play on hover or `:focus-visible`.
- Two ways in. Where the icon sits inside a padded button, that button runs
  `trigger="none"` and plays the icon through its ref from `onMouseEnter`: the
  icon is 16px inside a 32px button, and an SVG's hit area is its painted
  strokes, so a hover trigger on the icon itself would leave the middle of the
  glass, the obvious place to aim, inert. Where the icon mounts at the moment it
  should play, `trigger="in-view"` is enough: the palette's input sweeps as the
  palette opens, and the retry turns as the failure appears.
- They are React client components: a `.astro` call site needs its own `client:*`
  directive, and an icon inside an existing island rides that island's hydration.
- `trigger` defaults to `hover`, which touch layouts never fire; a tap-driven
  call site wants `trigger="click"` or `"in-view"`.
- The runtime declines on its own under `prefers-reduced-motion: reduce`, through
  Motion's `useReducedMotion`, and paints the icon static.
- `data-motion` does not gate the icons, exactly as it does not gate the parallax
  drivers: the control is scoped to entrances and reveals
  ([ADR 019](adr/019-replay-motion-control.md)).
- Their duration is exempt from the 150ms budget
  ([ADR 011](adr/011-motion-timing-budget.md)).

The runtime diverges from the registry in four places, and `shadcn add -o`
overwrites them, so re-apply these after a refresh:

- `animated-icon.tsx` imports its React types directly (`SVGProps`,
  `RefAttributes`, `ForwardRefExoticComponent`), because `types/no-react-namespace`
  bans the `React.*` namespace form.
- `animated-icon.tsx` guards the `parts[renderIndex]` and `m[tag]` lookups, and
  passes the built variants object straight to `variants` rather than spreading
  `.rest` and `.active` off it — `noUncheckedIndexedAccess` types both of those as
  possibly undefined.
- `magnifying-glass.tsx` imports the runtime as `@components/icons/animated-icon`;
  relative `./` imports are banned.
- `animated-icon.tsx` renders `m` inside
  `<LazyMotion features={domAnimation} strict>` instead of the full `motion`
  component. `domAnimation` still carries `InViewFeature`, so `trigger="in-view"`
  keeps working, while the layout and drag features drop out — 48kB off the
  command-menu island chunk. If an app-level `LazyMotion` ever appears, delete
  this one rather than nesting.

Two wrinkles to expect when installing another icon: the registry lists
`animated-icon.json` as a dependency, so every install prompts to overwrite the
runtime (`-y` does not answer that prompt — say yes, then `git checkout` it back),
and each new icon file imports the runtime as `./animated-icon`, which the alias
table above re-points. `src/components/ui/command.tsx` also diverges, from the
shadcn registry rather than this one, by rendering the animated glass in place of
the static icon in the palette's input.
