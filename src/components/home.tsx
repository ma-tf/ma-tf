export function Home() {
  return (
    <div className="flex h-dvh justify-center bg-background text-foreground">
      <div className="flex flex-col justify-center">
        <h1 className="mb-2 text-4xl font-semibold text-foreground">Under Construction</h1>
        <p className="mb-8 text-lg text-muted-foreground">Something is on its way.</p>
        <div className="flex flex-col gap-3">
          <span>Matt F</span>
          <a className="text-foreground/70 hover:underline" href="https://github.com/ma-tf">
            github.com/ma-tf
          </a>
        </div>
      </div>
    </div>
  );
}
