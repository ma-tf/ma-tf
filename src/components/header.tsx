import type { ComponentProps, CSSProperties, ReactNode } from "react";

import { CommandMenu } from "@components/command-menu";
import { ModeToggle } from "@components/ModeToggle";
import { NavButton } from "@components/nav-button";
import { CDN_BASE } from "@lib/cdn";
import { startMotionControl } from "@lib/motion-control";
import {
  ArrowCounterClockwiseIcon,
  FastForwardIcon,
  GithubLogoIcon,
  ListIcon,
  ReadCvLogoIcon,
  XIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { useEffect, useState } from "react";

type HeaderProps = {
  currentPath: string;
  pages: { label: string; href: string }[];
  email: string;
  github: string;
  linkedin: string;
};

function HeaderShell({ className, children, ...props }: ComponentProps<"header">) {
  return (
    <header
      className={cn("sticky top-0 z-50 -mb-4 w-full overflow-x-clip text-foreground", className)}
      {...props}
    >
      {children}
    </header>
  );
}

function HeaderBar({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative mx-auto flex h-4 w-full items-stretch justify-between before:pointer-events-none before:absolute before:-z-1 before:drop-shadow-chrome after:pointer-events-none after:absolute after:-z-1 after:drop-shadow-chrome",
        className,
      )}
      style={
        {
          "--chrome-top-left": `url("${CDN_BASE}/misc/topleftchrome.png")`,
          "--chrome-top-right": `url("${CDN_BASE}/misc/toprightchrome.png")`,
        } as CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  );
}

function HeaderChip({ className, children, ...props }: ComponentProps<"a">) {
  return (
    <a className={cn("group flex h-full items-center justify-center px-2", className)} {...props}>
      {children}
    </a>
  );
}

function HeaderControl({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-stretch rounded-b-xs bg-background/15 text-muted-foreground inset-shadow-chip-bottom transition-colors duration-150 hover:bg-background/50 hover:text-foreground dark:bg-white/15 dark:hover:bg-white/50",
        className,
      )}
    >
      {children}
    </div>
  );
}

function MotionControlButton() {
  useEffect(() => startMotionControl(), []);

  return (
    <button
      type="button"
      data-motion-control
      data-mode="hidden"
      aria-label="Skip animations"
      title="Skip animations"
      className="grid h-full cursor-pointer place-items-center px-1.5 text-muted-foreground transition-colors duration-150 hover:text-foreground"
    >
      <FastForwardIcon
        size={12}
        weight="bold"
        className="motion-control-icon motion-control-skip col-start-1 row-start-1"
      />
      <ArrowCounterClockwiseIcon
        size={12}
        weight="bold"
        className="motion-control-icon motion-control-reset col-start-1 row-start-1"
      />
    </button>
  );
}

function MobileHeaderMenuDetails({
  className,
  children,
  open,
  onToggle,
  onOpenChange,
  ...props
}: ComponentProps<"details"> & { onOpenChange: (open: boolean) => void }) {
  return (
    <details
      className={cn("group md:hidden", className)}
      open={open}
      onToggle={(event) => {
        onOpenChange(event.currentTarget.open);
        onToggle?.(event);
      }}
      {...props}
    >
      {children}
    </details>
  );
}

function MobileHeaderMenuSummary({ className, children, ...props }: ComponentProps<"summary">) {
  return (
    <summary
      aria-label="Menu"
      className={cn(
        "absolute top-0 right-0 z-10 grid size-7.5 cursor-pointer list-none place-items-center rounded-b-xs bg-background/15 text-muted-foreground inset-shadow-chip-bottom transition-colors duration-150 hover:bg-background/50 hover:text-foreground dark:bg-white/15 dark:hover:bg-white/50",
        className,
      )}
      {...props}
    >
      {children}
    </summary>
  );
}

function MobileHeaderMenuRow({ children }: { children: ReactNode }) {
  return <div className="border-t border-foreground first:border-t-0">{children}</div>;
}

function MobileHeaderMenu() {
  const [open, setOpen] = useState(false);

  return (
    <MobileHeaderMenuDetails open={open} onOpenChange={setOpen}>
      <MobileHeaderMenuSummary>
        <ListIcon size={16} weight="bold" aria-hidden="true" className="group-open:hidden" />
        <XIcon size={16} weight="bold" aria-hidden="true" className="hidden group-open:block" />
      </MobileHeaderMenuSummary>
      <div className="flex flex-col">
        <MobileHeaderMenuRow>
          <NavButton href="/about" variant="solid" full>
            About
          </NavButton>
        </MobileHeaderMenuRow>
        <MobileHeaderMenuRow>
          <NavButton href="/contact" variant="solid" full>
            Contact
          </NavButton>
        </MobileHeaderMenuRow>
        <MobileHeaderMenuRow>
          <NavButton href="/privacy" variant="solid" full>
            Privacy
          </NavButton>
        </MobileHeaderMenuRow>
        <div className="h-0.5 w-full bg-background" />
        <MobileHeaderMenuRow>
          <NavButton href="/developers" variant="solid" full>
            Developers
          </NavButton>
        </MobileHeaderMenuRow>
        <div className="h-7.5 w-full bg-background" />
      </div>
    </MobileHeaderMenuDetails>
  );
}

