import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    ignorePatterns: [".agents", ".astro", ".opencode"],
    sortTailwindcss: {
      functions: ["cn"],
      preserveWhitespace: false,
      stylesheet: "./src/styles/global.css",
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
    jsPlugins: [
      { name: "vite-plus", specifier: "vite-plus/oxlint-plugin" },
      { name: "shadcn", specifier: "@shadcn/lint" },
    ],
    options: { typeAware: true, typeCheck: true },
    rules: {
      "shadcn/no-arbitrary-values": [
        "error",
        {
          allow: ["transition-*", "origin-*", "grid-rows-*"],
        },
      ],
      "shadcn/no-inline-styles": "error",
      "shadcn/no-raw-colors": "error",
      "shadcn/no-restyle": ["error"],
      "shadcn/no-unknown-classes": "error",
      "shadcn/require-static-classes": "error",
      "vite-plus/prefer-vite-plus-imports": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./*", "../*"],
              message: "Use a path alias (e.g. @features/...) instead of ./ relative imports",
            },
          ],
        },
      ],
    },
    overrides: [
      {
        files: ["src/components/ui/**"],
        rules: {
          "shadcn/no-restyle": "off",
          "shadcn/no-arbitrary-values": "off",
          "shadcn/require-static-classes": "off",
        },
      },
      {
        files: ["src/features/**/*-preview.tsx"],
        rules: { "shadcn/no-raw-colors": "off" },
      },
    ],
  },
  staged: {
    "*.{js,json,mjs,ts,tsx}": "vp check --fix",
    "*.astro": "vpx astro check",
  },
  test: {
    alias: {
      "@/": fileURLToPath(new URL("./", import.meta.url)),
      "@content": fileURLToPath(new URL("./src/content", import.meta.url)),
      "@features": fileURLToPath(new URL("./src/features", import.meta.url)),
    },
  },
});
