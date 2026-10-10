import { askSite, type AskAnswer } from "@features/faq/ask-site";

const DESCRIPTION =
  "Answer a question from the content published on m4t.tf and return the answer with its source pages. Use for questions about Matt Fehrenbach's work, writing, background, projects, or anything else m4t.tf publishes.";

const INPUT_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  properties: {
    question: {
      type: "string",
      description: "The question to answer from m4t.tf's published content.",
    },
  },
  required: ["question"],
};

type AskToolInput = { question?: unknown };

type AskToolResult = AskAnswer | { error: string };

type ModelContextTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: {
    readOnlyHint: boolean;
    openWorldHint: boolean;
    untrustedContentHint: boolean;
  };
  execute: (input: AskToolInput, options: { signal: AbortSignal }) => Promise<AskToolResult>;
};

type ModelContext = {
  registerTool: (tool: ModelContextTool) => Promise<void>;
};

function getModelContext(): ModelContext | undefined {
  return (document as Document & { modelContext?: ModelContext }).modelContext;
}

function makeTool(): ModelContextTool {
  return {
    name: "ask_site",
    description: DESCRIPTION,
    inputSchema: INPUT_SCHEMA,
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      untrustedContentHint: false,
    },
    async execute(input, { signal }) {
      const question = input.question;

      if (typeof question !== "string" || question.trim().length === 0) {
        return { error: "Provide a non-empty 'question'." };
      }

      try {
        return await askSite(question, signal);
      } catch {
        signal.throwIfAborted();

        return { error: "Couldn't reach the site agent. Try again." };
      }
    },
  };
}

export function registerAskTool(): void {
  const modelContext = getModelContext();

  if (!modelContext || typeof modelContext.registerTool !== "function") {
    console.info("WebMCP is unavailable; ask_site was not registered.");
    return;
  }

  void modelContext.registerTool(makeTool()).catch((error: unknown) => {
    console.warn("ask_site registration failed", error);
  });
}
