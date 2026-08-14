import { Card, CardHeader, CardTitle, CardDescription } from "@components/ui/card";

export function Graphics() {
  return (
    <Card className="w-3xl">
      <CardHeader>
        <CardTitle>
          <a
            href="/graphics"
            className="underline-offset-4 transition-colors hover:text-foreground/70 hover:underline"
          >
            Graphics
          </a>
        </CardTitle>
        <CardDescription>
          Digital illustrations, UI concepts, and visual experiments across various media.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
