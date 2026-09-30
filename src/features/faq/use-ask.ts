import { askSite, type AskSource } from "@features/faq/ask-site";
import { useCallback, useEffect, useRef, useState } from "react";

export type AskUnit =
  | { status: "idle" }
  | { status: "thinking" }
  | { status: "answered"; answer: string; sources: AskSource[] }
  | { status: "refused"; answer: string }
  | { status: "error" };

export function useAsk() {
  const [unit, setUnit] = useState<AskUnit>({ status: "idle" });
  const [question, setQuestion] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const ask = useCallback(
    (text: string) => {
      cancel();
      const controller = new AbortController();
      abortRef.current = controller;
      setQuestion(text);
      setUnit({ status: "thinking" });

      askSite(text, controller.signal).then(
        (result) => {
          if (controller.signal.aborted) return;

          setUnit(
            result.kind === "refusal"
              ? { status: "refused", answer: result.text }
              : { status: "answered", answer: result.text, sources: result.sources },
          );
        },
        () => {
          if (controller.signal.aborted) return;

          setUnit({ status: "error" });
        },
      );
    },
    [cancel],
  );

  const retry = useCallback(() => {
    if (question) ask(question);
  }, [ask, question]);

  useEffect(() => cancel, [cancel]);

  return { unit, question, ask, retry };
}
