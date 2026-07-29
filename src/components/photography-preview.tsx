export function PhotographyPreview() {
  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-3 text-center">
        <h2 className="text-2xl font-semibold">Photography</h2>
        <p className="text-muted-foreground max-w-sm prose">
          In my spare time I am an amateur photographer. The photographs I take are in both digital
          and film formats.
        </p>
        <a
          href="/photography"
          className="underline underline-offset-4 transition-colors hover:text-foreground/70"
        >
          View gallery
        </a>
      </div>
    </div>
  );
}
