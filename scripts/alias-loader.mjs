import { statSync } from "node:fs";
import { registerHooks } from "node:module";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

const aliases = [
  ["@/", ""],
  ["@content/", "src/content/"],
  ["@features/", "src/features/"],
  ["@hooks/", "src/hooks/"],
  ["@layouts/", "src/layouts/"],
  ["@lib/", "src/lib/"],
  ["@stores/", "src/stores/"],
  ["@components/", "src/components/"],
  ["@pages/", "src/pages/"],
  ["@data/", "src/data/"],
  ["@ui/", "src/components/ui/"],
];

const extensions = [".ts", ".tsx", ".mts", ".cts", ".js", ".mjs", ".jsx", ".cjs", ".json"];

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function probe(base) {
  if (isFile(base)) return base;

  for (const extension of extensions) {
    if (isFile(`${base}${extension}`)) return `${base}${extension}`;
  }

  for (const extension of extensions) {
    if (isFile(join(base, `index${extension}`))) return join(base, `index${extension}`);
  }

  return undefined;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    for (const [prefix, target] of aliases) {
      if (!specifier.startsWith(prefix)) continue;

      const rest = specifier.slice(prefix.length);
      const file = probe(resolve(root, target, rest));

      if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
    }

    return nextResolve(specifier, context);
  },
});
