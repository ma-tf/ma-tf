import { cn } from "@lib/cn";

export function Vignettes({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-h-dvh w-full flex-col overflow-x-clip bg-slate-200 pt-16 dark:bg-slate-800",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function VignettesContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto flex w-full max-w-6xl flex-col gap-4", className)} {...props}>
      {children}
    </div>
  );
}

export function VignettesHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto flex w-full max-w-6xl justify-end", className)} {...props}>
      {children}
    </div>
  );
}

export function VignettesTitle({ children, className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "mr-8 cursor-default border-x border-t border-zinc-50 bg-zinc-50 px-2 text-lg dark:bg-zinc-950",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}
