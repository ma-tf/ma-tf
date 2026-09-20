import { NavButton } from "@components/nav-button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@components/ui/collapsible";
import { VignettesHeader, VignettesTitle } from "@features/vignettes/vignettes";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { useState } from "react";

export const VIGNETTE_NAVIGATION_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/photography", label: "Photography" },
  { href: "/music", label: "Music" },
];

export function VignettesMobileMenu() {
  const [open, setOpen] = useState(false);
  const Icon = open ? XIcon : ListIcon;

  return (
    <div className="md:hidden">
      <Collapsible open={open} onOpenChange={setOpen}>
        <VignettesHeader>
          <VignettesTitle>
            <CollapsibleTrigger>
              <span className="flex items-center gap-2 border-x border-t border-vignettes-ink bg-vignettes-ink px-2">
                vignettes
                <Icon size={16} weight="bold" aria-hidden="true" />
              </span>
            </CollapsibleTrigger>
          </VignettesTitle>
        </VignettesHeader>
        <CollapsibleContent>
          <nav className="flex flex-col" aria-label="Section navigation">
            {VIGNETTE_NAVIGATION_LINKS.map(({ href, label }, index) => (
              <div key={href} className={cn(index > 0 && "border-t border-background/20")}>
                <NavButton href={href} variant="solid" full>
                  {label}
                </NavButton>
              </div>
            ))}
          </nav>
        </CollapsibleContent>
      </Collapsible>
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
