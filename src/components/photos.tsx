import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@components/ui/card";
import { cn } from "@lib/cn";

export function PhotosPreview() {
  return (
    <Card className="w-3xl">
      <CardHeader>
        <CardTitle>Photography</CardTitle>
        <CardDescription>
          In my spare time I am an amateur photographer. The photographs I take are in both digital
          and film formats.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <a
          href="/photos"
          className="underline underline-offset-4 transition-colors hover:text-foreground/70"
        >
          View gallery
        </a>
      </CardFooter>
    </Card>
  );
}

export function Photos({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid grid-cols-1 lg:grid-cols-6 auto-rows-auto gap-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PhotosHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("lg:col-span-2 p-4 flex-col flex gap-4", className)} {...props}>
      {children}
    </div>
  );
}

export function PhotosTitle({ children, className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-lg", className)} {...props}>
      {children}
    </h2>
  );
}

export function PhotosDescription({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-4xl indent-8", className)} {...props}>
      {children}
    </div>
  );
}

export function PhotosContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("lg:col-span-4", className)} {...props}>
      {children}
    </div>
  );
}
