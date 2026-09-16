import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import { remarkReadingTime } from "./src/remark-reading-time.mjs";

export default defineConfig({
  site: "https://m4t.tf",
  output: "server",
  adapter: netlify({
    devFeatures: {
      environmentVariables: false,
      images: true,
      edgeFunctions: false,
    },
  }),
  integrations: [
    react(),
    mdx({
      processor: unified({ remarkPlugins: [remarkReadingTime] }),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      chunkSizeWarningLimit: 510,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [{ name: "hls", test: /node_modules\/hls\.js/ }],
          },
        },
      },
    },
  },
  image: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.m4t.tf" }],
  },
});
