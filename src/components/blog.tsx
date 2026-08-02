import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@components/ui/card";

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
