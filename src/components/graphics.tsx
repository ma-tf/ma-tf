import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@components/ui/card";

export function Graphics() {
  return (
    <Card className="w-3xl">
      <CardHeader>
        <CardTitle>Graphics</CardTitle>
        <CardDescription>
          Digital illustrations, UI concepts, and visual experiments across various media.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <a
          href="/graphics"
          className="underline underline-offset-4 transition-colors hover:text-foreground/70"
        >
          View work
        </a>
      </CardFooter>
    </Card>
  );
}
