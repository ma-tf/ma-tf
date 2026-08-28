# ADR 001: Page Component Structure

## Context

The project has multiple Astro pages that each have corresponding React components. The component naming and structure was inconsistent across pages:

- `music.tsx` exported `Music`, `MusicTitle`, `MusicDescription`, etc.
- `photograph.tsx` exported `PhotographDescription`, `PhotographDescriptionHeader`, `PhotographDescriptionContent`
- `blog.tsx` only exported a preview card component

This inconsistency made it harder to understand the codebase and predict where components should be defined.

## Decision

We will standardize the page component structure so each Astro page follows a consistent pattern:

### File Structure

```
src/pages/{name}.astro     → imports from src/components/{name}.tsx
src/components/{name}.tsx   → exports page-specific components
```

### Component Convention

Each page component file (`{name}.tsx`) should export:

1. **`{Name}`** - Main wrapper component (optional, for layout)
2. **`{NameHeader`** - Header section wrapper
3. **`{NameTitle}`** - Page title
4. **`{NameDescription}`** - Page description/subtitle
5. **`{NameContent}`** - Main content area
6. **`{NamePreview}`** - Preview card for homepage (optional)

### Example

For a music page:

```tsx
// src/components/music.tsx
export function Music({ children, className, ...props }) { ... }
export function MusicHeader({ children, className, ...props }) { ... }
export function MusicTitle({ children, className, ...props }) { ... }
export function MusicDescription({ children, className, ...props }) { ... }
export function MusicContent({ children, className, ...props }) { ... }
export function MusicPreview() { ... }
```

### Usage in Astro

```astro
---
import { Music, MusicHeader, MusicTitle, MusicDescription, MusicContent } from "@components/music";
---

<Music>
  <MusicHeader>
    <MusicTitle>Music</MusicTitle>
    <MusicDescription>...</MusicDescription>
  </MusicHeader>
  <MusicContent>
    ...content...
  </MusicContent>
</Music>
```

## Consequences

### Positive

- Consistent naming makes the codebase easier to navigate
- New pages can be created by following the established pattern
- Components are colocated with their page logic
- Preview components for the homepage live in the same file

### Negative

- Requires updating existing pages to follow the new pattern
- Some pages may not need all components (e.g., no `Header` for simple pages)
