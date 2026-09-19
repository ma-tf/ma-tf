import { cn } from "cn";

export function Vignettes({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-h-dvh w-full flex-col overflow-x-clip bg-vignettes-surface py-16",
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
    <h2 className={cn("mr-8 text-lg text-vignettes-ink-foreground", className)} {...props}>
      {children}
    </h2>
  );
}
