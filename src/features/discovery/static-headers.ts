import type { APIRoute } from "astro";

import { linkHeader } from "@features/discovery/catalog";

const homepageHeaders = [`Link: ${linkHeader}`, "Vary: Accept"];

const headersByPath = {
  "/": homepageHeaders,
  "/index.md": ["Content-Type: text/markdown; charset=utf-8", ...homepageHeaders],
};

export function buildStaticHeaders(): string {
  return Object.entries(headersByPath)
    .map(([path, headers]) => [path, ...headers.map((header) => `  ${header}`), ""].join("\n"))
    .join("\n");
}

export const GET = (() => new Response(buildStaticHeaders())) satisfies APIRoute;
