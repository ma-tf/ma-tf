import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { workerData } from "node:worker_threads";

function existingFile(candidate) {
  if (!candidate) return null;
  try {
    return fs.statSync(candidate).isFile() ? candidate : null;
  } catch {
    return null;
  }
}

function stylesheetAt(dir, name) {
  const base = path.join(dir, name);
  return (
    existingFile(base) ?? existingFile(`${base}.css`) ?? existingFile(path.join(base, "index.css"))
  );
}

function styleTarget(entry) {
  if (typeof entry === "string") return entry;
  if (!entry || typeof entry !== "object") return null;
  for (const key of ["style", "default"]) {
    const target = styleTarget(entry[key]);
    if (target) return target;
  }
  return null;
}

function exportedStyle(exports, subpath) {
  const exact = styleTarget(exports[`./${subpath}`]);
  if (exact) return exact;
  const patterns = Object.keys(exports)
    .filter((key) => key.startsWith("./") && key.includes("*"))
    .sort((a, b) => b.length - a.length);
  for (const key of patterns) {
    const star = key.indexOf("*");
    const prefix = key.slice(2, star);
    const suffix = key.slice(star + 1);
    if (
      subpath.length < prefix.length + suffix.length ||
      !subpath.startsWith(prefix) ||
      !subpath.endsWith(suffix)
    ) {
      continue;
    }
    const target = styleTarget(exports[key]);
    if (!target) continue;
    return target.replace("*", subpath.slice(prefix.length, subpath.length - suffix.length));
  }
  return null;
}

function packageDirectory(base, name) {
  let dir = base;
  for (let depth = 0; depth < 32; depth++) {
    const candidate = path.join(dir, "node_modules", name);
    if (existingFile(path.join(candidate, "package.json"))) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function resolveStylesheet(base, id) {
  if (id === "tailwindcss") return resolveStylesheet(base, "tailwindcss/index.css");
  if (id.startsWith(".") || path.isAbsolute(id)) {
    return stylesheetAt(path.dirname(path.resolve(base, id)), path.basename(id));
  }
  const match = id.match(/^(@[^/]+\/[^/]+|[^/]+)(?:\/(.*))?$/);
  if (!match) return null;
  const [, name, subpath] = match;
  const pkgDir = packageDirectory(base, name);
  if (!pkgDir) return null;
  let pkg = {};
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf-8"));
  } catch {}
  const exports = pkg.exports;
  if (subpath) {
    const target = exports && typeof exports === "object" ? exportedStyle(exports, subpath) : null;
    if (target) return existingFile(path.join(pkgDir, target));
    return stylesheetAt(path.dirname(path.join(pkgDir, subpath)), path.basename(subpath));
  }
  const rootTarget =
    typeof exports === "string"
      ? exports
      : exports && typeof exports === "object"
        ? styleTarget(exports["."] ?? exports)
        : null;
  for (const target of [rootTarget, pkg.style, pkg.main]) {
    if (typeof target !== "string") continue;
    const file = existingFile(path.join(pkgDir, target));
    if (file) return file;
  }
  return stylesheetAt(pkgDir, "index");
}

const systems = new Map();

async function designSystem(cssFile) {
  const resolved = path.resolve(cssFile);
  if (systems.has(resolved)) return systems.get(resolved);
  const pending = (async () => {
    const require = createRequire(path.join(path.dirname(resolved), "noop.js"));
    const twPath = require.resolve("tailwindcss");
    const twMod = await import(pathToFileURL(twPath).href);
    const tw = twMod.__unstable__loadDesignSystem ? twMod : twMod.default;
    const css = fs.readFileSync(resolved, "utf-8");
    return tw.__unstable__loadDesignSystem(css, {
      base: path.dirname(resolved),
      async loadStylesheet(id, from) {
        const found = resolveStylesheet(from, id);
        if (!found) throw new Error(`@import "${id}" unresolved from ${from}`);
        return {
          base: path.dirname(found),
          content: fs.readFileSync(found, "utf-8"),
        };
      },
    });
  })();
  systems.set(resolved, pending);
  try {
    return await pending;
  } catch (error) {
    systems.delete(resolved);
    throw error;
  }
}

const port = workerData?.port;

port?.on("message", async (message) => {
  const { id, cssFile, candidates, shared } = message;
  let answer = null;
  try {
    const ds = await designSystem(cssFile);
    const css = ds.candidatesToCss(candidates);
    answer = candidates.filter((_, index) => css[index] === null);
  } catch {
    answer = null;
  }
  port.postMessage({ id, answer });
  const flag = new Int32Array(shared);
  Atomics.store(flag, 0, 1);
  Atomics.notify(flag, 0);
});
