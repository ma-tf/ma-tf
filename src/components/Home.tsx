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

export function Blog() {
  return (
    <div className="flex h-120 justify-center bg-red-100">
      <div className="flex flex-col justify-center">
        <span>Preview and link for blog content</span>
      </div>
    </div>
  );
}

export function Projects() {
  return (
    <div className="flex h-120 justify-center bg-blue-100">
      <div className="flex flex-col justify-center">
        <span>Preview and link for programming content</span>
      </div>
    </div>
  );
}

export function Photography() {
  return (
    <div className="flex h-120 justify-center bg-green-100">
      <div className="flex flex-col justify-center">
        <span>Preview and link for photography content</span>
      </div>
    </div>
  );
}

export function Filmography() {
  return (
    <div className="flex h-120 justify-center bg-cyan-100">
      <div className="flex flex-col justify-center">
        <span>Preview and link for cinematography content</span>
      </div>
    </div>
  );
}

export function Graphics() {
  return (
    <div className="flex h-120 justify-center bg-yellow-100">
      <div className="flex flex-col justify-center">
        <span>Preview and link for graphics content</span>
      </div>
    </div>
  );
}

export function Music() {
  return (
    <div className="flex h-120 justify-center bg-mauve-100">
      <div className="flex flex-col justify-center">
        <span>Preview and link for music content</span>
      </div>
    </div>
  );
}
