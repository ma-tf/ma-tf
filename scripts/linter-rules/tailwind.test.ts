import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vite-plus/test";

import plugin, {
  classCandidates,
  maskedChars,
  matchBrace,
  templateCandidates,
} from "@/scripts/linter-rules/tailwind.mjs";

type Report = { messageId: string; data: { className: string } };

type RuleContext = {
  filename: string;
  cwd: string;
  report: (report: Report) => void;
};

const rule = plugin.rules["no-unknown-classes"] as unknown as {
  createOnce: (context: RuleContext) => {
    before?: () => void;
    Program: (node: unknown) => void;
  };
};

const directories: string[] = [];

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function temporaryDirectory(prefix: string): string {
  const directory = mkdtempSync(join(tmpdir(), prefix));
  directories.push(directory);
  return directory;
}

function temporaryProject(files: Record<string, string>): string {
  const directory = temporaryDirectory("tailwind-rule-");
  for (const [relative, contents] of Object.entries(files)) {
    const full = join(directory, relative);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, contents);
  }
  symlinkSync(
    fileURLToPath(new URL("../../node_modules", import.meta.url)),
    join(directory, "node_modules"),
    "dir",
  );
  return directory;
}

const project = {
  "components.json": JSON.stringify({ tailwind: { css: "src/styles/global.css" } }),
  "src/styles/global.css": '@import "tailwindcss";\n',
};

function templateTokens(file: string): string[] {
  return templateCandidates(file).map((candidate: { token: string }) => candidate.token);
}

function visit(filename: string, visits: number, cwd: string): Report[] {
  const reports: Report[] = [];
  const context: RuleContext = {
    filename,
    cwd,
    report: (report) => reports.push(report),
  };
  const visitor = rule.createOnce(context);
  for (let index = 0; index < visits; index++) {
    visitor.before?.();
    visitor.Program({ type: "Program" });
  }
  return reports;
}

describe("maskedChars", () => {
  it("blanks quoted spans with spaces and keeps code-point length", () => {
    expect(maskedChars('<div class="p-4 flex">x</div>').join("")).toBe(
      "<div class=          >x</div>",
    );
  });

  it("keeps backtick templates inside expressions masked", () => {
    expect(maskedChars("<div class={cn(`p-4 ${x}`)}>y</div>").join("")).toBe(
      "<div class={cn(          )}>y</div>",
    );
  });

  it("keeps astral characters as single entries", () => {
    const masked = maskedChars('😀<div class="p-4">x</div>');
    expect(masked.length).toBe(25);
    expect(masked.join("")).toBe("😀<div class=  -4  x</div>");
  });

  it("leaves an escaped quote unmasked", () => {
    expect(maskedChars('<div class="p-4\\" tail">y</div>').join("")).toBe(
      "<div class=            >y</div>",
    );
  });
});

describe("classCandidates", () => {
  it("reads quoted attributes with code-point indices", () => {
    expect(classCandidates('<div class="p-4 flex">x</div>')).toEqual([
      { token: "p-4", index: 12 },
      { token: "flex", index: 16 },
    ]);
  });

  it("reads class:list expressions", () => {
    expect(classCandidates('<div class:list={["p-4", active && "flex"]}>x</div>')).toEqual([
      { token: "p-4", index: 19 },
      { token: "flex", index: 36 },
    ]);
  });

  it("shifts indices by code points for astral characters", () => {
    expect(classCandidates('😀<div class="p-4">x</div>')).toEqual([{ token: "p-4", index: 14 }]);
  });

  it("reads multiline attributes", () => {
    expect(classCandidates('<div\n  class="p-4\n    flex"\n></div>')).toEqual([
      { token: "p-4", index: 14 },
      { token: "flex", index: 22 },
    ]);
  });

  it("ignores non-string expressions", () => {
    expect(classCandidates('<div class={a("}")}>x</div>')).toEqual([]);
    expect(classCandidates('<div class={cn("a", cond ? { b: x } : "c")}>z</div>')).toEqual([
      { token: "a", index: 16 },
      { token: "c", index: 39 },
    ]);
  });
});

describe("matchBrace", () => {
  it("skips a closing brace inside a string", () => {
    const source = '<div class={a("}")}>x</div>';
    expect(matchBrace(maskedChars(source), 11)).toBe(source.indexOf("}>"));
  });
});

describe("templateCandidates", () => {
  it("reads markup past the frontmatter and caches per file", () => {
    const directory = temporaryDirectory("tailwind-template-");
    const file = join(directory, "Test.astro");
    writeFileSync(
      file,
      '---\nconst className = "class=\\"nope\\"";\n---\n<div class="p-4 flex">x</div>\n',
    );

    const first = templateCandidates(file);
    expect(templateTokens(file)).toEqual(["p-4", "flex"]);
    expect(templateCandidates(file)).toEqual(first);
  });

  it("re-reads a file whose size changed", () => {
    const directory = temporaryDirectory("tailwind-template-");
    const file = join(directory, "Test.astro");
    writeFileSync(file, '<div class="p-4">x</div>\n');
    expect(templateTokens(file)).toEqual(["p-4"]);

    writeFileSync(file, '<div class="p-4 m-2 gap-1">x</div>\n');
    expect(templateTokens(file)).toEqual(["p-4", "m-2", "gap-1"]);
  });
});

describe("no-unknown-classes", () => {
  it("reports each unknown class once per file across fragment visits", async () => {
    const directory = temporaryProject({
      ...project,
      "src/Test.astro": '<div class="p-4 not-a-class also-not-a-class">x</div>\n',
    });

    const reports = visit(join(directory, "src/Test.astro"), 3, directory);

    expect(reports.map((report) => report.messageId)).toEqual(["unknownClass", "unknownClass"]);
    expect(reports.map((report) => report.data.className).sort()).toEqual([
      "also-not-a-class",
      "not-a-class",
    ]);
  });

  it("reports the same unknown class in another file", async () => {
    const directory = temporaryProject({
      ...project,
      "src/One.astro": '<div class="not-a-class">x</div>\n',
      "src/Two.astro": '<div class="not-a-class">y</div>\n',
    });

    expect(visit(join(directory, "src/One.astro"), 1, directory)).toHaveLength(1);
    expect(visit(join(directory, "src/Two.astro"), 1, directory)).toHaveLength(1);
  });
});
