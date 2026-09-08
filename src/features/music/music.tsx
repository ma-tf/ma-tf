import { NavButton } from "@components/nav-button";
import { cn } from "@lib/cn";
import { previews } from "@lib/feature-flags";

const MUSIC_NAVIGATION_LINKS = [
  { href: "/", label: "Home", enabled: true },
  { href: "/blog", label: "Blog", enabled: true },
  { href: "/photography", label: "Photography", enabled: previews.photography },
  { href: "/vignettes", label: "Vignettes", enabled: previews.vignettes },
] as const;

export function Music({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex w-full max-w-360 flex-col justify-center self-center bg-background px-8 py-24 lg:w-3/4 lg:border-r lg:border-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function MusicContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("grid grid-cols-1 gap-6 md:grid-cols-3", className)} {...props}>
      {children}
    </div>
  );
}

export function MusicTitle({ children, className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-right text-9xl md:text-[156px] lg:text-[240px]", className)} {...props}>
      {children}
    </h2>
  );
}

export function MusicHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col py-8", className)} {...props}>
      {children}
    </div>
  );
}

export function MusicNavigation() {
  return (
    <nav className="flex flex-wrap justify-end gap-1" aria-label="Section navigation">
      {MUSIC_NAVIGATION_LINKS.filter(({ enabled }) => enabled).map(({ href, label }) => (
        <NavButton key={href} href={href}>
          {label}
        </NavButton>
      ))}
    </nav>
  );
}

export function MusicDescription({ children, className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("indent-8 text-xl md:text-xl lg:text-2xl", className)} {...props}>
      {children}
    </p>
  );
}
