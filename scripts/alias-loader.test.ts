import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const root = fileURLToPath(new URL("../", import.meta.url));
const loader = "--import ./scripts/alias-loader.mjs";
const call = /node\s+((?:--[\w-]+(?:\s+\S+)?\s+)*)scripts\/([\w./-]+\.mts)/g;
const aliasImport = /from\s+"@\//;

function markdownFiles() {
  const docs = fs
    .readdirSync(path.join(root, "docs"), { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(entry.parentPath, entry.name));
  const named = ["AGENTS.md", "README.md"].map((name) => path.join(root, name));

  return docs.concat(named);
}

function sites() {
  const markdown = markdownFiles().map((file) => ({
    file,
    text: fs.readFileSync(file, "utf8"),
  }));
  const manifest = fs.readFileSync(path.join(root, "package.json"), "utf8");
  const scripts = Object.values(JSON.parse(manifest).scripts).map((text) => ({
    file: "package.json",
    text: String(text),
  }));

  return markdown.concat(scripts);
}

function usesAliases(name: string) {
  const file = path.join(root, "scripts", name);

  return fs.existsSync(file) && aliasImport.test(fs.readFileSync(file, "utf8"));
}

function scan() {
  const violations: string[] = [];
  const checked = new Set<string>();

  for (const site of sites()) {
    for (const match of site.text.matchAll(call)) {
      const flags = match[1] ?? "";
      const name = match[2];
      if (!name || !usesAliases(name)) continue;
      checked.add(name);
      if (!flags.replace(/\s+/g, " ").includes(loader)) {
        violations.push(`${site.file}: node ${flags}scripts/${name}`);
      }
    }
  }

  return { checked: [...checked].sort(), violations };
}

describe("alias loader", () => {
  it("launches every alias-importing script through the alias loader", () => {
    expect(scan().violations).toEqual([]);
  });

  it("checks a non-empty set of alias-importing scripts", () => {
    expect(scan().checked).toContain("probe.mts");
  });
});
