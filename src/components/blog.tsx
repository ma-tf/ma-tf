import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@components/ui/card";
import { cn } from "@lib/cn";

export function BlogPreview() {
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

export function Blog({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export function BlogHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("w-2/5 flex flex-col gap-4 justify-center text-right", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function BlogTitle({ children, className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1 className={cn("text-8xl", className)} {...props}>
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
    <div className={cn("w-3/5 flex flex-col justify-center", className)} {...props}>
      {children}
    </div>
  );
}
