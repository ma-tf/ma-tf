import { defineConfig } from "react-doctor/api";

export default defineConfig({
  ignore: {
    overrides: [
      {
        files: ["package.json"],
        rules: ["deslop/unused-dev-dependency"],
      },
    ],
  },
});
