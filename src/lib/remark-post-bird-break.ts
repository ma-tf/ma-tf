export type Node = {
  type: string;
  name?: string;
  value?: unknown;
  alt?: unknown;
  depth?: number;
  attributes?: unknown[];
  children?: Node[];
};

type File = {
  extname?: string;
  path?: string;
  data?: { astro?: { frontmatter?: { slug?: unknown } } };
};

const contentTypes = new Set([
  "blockquote",
  "code",
  "heading",
  "html",
  "list",
  "mdxJsxFlowElement",
  "paragraph",
  "table",
  "thematicBreak",
]);

function text(node: Node): string {
  if (typeof node.value === "string") return node.value;
  if (typeof node.alt === "string") return node.alt;
  return (node.children ?? []).map(text).join(" ");
}

function wordCount(node: Node): number {
  return text(node).trim().split(/\s+/).filter(Boolean).length;
}

function contentOf(children: Node[]): { node: Node; index: number }[] {
  const content: { node: Node; index: number }[] = [];
  children.forEach((node, index) => {
    if (contentTypes.has(node.type)) content.push({ node, index });
  });
  return content;
}

function separatesHeading(above: Node, below: Node): boolean {
  return above.type === "heading" || below.type === "heading";
}

export function postBirdBreakIndex(children: Node[]): number | undefined {
  const content = contentOf(children);
  if (content.length < 3) return undefined;

  const total = content.reduce((sum, { node }) => sum + wordCount(node), 0);
  if (total === 0) return undefined;

  let previous = content[0];
  if (previous === undefined) return undefined;

  let above = 0;
  let best: { index: number; distance: number } | undefined;

  for (const current of content.slice(1)) {
    above += wordCount(previous.node);
    if (!separatesHeading(previous.node, current.node)) {
      const distance = Math.abs(above * 2 - total);
      if (best === undefined || distance < best.distance) best = { index: current.index, distance };
    }
    previous = current;
  }

  return best?.index;
}

function isPublishedPost(file: File): boolean {
  const isMdx = file.extname === ".mdx" || file.path?.endsWith(".mdx") === true;
  return isMdx && typeof file.data?.astro?.frontmatter?.slug === "string";
}

function hasBreak(tree: { children: Node[] }): boolean {
  return tree.children.some(
    (node) => node.type === "mdxJsxFlowElement" && node.name === "PostBirdBreak",
  );
}

export function remarkPostBirdBreak() {
  return function (tree: { children: Node[] }, file: File): void {
    if (!Array.isArray(tree.children) || !isPublishedPost(file)) return;
    if (hasBreak(tree)) return;

    const index = postBirdBreakIndex(tree.children);
    if (index === undefined) return;

    tree.children.splice(index, 0, {
      type: "mdxJsxFlowElement",
      name: "PostBirdBreak",
      attributes: [],
      children: [],
    });
  };
}
