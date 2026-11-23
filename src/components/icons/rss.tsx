"use client";

/**
 * Rss — animated Phosphor icon.
 *
 * Broadcasts — the dot beats and the arcs ripple outward.
 *
 * Geometry from Phosphor Icons (MIT, (c) 2023 Phosphor Icons). This file is yours:
 * the keyframes below are ordinary data, so retune or replace them freely.
 */

import {
  createAnimatedIcon,
  type Choreography,
  type IconGeometry,
} from "@components/icons/animated-icon";

const ARCS = [
  ["path", { d: "M56,136A64,64,0,0,1,120,200" }],
  ["path", { d: "M56,88A112,112,0,0,1,168,200" }],
  ["path", { d: "M56,41A159,159,0,0,1,215,200" }],
] satisfies IconGeometry["regular"];

const GEOMETRY: IconGeometry = {
  regular: [
    ["circle", { cx: "66", cy: "190", r: "12", fill: "currentColor", stroke: "none" }],
    ...ARCS,
  ],
  bold: [
    ["circle", { cx: "68", cy: "188", r: "16", fill: "currentColor", stroke: "none" }],
    ...ARCS,
  ],
};

const STROKE: Choreography = {
  duration: 0.7,
  parts: {
    0: {
      scale: [1, 1.35, 1],
      origin: [66, 190],
      ease: ["easeOut", "easeIn"],
    },
    1: {
      scale: [1, 1.08, 1],
      opacity: [1, 0.55, 1],
      origin: [56, 200],
      delay: 0.04,
    },
    2: {
      scale: [1, 1.07, 1],
      opacity: [1, 0.55, 1],
      origin: [56, 200],
      delay: 0.09,
    },
    3: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.55, 1],
      origin: [56, 200],
      delay: 0.14,
    },
  },
};

export const Rss = createAnimatedIcon("Rss", GEOMETRY, STROKE);

export default Rss;
