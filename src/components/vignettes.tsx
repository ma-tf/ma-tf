import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@components/ui/card";

export function Vignettes() {
  return (
    <Card className="w-3xl">
      <CardHeader>
        <CardTitle>Vignettes</CardTitle>
        <CardDescription>Experimental motion work exploring through the lens.</CardDescription>
      </CardHeader>
      <CardFooter>
        <a
          href="/vignettes"
          className="underline underline-offset-4 transition-colors hover:text-foreground/70"
        >
          View vignettes
        </a>
      </CardFooter>
    </Card>
  );
}
