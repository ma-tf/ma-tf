import { VignettesHeader, VignettesTitle } from "@features/vignettes/vignettes";

export const VIGNETTE_NAVIGATION_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/photography", label: "Photography" },
  { href: "/music", label: "Music" },
];

export function VignettesMenuTitle() {
  return (
    <VignettesHeader>
      <VignettesTitle className="border-x border-t border-vignettes-ink bg-vignettes-ink px-2">
        vignettes
      </VignettesTitle>
    </VignettesHeader>
  );
}
