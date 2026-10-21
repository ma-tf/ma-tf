import type { AnimatedIconHandle } from "@components/icons/animated-icon";

import { MagnifyingGlass as MagnifyingGlassAnimated } from "@components/icons/magnifying-glass";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@components/ui/command";
import { COMMAND_MENU_OPEN_EVENT } from "@lib/command-menu";
import {
  EnvelopeSimpleIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  MoonIcon,
  RssIcon,
} from "@phosphor-icons/react";
import { toggleTheme } from "@stores/theme";
import { useEffect, useRef, useState } from "react";

type CommandMenuLink = { label: string; href: string };

type CommandMenuProps = {
  pages: CommandMenuLink[];
  email: string;
  github: string;
  linkedin: string;
};

type CommandMenuTriggerProps = {
  onOpen: () => void;
};

function CommandMenuTrigger({ onOpen }: CommandMenuTriggerProps) {
  const glass = useRef<AnimatedIconHandle>(null);

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => glass.current?.play()}
      onMouseLeave={() => glass.current?.stop()}
      aria-label="Open command palette"
      title="Search (Ctrl+K)"
      className="grid size-8 cursor-pointer place-items-center rounded-lg text-muted-foreground hover:text-foreground"
    >
      <MagnifyingGlassAnimated ref={glass} trigger="none" size={16} weight="bold" />
    </button>
  );
}

export function CommandMenu({ pages, email, github, linkedin }: CommandMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    const onOpen = () => setOpen(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(COMMAND_MENU_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(COMMAND_MENU_OPEN_EVENT, onOpen);
    };
  }, []);

  const goTo = (href: string) => {
    setOpen(false);

    if (/^https?:\/\//.test(href)) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }

    window.location.assign(href);
  };

  const copyEmail = () => {
    setOpen(false);
    void navigator.clipboard.writeText(email);
  };

  const toggle = () => {
    setOpen(false);
    toggleTheme();
  };

  return (
    <>
      <CommandMenuTrigger onOpen={() => setOpen(true)} />
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search pages and actions..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Pages">
              {pages.map((page) => (
                <CommandItem
                  key={page.href}
                  value={`${page.label} ${page.href}`}
                  onSelect={() => goTo(page.href)}
                >
                  {page.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Actions">
              <CommandItem value="Toggle theme" onSelect={toggle}>
                <MoonIcon />
                Toggle theme
              </CommandItem>
              <CommandItem value="Copy email address" onSelect={copyEmail}>
                <EnvelopeSimpleIcon />
                Copy email
              </CommandItem>
              <CommandItem value="Open RSS feed" onSelect={() => goTo("/rss.xml")}>
                <RssIcon />
                RSS feed
              </CommandItem>
              <CommandItem value="Open GitHub profile" onSelect={() => goTo(github)}>
                <GithubLogoIcon />
                GitHub
              </CommandItem>
              <CommandItem value="Open LinkedIn profile" onSelect={() => goTo(linkedin)}>
                <LinkedinLogoIcon />
                LinkedIn
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
