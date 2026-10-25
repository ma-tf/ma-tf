import fs from "node:fs";
import path from "node:path";

const { classAttributes, skipComment, skipQuoted, templateStart } = await import(
  new URL("./tailwind.mjs", import.meta.url).href
);

const SNIPPET_LIMIT = 60;

function contextFilename(context) {
  return context.filename ?? context.physicalFilename ?? "";
}

function readAstro(filename) {
  try {
    return fs.readFileSync(path.resolve(filename), "utf-8");
  } catch {
    return null;
  }
}

function snippet(text) {
  const line = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return line.length > SNIPPET_LIMIT ? `${line.slice(0, SNIPPET_LIMIT - 1)}…` : line;
}

function nodeText(context, node) {
  return snippet(context.sourceCode?.getText(node) ?? "");
}

const childFields = {
  CallExpression: ["arguments"],
  ConditionalExpression: ["consequent", "alternate"],
  LogicalExpression: ["left", "right"],
  BinaryExpression: ["left", "right"],
  ArrayExpression: ["elements"],
  ParenthesizedExpression: ["expression"],
  TSAsExpression: ["expression"],
  TSSatisfiesExpression: ["expression"],
  TSNonNullExpression: ["expression"],
  TSTypeAssertion: ["expression"],
  TSInstantiationExpression: ["expression"],
  ChainExpression: ["expression"],
  AwaitExpression: ["argument"],
  SequenceExpression: ["expressions"],
  TaggedTemplateExpression: ["quasi"],
  SpreadElement: ["argument"],
};

function objectValues(node) {
  return (node.properties ?? []).map((property) => property.value);
}

function childNodes(node) {
  if (node?.type === "ObjectExpression") return objectValues(node);
  return (childFields[node?.type] ?? []).flatMap((field) =>
    Array.isArray(node[field]) ? node[field] : [node[field]],
  );
}

function dynamicComposition(node) {
  if (!node) return false;
  if (node.type === "TemplateLiteral") return (node.expressions?.length ?? 0) > 0;
  if (node.type === "BinaryExpression" && node.operator === "+") return true;
  return childNodes(node).some((child) => dynamicComposition(child));
}

function templateInterpolates(source, index) {
  for (let i = index + 1; i < source.length; i++) {
    if (source[i] === "\\") {
      i++;
      continue;
    }
    if (source[i] === "`") return false;
    if (source[i] === "$" && source[i + 1] === "{") return true;
  }
  return false;
}

function tokenEnd(source, index) {
  const char = source[index];
  if (char === '"' || char === "'") return skipQuoted(source, index + 1, char);
  if (char === "`") return skipQuoted(source, index + 1, "`");
  if (char === "/" && (source[index + 1] === "/" || source[index + 1] === "*")) {
    return skipComment(source, index);
  }
  return index + 1;
}

function dynamicClassExpression(source) {
  for (let i = 0; i < source.length;) {
    if (source[i] === "+") return true;
    if (source[i] === "`" && templateInterpolates(source, i)) return true;
    i = tokenEnd(source, i);
  }
  return false;
}

function classNameExpression(node) {
  if (node.name?.type !== "JSXIdentifier" || node.name.name !== "className") return null;
  if (node.value?.type !== "JSXExpressionContainer") return null;
  const expression = node.value.expression;
  if (!expression || expression.type === "JSXEmptyExpression") return null;
  return dynamicComposition(expression) ? expression : null;
}

function isComponentFile(filename) {
  return filename.endsWith(".tsx") || filename.endsWith(".jsx");
}

const noClassInterpolation = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow interpolated class names in JSX className attributes and Astro class markup.",
    },
    messages: {
      className:
        "This className is built with interpolation. Compose complete class strings with cn() instead.",
      astroClass:
        "This class attribute is built with interpolation. Use class:list so each class is a complete string.",
      astroList:
        "This class:list entry is built with interpolation. Use a complete class string instead of a template literal or concatenation.",
    },
  },
  createOnce(context) {
    return {
      Program(node) {
        const filename = contextFilename(context);
        if (!filename.endsWith(".astro")) return;
        const source = readAstro(filename);
        if (source === null) return;
        const attributes = classAttributes(source.slice(templateStart(source)));
        for (const attribute of attributes) {
          if (attribute.kind !== "expression") continue;
          if (!dynamicClassExpression(attribute.value)) continue;
          context.report({
            node,
            messageId: attribute.name === "class:list" ? "astroList" : "astroClass",
            data: { snippet: snippet(attribute.value) },
          });
        }
      },
      JSXAttribute(node) {
        if (!isComponentFile(contextFilename(context))) return;
        const expression = classNameExpression(node);
        if (!expression) return;
        context.report({
          node: expression,
          messageId: "className",
          data: { snippet: nodeText(context, expression) },
        });
      },
    };
  },
};

export { dynamicClassExpression, dynamicComposition };

export default {
  meta: { name: "classes" },
  rules: {
    "no-class-interpolation": noClassInterpolation,
  },
};
