import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

import { htmlToMarkdown } from "./src/features/discovery/html-markdown.ts";
import { staticHomepage } from "./src/features/discovery/static-homepage.ts";
import { remarkPostBirdBreak } from "./src/lib/remark-post-bird-break.ts";
import { remarkReadingTime } from "./src/remark-reading-time.mjs";

export default defineConfig({
  site: "https://m4t.tf",
  output: "static",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  adapter: netlify({
    devFeatures: {
      environmentVariables: false,
      edgeFunctions: false,
    },
  }),
  env: {
    schema: {
      TYPESAFE_API_KEY: envField.string({ context: "server", access: "secret" }),
      OPENAI_API_KEY: envField.string({ context: "server", access: "secret" }),
    },
  },
  markdown: {
    processor: unified({ remarkPlugins: [remarkReadingTime, remarkPostBirdBreak] }),
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    },
  },
  integrations: [react(), mdx(), staticHomepage(htmlToMarkdown)],
  vite: {
    plugins: [tailwindcss()],
    build: {
      chunkSizeWarningLimit: 570,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [{ name: "hls", test: /node_modules\/hls\.js/ }],
          },
        },
      },
    },
  },
});
