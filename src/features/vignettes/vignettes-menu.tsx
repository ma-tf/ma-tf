import {
  MobileMenu,
  MobileMenuIcon,
  MobileMenuLink,
  MobileMenuLinks,
  MobileMenuTrigger,
} from "@components/mobile-menu";
import { VignettesHeader, VignettesTitle } from "@features/vignettes/vignettes";

export const VIGNETTE_NAVIGATION_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/photography", label: "Photography" },
  { href: "/music", label: "Music" },
];

export function VignettesMobileMenu() {
  return (
    <div className="md:hidden">
      <MobileMenu>
        <VignettesHeader>
          <VignettesTitle>
            <MobileMenuTrigger>
              <span className="flex items-center gap-2 border-x border-t border-vignettes-ink bg-vignettes-ink px-2">
                vignettes
                <MobileMenuIcon />
              </span>
            </MobileMenuTrigger>
          </VignettesTitle>
        </VignettesHeader>
        <MobileMenuLinks>
          {VIGNETTE_NAVIGATION_LINKS.map(({ href, label }) => (
            <MobileMenuLink key={href} href={href}>
              {label}
            </MobileMenuLink>
          ))}
        </MobileMenuLinks>
      </MobileMenu>
    </div>
  );
}

export function VignettesDesktopMenu() {
  return (
    <VignettesHeader className="hidden md:flex">
      <VignettesTitle className="border-x border-t border-vignettes-ink bg-vignettes-ink px-2">
        vignettes
      </VignettesTitle>
    </VignettesHeader>
  );
}
