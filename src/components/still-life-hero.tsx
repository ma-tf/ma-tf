import { cn } from "cn";

export function StillLifeHero({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid min-h-dvh grid-rows-[150dvh_auto] content-start md:grid-cols-10 md:grid-rows-[1fr_auto] md:content-normal",
        className,
      )}
      {...props}
    />
  );
}

export function StillLifeHeroHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-parallax={40}
      className={cn(
        "sticky top-0 col-start-1 row-start-1 flex h-dvh items-start justify-end px-6 pt-8 text-center md:static md:col-start-6 md:mt-24 md:h-auto md:items-center md:justify-start md:px-0 md:pt-0",
        className,
      )}
      {...props}
    />
  );
}
