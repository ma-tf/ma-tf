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
import { Toaster, toast } from "@components/ui/toast";
import { COMMAND_MENU_OPEN_EVENT } from "@lib/command-menu";
import {
  EnvelopeSimpleIcon,
  FilePdfIcon,
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
      className="grid h-full cursor-pointer place-items-center px-2 text-muted-foreground transition-colors duration-150 hover:text-foreground"
    >
      <MagnifyingGlassAnimated ref={glass} trigger="none" size={12} weight="bold" />
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

  const emailToastTitle = (label: string) => (
    <span className="block whitespace-nowrap">
      {label}{" "}
      <a
        href={`mailto:${email}`}
        className="text-steel-600 underline underline-offset-2 hover:text-steel-400 dark:text-steel-400 dark:hover:text-steel-200"
      >
        {email}
      </a>
    </span>
  );

  const copyEmail = async () => {
    setOpen(false);

    try {
      await navigator.clipboard.writeText(email);
      toast.add({ title: emailToastTitle("Email copied"), type: "success" });
    } catch {
      toast.add({ title: emailToastTitle("Couldn't copy email"), type: "error" });
    }
  };

  const copyRss = async () => {
    setOpen(false);

    try {
      await navigator.clipboard.writeText(new URL("/rss.xml", window.location.origin).href);
      toast.add({ title: "RSS link copied", type: "success" });
    } catch {
      toast.add({ title: "Couldn't copy RSS link", type: "error" });
    }
  };

  const downloadCv = () => {
    setOpen(false);

    const link = document.createElement("a");
    link.href = "/cv.pdf";
    link.download = "Matt-Fehrenbach-CV.pdf";
    document.body.append(link);
    link.click();
    link.remove();
  };

  const toggle = () => {
    setOpen(false);
    toggleTheme();
  };

  return (
    <Toaster>
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
              <CommandItem value="Download CV as PDF" onSelect={downloadCv}>
                <FilePdfIcon />
                Download CV
              </CommandItem>
              <CommandItem value="Copy RSS feed link" onSelect={copyRss}>
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
    </Toaster>
  );
}
