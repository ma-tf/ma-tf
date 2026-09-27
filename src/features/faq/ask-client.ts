export type AskReply = { kind: "answer" | "refusal"; text: string };

export type AskHandlers = {
  onToken: (token: string) => void;
  onDone: (reply: AskReply) => void;
  onError: () => void;
};

export interface AskClient {
  ask(question: string, handlers: AskHandlers): () => void;
}

/*
 * Temporary stand-in for the real agent pipeline. Ticket 07 replaces the
 * default client with the `POST /ask` SSE transport; ticket 08 injects a
 * fixture client through `setAskClient`. Until then the homepage answers from
 * canned site copy so the interaction can be built and reviewed.
 */
const REFUSAL_TEXT =
  "I can only answer from what's published on this site, and that isn't covered. Try asking about Matt's work, the writing, or the site's machine-readable surface.";

const REFUSAL_MATCH = /salary|address|phone|passport|bank|password|private life|off-topic/i;
const ERROR_MATCH = /connection error|network error|timeout/i;

const ENTRIES: Array<{ match: RegExp; text: string }> = [
  {
    match: /who|about|yourself|you do/i,
    text: "I'm Matt, a full-stack developer based in Luxembourg. I started programming in 2013 and have worked professionally since 2018, across public safety, finance, and intellectual property.",
  },
  {
    match: /contact|email|reach|get in touch/i,
    text: "Email is the only contact channel published on the site: admin@m4t.tf. There's no contact form and no second inbox.",
  },
  {
    match: /agent|machine|llms|openapi|crawl|api/i,
    text: "Yes. Every page is served as HTML or markdown, and the site publishes an agent guide at /llms.txt, an OpenAPI document at /openapi.json, and a full content archive at /llms-full.txt.",
  },
  {
    match: /cv|experience|work|skill|stack|technolog|career/i,
    text: "The CV page has the full history. Broadly, that's full-stack work since 2018 across public safety, finance, and intellectual property, with TypeScript, React, and Node.js as the everyday tools.",
  },
  {
    match: /photograph|music|graphic|vignette|creative|hobb/i,
    text: "There are four bodies of creative work on the site: photography, graphics, music, and vignettes. Each has its own section linked from the home page.",
  },
];

const FALLBACK =
  "I can answer best about Matt's background, his writing, and the machine-readable surface this site publishes. Ask about any of those and I'll pull the details from the published pages.";

const THINK_MS = 450;
const TOKEN_MS = 22;

type AskOutcome = { kind: "error" } | { kind: "reply"; reply: AskReply };

function tokenise(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [text];
}

function resolveOutcome(question: string): AskOutcome {
  if (ERROR_MATCH.test(question)) return { kind: "error" };
  if (REFUSAL_MATCH.test(question)) {
    return { kind: "reply", reply: { kind: "refusal", text: REFUSAL_TEXT } };
  }
  const entry = ENTRIES.find((candidate) => candidate.match.test(question));

  return { kind: "reply", reply: { kind: "answer", text: entry ? entry.text : FALLBACK } };
}

const stubAskClient: AskClient = {
  ask(question, handlers) {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const finish = (reply: AskReply) => {
      if (!cancelled) handlers.onDone(reply);
    };

    timer = setTimeout(() => {
      if (cancelled) return;
      const outcome = resolveOutcome(question);

      if (outcome.kind === "error") {
        handlers.onError();
        return;
      }

      const { reply } = outcome;

      if (reply.kind === "refusal") {
        finish(reply);
        return;
      }

      const tokens = tokenise(reply.text);
      let index = 0;

      const stream = () => {
        if (cancelled) return;
        if (index >= tokens.length) {
          finish(reply);
          return;
        }
        handlers.onToken(tokens[index]!);
        index += 1;
        timer = setTimeout(stream, TOKEN_MS);
      };

      stream();
    }, THINK_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  },
};

let activeClient: AskClient = stubAskClient;

export function setAskClient(client: AskClient) {
  activeClient = client;
}

export function getAskClient() {
  return activeClient;
}
