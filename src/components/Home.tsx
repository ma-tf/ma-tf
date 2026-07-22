export function Home() {
  return (
    <div className="bg-background text-foreground flex h-screen justify-center">
      <div className="flex flex-col justify-center">
        <h1 className="text-foreground mb-2 text-4xl font-semibold">Under Construction</h1>
        <p className="text-muted-foreground mb-8 text-lg">Something is on its way.</p>
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
