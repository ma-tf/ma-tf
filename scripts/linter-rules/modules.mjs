const noBarrelExports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow re-exporting symbols from another module.",
    },
    messages: {
      barrel:
        'Re-exporting from "{{source}}" hides where the symbol is defined. Import it where it is used instead.',
    },
  },
  createOnce(context) {
    return {
      ExportNamedDeclaration(node) {
        if (!node.source) return;
        context.report({ node, messageId: "barrel", data: { source: node.source.value } });
      },
      ExportAllDeclaration(node) {
        context.report({ node, messageId: "barrel", data: { source: node.source.value } });
      },
    };
  },
};

export default {
  meta: { name: "modules" },
  rules: {
    "no-barrel-exports": noBarrelExports,
  },
};
