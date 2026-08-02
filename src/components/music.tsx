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
    <div className={cn("w-480", className)} {...props}>
      {children}
    </div>
  );
}
