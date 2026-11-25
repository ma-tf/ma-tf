import type { Plugin, UserConfig } from "@commitlint/types";

const noClaudeCoAuthor: Plugin = {
  rules: {
    "no-claude-co-author": ({ raw }) => [
      !/^co-authored-by:.*\bclaude\b/im.test(raw ?? ""),
      "commits must not include a Co-Authored-By trailer naming Claude",
    ],
  },
};

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  plugins: [noClaudeCoAuthor],
  rules: {
    "body-max-length": [2, "always", 200],
    "no-claude-co-author": [2, "always"],
  },
};

export default config;
