import { defineConfig } from "react-doctor/api";

export default defineConfig({
  ignore: {
    files: [".scratch/**"],
    overrides: [
      {
        files: ["src/features/faq/faq-input.tsx"],
        rules: ["react-doctor/effect-needs-cleanup"],
      },
    ],
  },
});
