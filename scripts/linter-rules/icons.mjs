const iconSources = new Set(["@phosphor-icons/react", "@phosphor-icons/react/ssr"]);

function needsIconPostfix(specifier) {
  if (specifier.type !== "ImportSpecifier") return false;

  const { name } = specifier.imported;

  return !name.endsWith("Icon") && !name.startsWith("Icon");
}

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
        if (!iconSources.has(node.source.value)) return;
        for (const specifier of node.specifiers.filter(needsIconPostfix)) {
          const { name } = specifier.imported;
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
