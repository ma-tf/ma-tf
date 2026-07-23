import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    ignorePatterns: [".agents", ".astro", ".opencode"],
    sortTailwindcss: {
      functions: ["clsx", "cn"],
      preserveWhitespace: false,
      stylesheet: "./styles/global.css",
    },
    sortImports: {
      groups: [
        "type-import",
        ["value-builtin", "value-external"],
        "type-internal",
        "value-internal",
        ["type-parent", "type-sibling", "type-index"],
        ["value-parent", "value-sibling", "value-index"],
        "unknown",
      ],
    },
    sortPackageJson: true,
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
