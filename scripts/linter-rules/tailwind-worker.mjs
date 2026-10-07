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

function isRecord(value) {
  return typeof value === "object" && value !== null;
}

function firstTarget(entry) {
  for (const key of ["style", "default"]) {
    const target = styleTarget(entry[key]);
    if (target) return target;
  }
  return null;
}

function styleTarget(entry) {
  if (typeof entry === "string") return entry;
  if (!isRecord(entry)) return null;
  return firstTarget(entry);
}

function wildcardKeys(exports) {
  return Object.keys(exports)
    .filter((key) => key.startsWith("./") && key.includes("*"))
    .sort((a, b) => b.length - a.length);
}

function patternParts(key) {
  const star = key.indexOf("*");
  return { prefix: key.slice(2, star), suffix: key.slice(star + 1) };
}

function patternMatches(subpath, prefix, suffix) {
  if (subpath.length < prefix.length + suffix.length) return false;
  if (!subpath.startsWith(prefix)) return false;
  return subpath.endsWith(suffix);
}

function patternTarget(exports, key, subpath) {
  const { prefix, suffix } = patternParts(key);
  if (!patternMatches(subpath, prefix, suffix)) return null;
  const target = styleTarget(exports[key]);
  if (!target) return null;
  return target.replace("*", subpath.slice(prefix.length, subpath.length - suffix.length));
}

function exportedStyle(exports, subpath) {
  const exact = styleTarget(exports[`./${subpath}`]);
  if (exact) return exact;
  for (const key of wildcardKeys(exports)) {
    const target = patternTarget(exports, key, subpath);
    if (target) return target;
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

function splitPackageId(id) {
  const match = id.match(/^(@[^/]+\/[^/]+|[^/]+)(?:\/(.*))?$/);
  if (!match) return null;
  return { name: match[1], subpath: match[2] };
}

function readPackage(pkgDir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf-8"));
  } catch {
    return {};
  }
}

function rootExportTarget(exports) {
  if (typeof exports === "string") return exports;
  if (!isRecord(exports)) return null;
  return styleTarget(exports["."] ?? exports);
}

function exportedTarget(pkgDir, exports, subpath) {
  const target = isRecord(exports) ? exportedStyle(exports, subpath) : null;
  if (target) return existingFile(path.join(pkgDir, target));
  return stylesheetAt(path.dirname(path.join(pkgDir, subpath)), path.basename(subpath));
}

function packageRootStylesheet(pkgDir, pkg) {
  for (const target of [rootExportTarget(pkg.exports), pkg.style, pkg.main]) {
    if (typeof target !== "string") continue;
    const file = existingFile(path.join(pkgDir, target));
    if (file) return file;
  }
  return stylesheetAt(pkgDir, "index");
}

function bareStylesheet(base, id) {
  const split = splitPackageId(id);
  if (!split) return null;
  const pkgDir = packageDirectory(base, split.name);
  if (!pkgDir) return null;
  const pkg = readPackage(pkgDir);
  if (split.subpath) return exportedTarget(pkgDir, pkg.exports, split.subpath);
  return packageRootStylesheet(pkgDir, pkg);
}

function resolveStylesheet(base, id) {
  if (id === "tailwindcss") return resolveStylesheet(base, "tailwindcss/index.css");
  if (id.startsWith(".") || path.isAbsolute(id)) {
    return stylesheetAt(path.dirname(path.resolve(base, id)), path.basename(id));
  }
  return bareStylesheet(base, id);
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
