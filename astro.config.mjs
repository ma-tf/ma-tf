import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import { remarkReadingTime } from "./src/remark-reading-time.mjs";

export default defineConfig({
  site: "https://m4t.tf",
  integrations: [
    react(),
    sitemap(),
    mdx({
      processor: unified({ remarkPlugins: [remarkReadingTime] }),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    remotePatterns: [{ protocol: "https" }],
  },
});
