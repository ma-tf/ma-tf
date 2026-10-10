const domColliding = new Set([
  "AnimationEvent",
  "ClipboardEvent",
  "CompositionEvent",
  "DragEvent",
  "FocusEvent",
  "FormEvent",
  "InputEvent",
  "KeyboardEvent",
  "MouseEvent",
  "PointerEvent",
  "SubmitEvent",
  "TouchEvent",
  "TransitionEvent",
  "UIEvent",
  "WheelEvent",
]);

const noReactNamespace = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow React types referenced through the React namespace.",
    },
    messages: {
      namespace:
        'Import {{name}} from "react" and reference it directly instead of the React namespace.',
    },
  },
  createOnce(context) {
    return {
      TSQualifiedName(node) {
        if (node.left.type !== "Identifier" || node.left.name !== "React") return;
        const name = node.right.name;
        if (domColliding.has(name)) return;
        context.report({ node, messageId: "namespace", data: { name } });
      },
    };
  },
};

export default {
  meta: { name: "types" },
  rules: {
    "no-react-namespace": noReactNamespace,
  },
};
