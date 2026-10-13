const requireIconPostfix = {
  meta: {
    type: "problem",
    docs: {
      description: "Require the Icon postfix on Phosphor icon imports.",
    },
    messages: {
      postfix:
        "Use the {{renamed}} alias instead of the deprecated {{name}}. Importing the bare name pulls in the deprecated alias.",
    },
  },
  createOnce(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (source !== "@phosphor-icons/react" && source !== "@phosphor-icons/react/ssr") return;
        for (const specifier of node.specifiers) {
          if (specifier.type !== "ImportSpecifier") continue;
          const name = specifier.imported.name;
          if (name.endsWith("Icon") || name.startsWith("Icon")) continue;
          context.report({
            node: specifier,
            messageId: "postfix",
            data: { name, renamed: `${name}Icon` },
          });
        }
      },
    };
  },
};

export default {
  meta: { name: "icons" },
  rules: {
    "require-icon-postfix": requireIconPostfix,
  },
};
