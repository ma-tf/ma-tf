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
        "relative z-10 mx-auto flex h-7.5 w-full items-stretch justify-between md:h-4",
        "before:pointer-events-none before:absolute before:-top-5.5 before:-left-1 before:-z-1 before:h-7.5 before:w-full before:drop-shadow-chrome before:content-(--chrome-mobile) md:before:-top-4 md:before:-left-69 md:before:h-auto md:before:w-auto md:before:content-(--chrome-top-left)",
        "after:pointer-events-none after:absolute after:-z-1 after:drop-shadow-chrome md:after:-top-1.5 md:after:-right-9.5 md:after:content-(--chrome-top-right) md:has-data-[mode=hidden]:after:-right-15.5",
        className,
      )}
      style={
        {
          "--chrome-mobile": `url("/mobilebottomchrome.png")`,
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

function HeaderGroup({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex items-stretch gap-0.5", className)} {...props}>
      {children}
    </div>
  );
}

function HeaderChip({ className, children, ...props }: ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "group flex h-full w-full items-center justify-center px-0 md:w-auto md:px-2",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

function HeaderControl({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex w-7.5 items-stretch justify-center rounded-b-xs bg-background/15 text-muted-foreground inset-shadow-chip-bottom transition-colors duration-150 hover:bg-background/50 hover:text-foreground md:w-auto md:justify-normal dark:bg-white/15 dark:hover:bg-white/50",
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

function MobileHeaderMenuSummary({ className, children, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label="Menu"
      className={cn(
        "absolute top-0 right-0 z-10 grid size-7.5 cursor-pointer list-none place-items-center rounded-b-xs bg-background/15 text-muted-foreground inset-shadow-chip-bottom transition-colors duration-150 hover:bg-background/50 hover:text-foreground dark:bg-white/15 dark:hover:bg-white/50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function MobileHeaderMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <MobileHeaderMenuSummary
        aria-controls="mobile-menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (
          <XIcon size={16} weight="bold" aria-hidden="true" />
        ) : (
          <ListIcon size={16} weight="bold" aria-hidden="true" />
        )}
      </MobileHeaderMenuSummary>
      <div
        id="mobile-menu"
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows] duration-150 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className={cn("flex flex-col bg-background", open && "translate-y-1")}>
            <NavButton href="/about" variant="outline" full className="border-none">
              About
            </NavButton>
            <NavButton href="/contact" variant="outline" full className="border-none">
              Contact
            </NavButton>
            <NavButton href="/privacy" variant="outline" full className="border-none">
              Privacy
            </NavButton>
            <NavButton href="/developers" variant="outline" full className="border-x-0 border-t-0">
              Developers
            </NavButton>
          </div>
          <div
            className="relative -z-10 h-7.5 w-full before:absolute before:inset-0 before:-translate-x-25 before:-translate-y-6.5 before:content-(--chrome-mobile)"
            style={{ "--chrome-mobile": `url("/mobiletopchrome.png")` } as CSSProperties}
          />
        </div>
      </div>
    </div>
  );
}

export function Header({ currentPath, pages, email, github, linkedin }: HeaderProps) {
  const showCv = currentPath !== "/cv";

  return (
    <HeaderShell>
      <div className="relative w-full md:contents">
        <div
          className="absolute inset-x-0 top-8 -z-10 h-7.5 w-full before:absolute before:inset-0 before:-translate-x-25 before:-translate-y-8 before:content-(--chrome-mobile) md:hidden"
          style={{ "--chrome-mobile": `url("/mobiletopchrome.png")` } as CSSProperties}
        />
        <HeaderBar>
          <HeaderGroup>
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
          </HeaderGroup>
          <HeaderGroup className="pr-8 md:pr-0">
            <HeaderControl>
              <CommandMenu pages={pages} email={email} github={github} linkedin={linkedin} />
            </HeaderControl>
            <HeaderControl className="has-data-[mode=hidden]:hidden">
              <MotionControlButton />
            </HeaderControl>
            <HeaderControl>
              <ModeToggle />
            </HeaderControl>
          </HeaderGroup>
        </HeaderBar>
        <MobileHeaderMenu />
      </div>
    </HeaderShell>
  );
}
