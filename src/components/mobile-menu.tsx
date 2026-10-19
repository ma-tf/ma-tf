import type { ReactNode } from "react";

import { NavButton } from "@components/nav-button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@components/ui/collapsible";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { createContext, useContext, useState } from "react";

const MobileMenuContext = createContext<{ open: boolean } | null>(null);

function useMobileMenu() {
  const context = useContext(MobileMenuContext);

  if (!context) {
    throw new Error("Mobile menu parts must be used within MobileMenu");
  }

  return context;
}

export function MobileMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <MobileMenuContext.Provider value={{ open }}>
      <Collapsible open={open} onOpenChange={setOpen}>
        {children}
      </Collapsible>
    </MobileMenuContext.Provider>
  );
}

export function MobileMenuTrigger({ children }: { children: ReactNode }) {
  return <CollapsibleTrigger>{children}</CollapsibleTrigger>;
}

export function MobileMenuIcon() {
  const { open } = useMobileMenu();
  const Icon = open ? XIcon : ListIcon;

  return <Icon size={16} weight="bold" aria-hidden="true" />;
}

export function MobileMenuLinks({ children }: { children: ReactNode }) {
  return (
    <CollapsibleContent>
      <nav className="flex flex-col" aria-label="Section navigation">
        {children}
      </nav>
    </CollapsibleContent>
  );
}

export function MobileMenuLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <div className="border-t border-background/20 first:border-t-0">
      <NavButton href={href} variant="solid" full>
        {children}
      </NavButton>
    </div>
  );
}
