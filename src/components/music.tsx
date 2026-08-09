import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@components/ui/card";
import { cn } from "@lib/cn";

export function MusicPreview() {
  return (
    <Card className="w-3xl">
      <CardHeader>
        <CardTitle>Music</CardTitle>
        <CardDescription>
          Original compositions, remixes, and live recordings spanning electronic and ambient
          sounds.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <a
          href="/music"
          className="underline underline-offset-4 transition-colors hover:text-foreground/70"
        >
          Listen
        </a>
      </CardFooter>
    </Card>
  );
}

export function Music({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col justify-center", className)} {...props}>
      {children}
    </div>
  );
}

export function MusicContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)} {...props}>
      {children}
    </div>
  );
}

export function MusicTitle({ children, className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-9xl md:text-[240px] text-right", className)} {...props}>
      {children}
    </h2>
  );
}

export function MusicHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {children}
    </div>
  );
}

export function MusicDescription({ children, className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-2xl indent-8", className)} {...props}>
      {children}
    </p>
  );
}
