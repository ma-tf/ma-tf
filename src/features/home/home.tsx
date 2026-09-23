import { siteIdentity } from "@features/seo/site-metadata";

export function Home() {
  return (
    <div className="flex h-dvh justify-center bg-background text-foreground">
      <div className="flex flex-col justify-center">
        <h1 className="mb-2 animate-fade-up text-4xl font-semibold text-foreground">
          Under Construction
        </h1>
        <p className="mb-8 animate-fade-up text-lg text-muted-foreground animation-delay-50">
          Something is on its way.
        </p>
        <div className="flex animate-fade-up flex-col gap-3 animation-delay-100">
          <span>{siteIdentity.name}</span>
          <a className="text-foreground/70 hover:underline" href="https://github.com/ma-tf">
            github.com/ma-tf
          </a>
        </div>
      </div>
    </div>
  );
}
