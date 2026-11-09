import type { ComponentProps } from "react";

import { cn } from "cn";

export function Photography({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("w-full max-w-480 self-center overflow-x-clip px-4 py-16", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PhotographyHeader({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-parallax={30}
      className={cn(
        "flex flex-col items-start gap-4 p-4 pb-8 md:flex-row md:items-center md:justify-between",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PhotographyTitle({ children, className, ...props }: ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-5xl md:text-8xl lg:text-9xl", className)} {...props}>
      {children}
    </h2>
  );
}

export function PhotographyDescription({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-parallax={50}
      className={cn("px-2 indent-8 text-lg md:col-span-3 md:text-2xl lg:col-span-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PhotographyGrid({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-parallax={20}
      className={cn("min-w-0 md:col-span-3 lg:col-span-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PhotographyCameras({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 items-center justify-items-center gap-4 py-8 indent-0",
        className,
      )}
      {...props}
    >
      <button
        type="button"
        data-camera
        aria-label="Shake the Canon EOS-1V"
        className="cursor-pointer"
      >
        <img
          src="https://cdn.m4t.tf/photography/canoneos1v.png"
          width={554}
          height={421}
          alt="Canon EOS-1V"
          loading="lazy"
          decoding="async"
          className="h-auto w-32 animate-reveal drop-shadow-chrome"
        />
      </button>
      <button
        type="button"
        data-camera
        aria-label="Shake the Olympus mju mini Digital"
        className="cursor-pointer"
      >
        <img
          src="https://cdn.m4t.tf/photography/olympusmjumini.png"
          width={554}
          height={421}
          alt="Olympus mju mini Digital"
          loading="lazy"
          decoding="async"
          className="h-auto w-32 animate-reveal drop-shadow-chrome"
        />
      </button>
      <button
        type="button"
        data-camera
        aria-label="Shake the Ricoh Mirai"
        className="cursor-pointer"
      >
        <img
          src="https://cdn.m4t.tf/photography/ricohmirai.png"
          width={554}
          height={421}
          alt="Ricoh Mirai"
          loading="lazy"
          decoding="async"
          className="h-auto w-32 animate-reveal drop-shadow-chrome"
        />
      </button>
    </div>
  );
}

export function PhotographyContent({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("grid auto-rows-auto grid-cols-1 gap-4 md:grid-cols-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}