export function Header({ currentPath, pages, email, github, linkedin }: HeaderProps) {
  const showCv = currentPath !== "/cv";

  return (
    <HeaderShell>
      <div className="relative w-full md:hidden">
        <div className="flex h-7.5 w-full items-stretch justify-between bg-background">
          <div className="flex items-stretch gap-0.5">
            <HeaderControl>
              <HeaderChip href="/" aria-label="m4t.tf home" className="w-7.5 px-0">
                <img
                  src="/favicon.png"
                  alt=""
                  width="12"
                  height="12"
                  className="size-3 shrink-0 opacity-80 transition-opacity duration-150 group-hover:opacity-100"
                />
              </HeaderChip>
            </HeaderControl>
            {showCv && (
              <HeaderControl className="w-7.5 justify-center">
                <HeaderChip href="/cv" aria-label="CV" title="CV" className="w-full px-0">
                  <ReadCvLogoIcon
                    size={12}
                    weight="bold"
                    aria-hidden="true"
                    className="motion-safe:group-hover:animate-icon-peek motion-safe:group-focus-visible:animate-icon-peek"
                  />
                </HeaderChip>
              </HeaderControl>
            )}
            <HeaderControl className="w-7.5 justify-center">
              <HeaderChip
                href={github}
                aria-label="GitHub"
                title="GitHub"
                rel="noreferrer"
                className="w-full px-0"
              >
                <GithubLogoIcon
                  size={12}
                  weight="bold"
                  aria-hidden="true"
                  className="motion-safe:group-hover:animate-icon-peek motion-safe:group-focus-visible:animate-icon-peek"
                />
              </HeaderChip>
            </HeaderControl>
          </div>
          <div className="flex items-stretch gap-0.5 pr-7.5">
            <HeaderControl className="w-7.5 justify-center">
              <CommandMenu pages={pages} email={email} github={github} linkedin={linkedin} />
            </HeaderControl>
            <HeaderControl className="w-7.5 justify-center has-data-[mode=hidden]:hidden">
              <MotionControlButton />
            </HeaderControl>
            <HeaderControl className="w-7.5 justify-center">
              <ModeToggle />
            </HeaderControl>
          </div>
        </div>
        <MobileHeaderMenu />
      </div>
      <HeaderBar className="hidden before:-top-4 before:-left-69 before:content-(--chrome-top-left) after:-top-1.5 after:-right-9.5 after:content-(--chrome-top-right) has-data-[mode=hidden]:after:-right-15.5 md:flex">
        <div className="flex items-stretch gap-0.5">
          <HeaderControl>
            <HeaderChip href="/" aria-label="m4t.tf home">
              <img
                src="/favicon.png"
                alt=""
                width="12"
                height="12"
                className="size-3 shrink-0 opacity-80 transition-opacity duration-150 group-hover:opacity-100"
              />
            </HeaderChip>
          </HeaderControl>
          {showCv && (
            <HeaderControl>
              <HeaderChip href="/cv" aria-label="CV" title="CV">
                <ReadCvLogoIcon
                  size={12}
                  weight="bold"
                  aria-hidden="true"
                  className="motion-safe:group-hover:animate-icon-peek motion-safe:group-focus-visible:animate-icon-peek"
                />
              </HeaderChip>
            </HeaderControl>
          )}
          <HeaderControl>
            <HeaderChip href={github} aria-label="GitHub" title="GitHub" rel="noreferrer">
              <GithubLogoIcon
                size={12}
                weight="bold"
                aria-hidden="true"
                className="motion-safe:group-hover:animate-icon-peek motion-safe:group-focus-visible:animate-icon-peek"
              />
            </HeaderChip>
          </HeaderControl>
        </div>
        <div className="flex items-stretch gap-0.5">
          <HeaderControl>
            <CommandMenu pages={pages} email={email} github={github} linkedin={linkedin} />
          </HeaderControl>
          <HeaderControl className="has-data-[mode=hidden]:hidden">
            <MotionControlButton />
          </HeaderControl>
          <HeaderControl>
            <ModeToggle />
          </HeaderControl>
        </div>
      </HeaderBar>
    </HeaderShell>
  );
}
