import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";

import plugin, {
  dynamicClassExpression,
  dynamicComposition,
} from "@/scripts/linter-rules/classes.mjs";

type Node = { type: string; [key: string]: unknown };

type Report = { messageId: string; data: { snippet: string }; node: unknown };

type Visitor = {
  Program?: (node: unknown) => void;
  JSXAttribute?: (node: unknown) => void;
};

type RuleContext = {
  filename: string;
  cwd: string;
  sourceCode: { getText: (node: unknown) => string };
  report: (report: Report) => void;
};

const rule = plugin.rules["no-class-interpolation"] as unknown as {
  createOnce: (context: RuleContext) => Visitor;
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

function temporaryFile(name: string, contents: string): string {
  const directory = temporaryDirectory("classes-rule-");
  const file = join(directory, name);
  writeFileSync(file, contents);
  return file;
}

function reportsFor(filename: string, visit: (visitor: Visitor) => void, text = ""): Report[] {
  const reports: Report[] = [];
  const context: RuleContext = {
    filename,
    cwd: process.cwd(),
    sourceCode: { getText: () => text },
    report: (report) => reports.push(report),
  };
  visit(rule.createOnce(context));
  return reports;
}

function astroReports(source: string): Report[] {
  const file = temporaryFile("Test.astro", source);
  return reportsFor(file, (visitor) => visitor.Program?.({ type: "Program" }));
}

function expressionReports(expression: Node, text = ""): Report[] {
  const file = temporaryFile("Test.tsx", "const value = 1;\n");
  const attribute = {
    type: "JSXAttribute",
    name: { type: "JSXIdentifier", name: "className" },
    value: { type: "JSXExpressionContainer", expression },
  };
  return reportsFor(file, (visitor) => visitor.JSXAttribute?.(attribute), text);
}

function identifier(name: string): Node {
  return { type: "Identifier", name };
}

function literal(value: string): Node {
  return { type: "Literal", value };
}

function template(...expressions: Node[]): Node {
  return { type: "TemplateLiteral", expressions };
}

function call(...args: Node[]): Node {
  return { type: "CallExpression", arguments: args };
}

function plus(left: Node, right: Node): Node {
  return { type: "BinaryExpression", operator: "+", left, right };
}

function logical(left: Node, right: Node): Node {
  return { type: "LogicalExpression", operator: "&&", left, right };
}

function conditional(test: Node, consequent: Node, alternate: Node): Node {
  return { type: "ConditionalExpression", test, consequent, alternate };
}

describe("dynamicClassExpression", () => {
  it("flags interpolated templates", () => {
    expect(dynamicClassExpression("`p-4 ${size}`")).toBe(true);
  });

  it("ignores static templates", () => {
    expect(dynamicClassExpression("`p-4`")).toBe(false);
  });

  it("flags concatenation", () => {
    expect(dynamicClassExpression('"p-4 " + size')).toBe(true);
  });

  it("flags concatenation nested in arrays and calls", () => {
    expect(dynamicClassExpression('["p-4 " + size]')).toBe(true);
    expect(dynamicClassExpression('cn("p-4", active && "x" + size)')).toBe(true);
  });

  it("ignores cn calls with conditionals", () => {
    expect(dynamicClassExpression('cn("p-4", active && "x")')).toBe(false);
  });

  it("flags interpolated templates in ternary branches", () => {
    expect(dynamicClassExpression('active ? `p-4 ${size}` : "p-2"')).toBe(true);
  });

  it("ignores strings and comments containing operators or backticks", () => {
    expect(dynamicClassExpression('"p-4 + size" // `p-4 ${size}`')).toBe(false);
    expect(dynamicClassExpression('/* `p-4 ${size}` */ "p-4"')).toBe(false);
    expect(dynamicClassExpression("'a + b' + comment")).toBe(true);
  });

  it("flags nested template braces", () => {
    expect(dynamicClassExpression('`p-4 ${condition ? `p-2 ${size}` : ""}`')).toBe(true);
  });

  it("ignores static class:list arrays", () => {
    expect(dynamicClassExpression('[rowSpan, "grid"]')).toBe(false);
  });
});

describe("dynamicComposition", () => {
  it("flags interpolated templates", () => {
    expect(dynamicComposition(template(identifier("size")))).toBe(true);
  });

  it("ignores static templates", () => {
    expect(dynamicComposition(template())).toBe(false);
  });

  it("flags string concatenation", () => {
    expect(dynamicComposition(plus(literal("p-4 "), identifier("size")))).toBe(true);
  });

  it("ignores cn calls with conditionals", () => {
    expect(
      dynamicComposition(
        call(identifier("cn"), literal("p-4"), logical(identifier("active"), literal("x"))),
      ),
    ).toBe(false);
  });

  it("ignores plain identifiers", () => {
    expect(dynamicComposition(identifier("classes"))).toBe(false);
  });

  it("flags a template nested in a call", () => {
    expect(dynamicComposition(call(identifier("cn"), template(identifier("size"))))).toBe(true);
  });

  it("flags a template in a ternary branch", () => {
    expect(
      dynamicComposition(
        conditional(identifier("active"), literal("p-2"), template(identifier("size"))),
      ),
    ).toBe(true);
  });

  it("flags a template nested in a call inside a conditional", () => {
    expect(
      dynamicComposition(
        conditional(
          identifier("active"),
          call(identifier("cn"), template(identifier("size"))),
          literal("p-2"),
        ),
      ),
    ).toBe(true);
  });

  it("does not follow parent links", () => {
    const node: Node & { parent?: Node } = identifier("classes");
    node.parent = template(identifier("size"));
    expect(dynamicComposition(node)).toBe(false);
  });
});

describe("no-class-interpolation in Astro", () => {
  it("reports interpolated class attributes", () => {
    const reports = astroReports("<div class={`p-4 ${size}`}>x</div>\n");

    expect(reports.map((report) => report.messageId)).toEqual(["astroClass"]);
    expect(reports[0]?.data.snippet).toBe("`p-4 ${size}`");
  });

  it("ignores static class:list arrays", () => {
    expect(astroReports('<div class:list={[rowSpan, "grid"]}>x</div>\n')).toEqual([]);
  });

  it("reports interpolated templates inside class:list", () => {
    const reports = astroReports('<div class:list={[`p-4 ${size}`, "grid"]}>x</div>\n');

    expect(reports.map((report) => report.messageId)).toEqual(["astroList"]);
  });

  it("reports concatenation inside class:list", () => {
    const reports = astroReports('<div class:list={["p-4 " + size, "grid"]}>x</div>\n');

    expect(reports.map((report) => report.messageId)).toEqual(["astroList"]);
  });

  it("ignores quoted class attributes and static templates", () => {
    expect(astroReports('<div class="p-4 ${size}">x</div>\n')).toEqual([]);
    expect(astroReports("<div class={`p-4`}>x</div>\n")).toEqual([]);
  });

  it("ignores class markup in the frontmatter", () => {
    expect(
      astroReports('---\nconst source = "class={`p-4 ${size}`}";\n---\n<div class="p-4">x</div>\n'),
    ).toEqual([]);
  });

  it("reports a multiline attribute once", () => {
    const reports = astroReports("<div\n  class={`p-4 ${size}`}\n>x</div>\n");

    expect(reports.map((report) => report.messageId)).toEqual(["astroClass"]);
  });
});

describe("no-class-interpolation in JSX", () => {
  it("reports interpolated className expressions", () => {
    const expression = template(identifier("size"));
    const reports = expressionReports(expression, "`p-4 ${size}`");

    expect(reports.map((report) => report.messageId)).toEqual(["className"]);
    expect(reports[0]?.node).toBe(expression);
    expect(reports[0]?.data.snippet).toBe("`p-4 ${size}`");
  });

  it("ignores static expressions and cn calls", () => {
    expect(expressionReports(template(), "`p-4`")).toEqual([]);
    expect(
      expressionReports(
        call(identifier("cn"), literal("p-4"), logical(identifier("active"), literal("x"))),
        'cn("p-4", active && "x")',
      ),
    ).toEqual([]);
  });

  it("routes each extension to its own visitor without double reporting", () => {
    const expression = template(identifier("size"));
    const attribute = {
      type: "JSXAttribute",
      name: { type: "JSXIdentifier", name: "className" },
      value: { type: "JSXExpressionContainer", expression },
    };
    const tsx = temporaryFile("Test.tsx", "const a = <div className={`p-4 ${size}`} />;\n");

    const tsxReports = reportsFor(
      tsx,
      (visitor) => {
        visitor.Program?.({ type: "Program" });
        visitor.JSXAttribute?.(attribute);
      },
      "`p-4 ${size}`",
    );

    expect(tsxReports.map((report) => report.messageId)).toEqual(["className"]);

    const astro = temporaryFile("Test.astro", "<div class={`p-4 ${size}`}>x</div>\n");

    const astroFileReports = reportsFor(astro, (visitor) => {
      visitor.Program?.({ type: "Program" });
      visitor.JSXAttribute?.(attribute);
    });

    expect(astroFileReports.map((report) => report.messageId)).toEqual(["astroClass"]);
  });
});
