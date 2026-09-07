import { useParallax } from "@hooks/use-parallax";
import { cn } from "@lib/cn";

export function Photography({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("max-w-480 self-center overflow-x-clip px-4", className)} {...props}>
      {children}
    </div>
  );
}

export function PhotographyHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  const offset = useParallax();

  return (
    <div
      className={cn("flex items-center justify-between gap-4 p-4", className)}
      style={{ transform: `translate(${offset.x * 0.3}px, ${offset.y * 0.3}px)` }}
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
  const offset = useParallax();

  return (
    <div
      className={cn("indent-8 text-4xl will-change-transform lg:col-span-2", className)}
      style={{ transform: `translate(${offset.x * 0.2}px, ${offset.y * 0.2}px)` }}
      {...props}
    >
      {children}
    </div>
  );
}

export function PhotographyGrid({ children, className, ...props }: React.ComponentProps<"div">) {
  const offset = useParallax();

  return (
    <div
      className={cn("min-w-0 will-change-transform lg:col-span-4", className)}
      style={{ transform: `translate(${offset.x * 0.5}px, ${offset.y * 0.5}px)` }}
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
