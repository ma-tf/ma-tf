import { readFileSync, statSync } from "node:fs";
import { registerHooks } from "node:module";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

function stripGlob(value) {
  return value.endsWith("*") ? value.slice(0, -1) : value;
}

const tsconfig = JSON.parse(readFileSync(join(root, "tsconfig.json"), "utf8"));

const aliases = Object.entries(tsconfig.compilerOptions.paths)
  .map(([key, targets]) => [stripGlob(key), stripGlob(targets[0])])
  .sort(([a], [b]) => b.length - a.length);

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
