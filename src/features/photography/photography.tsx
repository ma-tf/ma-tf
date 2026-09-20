import { useParallax } from "@hooks/use-parallax";
import { cn } from "cn";

export function Photography({ children, className, ...props }: React.ComponentProps<"div">) {
  const offset = useParallax();

  return (
    <div
      className={cn("max-w-480 self-center overflow-x-clip px-4 py-16", className)}
      style={
        {
          "--parallax-x": `${offset.x}px`,
          "--parallax-y": `${offset.y}px`,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  );
}

export function PhotographyHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex parallax-30 items-center justify-between gap-4 p-4 pb-16", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PhotographyTitle({ children, className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-9xl", className)} {...props}>
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
      className={cn("parallax-50 indent-8 text-4xl will-change-transform lg:col-span-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PhotographyGrid({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("min-w-0 parallax-20 will-change-transform lg:col-span-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PhotographyContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid auto-rows-auto grid-cols-1 gap-4 lg:grid-cols-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}
