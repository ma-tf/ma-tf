import { cn } from "cn";
export function TagLink({ children, className, ...props }: React.ComponentProps<"a">) {
  return (
    <span
      className={cn(
        "relative inline-block [--tag-cut:var(--border)] hover:[--tag-cut:var(--foreground)]",
        className,
      )}
    >
      <a
        className={cn(
          "block border border-(--tag-cut) bg-background/90 px-3 py-1 text-sm tag-cut-transition cut-corner",
        )}
        {...props}
      >
        {children}
      </a>
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 h-2.5 w-2.5 tag-cut-corner tag-cut-transition"
      />
    </span>
  );
}
