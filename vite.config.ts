import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    ignorePatterns: [".agents", ".astro", ".opencode"],
    sortTailwindcss: true,
  },
  lint: {
    ignorePatterns: [".agents", ".astro", ".opencode"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    options: { typeAware: true, typeCheck: true },
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
  },
  staged: {
    "*.{js,json,mjs,ts,tsx}": "vp check --fix",
    "*.astro": "vpx astro check",
  },
});
