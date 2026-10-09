import { cn } from "cn";

export function Photography({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("w-full max-w-480 self-center overflow-x-clip px-4 py-16", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PhotographyHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-parallax={30}
      className={cn(
        "flex flex-col items-start gap-4 p-4 pb-8 md:flex-row md:items-center md:justify-between",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PhotographyTitle({ children, className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-5xl md:text-8xl lg:text-9xl", className)} {...props}>
      {children}
    </h2>
  );
}

export function PhotographyDescription({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-parallax={50}
      className={cn("px-2 indent-8 text-lg md:col-span-2 md:text-2xl", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PhotographyGrid({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-parallax={20} className={cn("min-w-0 md:col-span-4", className)} {...props}>
      {children}
    </div>
  );
}

export function PhotographyContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid auto-rows-auto grid-cols-1 gap-4 md:grid-cols-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}
