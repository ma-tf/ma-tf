import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

import { remarkReadingTime } from "./src/remark-reading-time.mjs";

export default defineConfig({
  site: "https://m4t.tf",
  output: "server",
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
    processor: unified({ remarkPlugins: [remarkReadingTime] }),
  },
  integrations: [react(), mdx()],
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
