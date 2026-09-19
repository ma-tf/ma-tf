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

export function VignettesMenu() {
  const [open, setOpen] = useState(false);
  const Icon = open ? XIcon : ListIcon;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full">
      <VignettesHeader>
        <VignettesTitle>
          <CollapsibleTrigger className="flex items-center gap-2 border-x border-t border-vignettes-ink bg-vignettes-ink px-2 md:hidden">
            vignettes
            <Icon size={16} weight="bold" aria-hidden="true" />
          </CollapsibleTrigger>
          <span className="hidden border-x border-t border-vignettes-ink bg-vignettes-ink px-2 md:inline-block">
            vignettes
          </span>
        </VignettesTitle>
      </VignettesHeader>
      <CollapsibleContent className="overflow-hidden md:hidden">
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
  );
}
