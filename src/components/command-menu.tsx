import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@components/ui/command";
import {
  EnvelopeSimpleIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  RssIcon,
} from "@phosphor-icons/react";
import { toggleTheme } from "@stores/theme";
import { useEffect, useState } from "react";

type CommandMenuLink = { label: string; href: string };

type CommandMenuProps = {
  pages: CommandMenuLink[];
  email: string;
  github: string;
  linkedin: string;
};

export function CommandMenu({ pages, email, github, linkedin }: CommandMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        title="Search (Ctrl+K)"
        className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:text-foreground"
      >
        <MagnifyingGlassIcon size={16} weight="bold" />
      </button>
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
            <CommandSeparator />
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
