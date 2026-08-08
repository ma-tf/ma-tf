import { cn } from "@lib/cn";

export function PhotographDescription({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("lg:col-span-2 p-4 flex-col flex gap-4", className)} {...props}>
      {children}
    </div>
  );
}

export function PhotographDescriptionHeader({
  children,
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-lg", className)} {...props}>
      {children}
    </h2>
  );
}

export function PhotographDescriptionContent({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-4xl indent-8", className)} {...props}>
      {children}
    </div>
  );
}
