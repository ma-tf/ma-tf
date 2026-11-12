import type { ComponentProps } from "react";

import { SPHERE_START_ANGLE, sphereStrokes } from "@lib/sphere-geometry";
import { cva, type VariantProps } from "class-variance-authority";

const SPHERE_STROKE_ID_PREFIX = "sphere-stroke";

const SPHERE_PATHS = sphereStrokes(SPHERE_START_ANGLE);

const sphereStrokeId = (index: number) => `${SPHERE_STROKE_ID_PREFIX}-${index}`;

const sphereVariants = cva("block h-full w-full fill-none sphere-vector", {
  variants: {
    variant: {
      base: "stroke-border",
      spotlight: "stroke-foreground/10",
    },
  },
  defaultVariants: {
    variant: "base",
  },
});

export function Sphere({
  variant,
  ...props
}: ComponentProps<"svg"> & VariantProps<typeof sphereVariants>) {
  return (
    <svg
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      focusable="false"
      data-sphere-grid
      className={sphereVariants({ variant })}
      {...props}
    >
      {variant === "spotlight"
        ? SPHERE_PATHS.map((_, i) => <use key={i} href={`#${sphereStrokeId(i)}`} />)
        : SPHERE_PATHS.map((d, i) => <path key={i} id={sphereStrokeId(i)} d={d} />)}
    </svg>
  );
}
