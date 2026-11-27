import type { AstroIntegration } from "astro";

import { readFile, writeFile } from "node:fs/promises";

type Convert = (html: string) => Promise<string>;

export async function writeHomeMarkdown(outDir: URL, convert: Convert): Promise<void> {
  const html = await readFile(new URL("index.html", outDir), "utf8");

  await writeFile(new URL("index.md", outDir), await convert(html));
}

export function staticHomepage(convert: Convert): AstroIntegration {
  return {
    name: "static-homepage",
    hooks: {
      "astro:config:setup": ({ injectRoute }) => {
        injectRoute({
          pattern: "/_headers",
          entrypoint: "./src/features/discovery/static-headers.ts",
          prerender: true,
        });
      },
      "astro:build:done": ({ dir }) => writeHomeMarkdown(dir, convert),
    },
  };
}
