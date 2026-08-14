import { Card, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { cn } from "@lib/cn";

export function MusicPreview() {
  return (
    <Card className="w-3xl">
      <CardHeader>
        <CardTitle>
          <a
            href="/music"
            className="underline-offset-4 transition-colors hover:text-foreground/70 hover:underline"
          >
            Music
          </a>
        </CardTitle>
        <CardDescription>
          Original compositions, remixes, and live recordings spanning electronic and ambient
          sounds.
        </CardDescription>
      </CardHeader>
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
    <div className={cn("grid grid-cols-1 gap-6 md:grid-cols-3", className)} {...props}>
      {children}
    </div>
  );
}

export function MusicTitle({ children, className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-right text-9xl md:text-[240px]", className)} {...props}>
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
    <p className={cn("indent-8 text-2xl", className)} {...props}>
      {children}
    </p>
  );
}
