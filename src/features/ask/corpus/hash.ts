import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const corpusRoot = fileURLToPath(new URL("../../../../", import.meta.url));

export const askTagsPath = fileURLToPath(new URL("../ask-tags.json", import.meta.url));
export const corpusOutputPath = fileURLToPath(
  new URL("../published-pages.generated.json", import.meta.url),
);
export const catalogueOutputPath = fileURLToPath(
  new URL("../../mcp/resources.generated.json", import.meta.url),
);

const hashFileCandidates = ["astro.config.mjs", "tsconfig.json"];

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((entry) => !entry.name.startsWith("."))
      .map((entry) => {
        const path = join(dir, entry.name);

        return entry.isDirectory() ? walkFiles(path) : Promise.resolve([path]);
      }),
  );

  return nested.flat();
}

const sourceRoot = join(corpusRoot, "src");
const renderRoots = [
  { dir: join(sourceRoot, "pages"), extensions: [".astro"] },
  { dir: join(sourceRoot, "features"), extensions: [".tsx", ".astro"] },
];

async function renderInputPaths(): Promise<string[]> {
  const found = await Promise.all(renderRoots.map(({ dir }) => walkFiles(dir)));

  return found.flat().filter((path) => {
    if (path === corpusOutputPath || path === catalogueOutputPath) return false;
    if (path.includes(".test.") || path.includes(".spec.")) return false;

    return renderRoots.some(
      ({ dir, extensions }) =>
        path.startsWith(`${dir}${sep}`) && extensions.some((extension) => path.endsWith(extension)),
    );
  });
}

const contentModule = "astro:content";
const contentConfig = join(sourceRoot, "content.config.ts");
const dependencyRoots = [
  join(sourceRoot, "features/mcp/catalogue.ts"),
  join(sourceRoot, "features/discovery/documents/llms.ts"),
  join(sourceRoot, "pages/mcp-catalogue.json.ts"),
  join(sourceRoot, "pages/llms.txt.ts"),
  join(sourceRoot, "pages/blog/llms.txt.ts"),
  join(sourceRoot, "pages/developers/llms.txt.ts"),
  join(sourceRoot, "pages/cv/llms.txt.ts"),
];
const scriptExtensions = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"];

function loadCompilerOptions(): ts.CompilerOptions {
  const config = ts.readConfigFile(join(corpusRoot, "tsconfig.json"), (path) =>
    ts.sys.readFile(path),
  );

  if (config.error) throw new Error("Could not read tsconfig.json for dependency resolution");

  return ts.parseJsonConfigFileContent(config.config, ts.sys, corpusRoot).options;
}

function importSpecifiers(path: string, source: string): string[] {
  const scriptKind =
    path.endsWith(".tsx") || path.endsWith(".jsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, scriptKind);
  const specifiers: string[] = [];

  const visit = (node: ts.Node): void => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const [argument] = node.arguments;
      if (argument && ts.isStringLiteral(argument)) specifiers.push(argument.text);
    }

    ts.forEachChild(node, visit);
  };

  visit(file);

  return specifiers;
}

function resolveLocalModule(
  specifier: string,
  containingFile: string,
  compilerOptions: ts.CompilerOptions,
): string | undefined {
  const resolved = ts.resolveModuleName(specifier, containingFile, compilerOptions, ts.sys)
    .resolvedModule?.resolvedFileName;

  return resolved?.startsWith(`${sourceRoot}${sep}`) ? resolved : undefined;
}

async function dependencyInputPaths(): Promise<string[]> {
  const compilerOptions = loadCompilerOptions();
  const seen = new Set<string>();
  const queue = [...dependencyRoots];
  let includesContent = false;

  while (queue.length > 0) {
    const path = queue.pop();
    if (!path || seen.has(path)) continue;

    seen.add(path);
    if (!scriptExtensions.some((extension) => path.endsWith(extension))) continue;

    for (const specifier of importSpecifiers(path, await readFile(path, "utf8"))) {
      if (specifier === contentModule) {
        includesContent = true;
        continue;
      }

      const resolved = resolveLocalModule(specifier, path, compilerOptions);
      if (resolved) queue.push(resolved);
    }
  }

  const content = includesContent
    ? [contentConfig, ...(await walkFiles(join(sourceRoot, "content")))]
    : [];

  return [
    ...new Set([
      ...seen,
      ...content,
      ...(await renderInputPaths()),
      askTagsPath,
      ...hashFileCandidates.map((file) => join(corpusRoot, file)),
    ]),
  ].filter((path) => path !== corpusOutputPath && path !== catalogueOutputPath);
}

export async function hashInputPaths(): Promise<string[]> {
  return (await dependencyInputPaths()).map((path) => relative(corpusRoot, path)).sort();
}

export async function corpusSourceHash(): Promise<string> {
  const paths = (await dependencyInputPaths()).sort();
  const contents = await Promise.all(
    paths.map(async (path) => {
      try {
        return await readFile(path);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;

        return null;
      }
    }),
  );
  const hash = createHash("sha256");

  for (const [index, path] of paths.entries()) {
    hash.update(relative(corpusRoot, path));
    hash.update("\0");

    const content = contents[index];
    hash.update(content ?? "\0missing");

    hash.update("\0");
  }

  return hash.digest("hex");
}
