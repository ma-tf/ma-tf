import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const SELF = fileURLToPath(new URL("./docs.mjs", import.meta.url));
const DEFAULT_LIMIT = 5000;
const ROOT_FILES = ["AGENTS.md", "README.md"];
const GENERATED = new Set([path.join(ROOT, "docs", "vite-plus.md")]);

function markdownFiles(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(entry.parentPath, entry.name));
}

function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function limitFrom(options) {
  const limit = options[0]?.limit;

  return typeof limit === "number" && limit > 0 ? limit : DEFAULT_LIMIT;
}

function oversized(limit) {
  const files = markdownFiles(path.join(ROOT, "docs")).concat(
    ROOT_FILES.map((name) => path.join(ROOT, name)),
  );

  return files
    .filter((file) => !GENERATED.has(file))
    .map((file) => ({ file, chars: fs.readFileSync(file, "utf8").length }))
    .filter(({ chars }) => chars > limit)
    .sort((a, b) => b.chars - a.chars)
    .map(({ file, chars }) => ({
      file: relative(file),
      chars,
      over: chars - limit,
      limit,
    }));
}

const maxChars = {
  meta: {
    type: "problem",
    docs: {
      description: "Cap the size of the markdown files agents read.",
    },
    messages: {
      maxChars: "{{file}} is {{chars}} characters, {{over}} over the {{limit}} limit.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: { limit: { minimum: 1, type: "number" } },
        type: "object",
      },
    ],
  },
  create(context) {
    const limit = limitFrom(context.options ?? []);

    return {
      Program(node) {
        const filename = path.isAbsolute(context.filename)
          ? context.filename
          : path.resolve(ROOT, context.filename);

        if (filename !== SELF) return;

        for (const finding of oversized(limit)) {
          context.report({ node, messageId: "maxChars", data: finding });
        }
      },
    };
  },
};

export default {
  meta: { name: "docs" },
  rules: {
    "max-chars": maxChars,
  },
};
