import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@components/ui/card";
import { cn } from "@lib/cn";

export function Blog() {
  return (
    <Card className="w-3xl">
      <CardHeader>
        <CardTitle>Blog</CardTitle>
        <CardDescription>
          I write about web development, creative coding, and things I learn along the way.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <a
          href="/blog"
          className="underline underline-offset-4 transition-colors hover:text-foreground/70"
        >
          Read posts
        </a>
      </CardFooter>
    </Card>
  );
}

export function BlogHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {children}
    </div>
  );
}

export function BlogTitle({ children, className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1 className={cn("text-4xl font-bold", className)} {...props}>
      {children}
    </h1>
  );
}

export function BlogDescription({ children, className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-xl text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function BlogContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}
