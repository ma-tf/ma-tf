import type { ComponentProps } from "react";

import { washTintClasses, type WashColor } from "@components/wash";
import { CDN_BASE } from "@lib/cdn";
import { cn } from "cn";

const homePrevImages: Partial<Record<WashColor, string>> = {
  emerald: "/tags-prev.png",
  plum: "/projects-prev2.jpg",
  ember: `${CDN_BASE}/photography/luxembourg-19-statues.avif`,
  blue: "/bolex-dither-anon3.png",
  taupe: `${CDN_BASE}/music/japan-6-19.avif`,
};

const homePrevImageClasses: Partial<Record<WashColor, string>> = {
  ember: "-scale-x-100",
};

const prevLedColors = {
  red: "bg-ember-400",
  green: "bg-emerald-400",
} as const;

const landing = "pointer-events-none absolute h-0 w-0";

function WireLanding({
  className,
  origin,
  linked,
  ...props
}: ComponentProps<"span"> & {
  origin?: string;
  linked?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      data-wire-landing
      data-wire-origin={origin}
      data-wire-linked={linked || undefined}
      className={cn(landing, className)}
      {...props}
    />
  );
}

function PrevImageLayer({
  wash,
  className,
  ...props
}: ComponentProps<"div"> & {
  wash: WashColor;
}) {
  return (
    <div data-prev-image={wash} className={cn("absolute inset-0", className)} {...props}>
      <span aria-hidden="true" className={cn("absolute inset-0", washTintClasses[wash])} />
      <img
        src={homePrevImages[wash]}
        alt=""
        loading="lazy"
        decoding="async"
        className={cn("h-full w-full object-contain opacity-60", homePrevImageClasses[wash])}
      />
    </div>
  );
}

function PrevScreen({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div data-prev-screen className={cn("relative w-full overflow-clip", className)} {...props}>
      {children}
      <span
        aria-hidden="true"
        data-prev-loading
        className="pointer-events-none absolute inset-0 z-10 grid place-items-center font-mono text-2xs tracking-widest text-muted-foreground uppercase"
      >
        <span>Loading</span>
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-full animate-scanline"
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 crt-mask" />
    </div>
  );
}

function PrevBand({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-prev-band
      className={cn("relative min-h-0 w-120.25 -translate-y-5", className)}
      {...props}
    >
      <div className="absolute inset-0 -z-10 bg-muted/50" />
      <div
        data-prev-reveal
        className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 motion-reduce:transition-none"
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

type PrevLedProps = ComponentProps<"span"> & {
  tone: keyof typeof prevLedColors;
};

function PrevLed({ tone, className, ...props }: PrevLedProps) {
  return (
    <span
      aria-hidden="true"
      data-prev-led={tone}
      className={cn(
        "pointer-events-none absolute top-7.25 grid size-3 -translate-x-1/2 -translate-y-1/2 place-items-center transition-opacity duration-150 motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <span className={cn("size-1.5 rounded-full mix-blend-color-dodge", prevLedColors[tone])} />
      <span
        className={cn(
          "absolute -inset-1 rounded-full opacity-80 mix-blend-color-dodge blur-sm",
          prevLedColors[tone],
        )}
      />
    </span>
  );
}

function BottomPlate({ children, className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-preview-bottom
      className={cn(
        "relative z-10 block max-w-none -translate-y-5 drop-shadow-chrome transition-[translate] duration-150 motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

function FrontWires({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-home-wires-front
      stroke="currentColor"
      strokeWidth={1.25}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full overflow-visible fill-none text-border opacity-70",
        className,
      )}
      {...props}
    >
      <path data-home-wire-front d="" />
      <path data-home-wire-front d="" />
    </svg>
  );
}

export function HomePrev({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      data-fragments-avoid
      className={cn(
        "absolute top-1/2 right-16 isolate hidden -translate-y-1/2 flex-col items-start md:flex",
        className,
      )}
      {...props}
    >
      <img
        src="/home-prev-top2.png"
        alt=""
        loading="eager"
        decoding="async"
        className="relative z-10 max-w-none drop-shadow-chrome"
      />
      <WireLanding className="top-1 right-5" origin="120,118" />
      <WireLanding className="top-1 right-1" />
      <WireLanding className="top-3 right-5" origin="116,114" />
      <WireLanding className="top-3 right-1" />
      <WireLanding className="top-0.5 right-1" linked />
      <PrevBand>
        <PrevScreen>
          {(Object.keys(homePrevImages) as WashColor[]).map((wash) => (
            <PrevImageLayer key={wash} wash={wash} />
          ))}
        </PrevScreen>
      </PrevBand>
      <BottomPlate>
        <img
          src="/home-prev-bottom3.png"
          alt=""
          loading="eager"
          decoding="async"
          className="block max-w-none"
        />
        <PrevLed tone="red" className="left-115.5 opacity-100" />
        <PrevLed tone="green" className="left-118 opacity-0" />
        <WireLanding className="right-1 bottom-0" />
      </BottomPlate>
      <FrontWires />
    </div>
  );
}
