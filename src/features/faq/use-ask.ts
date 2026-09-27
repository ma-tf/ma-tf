import { getAskClient, type AskReply } from "@features/faq/ask-client";
import { useCallback, useEffect, useRef, useState } from "react";

export type AskUnit =
  | { status: "idle" }
  | { status: "thinking" }
  | { status: "streaming"; answer: string }
  | { status: "done"; answer: string }
  | { status: "refused"; answer: string }
  | { status: "error" };

export function useAsk() {
  const [unit, setUnit] = useState<AskUnit>({ status: "idle" });
  const [question, setQuestion] = useState("");
  const cancelRef = useRef<(() => void) | null>(null);

  const cancel = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
  }, []);

  const ask = useCallback(
    (text: string) => {
      cancel();
      setQuestion(text);
      setUnit({ status: "thinking" });

      cancelRef.current = getAskClient().ask(text, {
        onToken: (token) =>
          setUnit((current) => ({
            status: "streaming",
            answer: (current.status === "streaming" ? current.answer : "") + token,
          })),
        onDone: (reply: AskReply) =>
          setUnit(
            reply.kind === "refusal"
              ? { status: "refused", answer: reply.text }
              : { status: "done", answer: reply.text },
          ),
        onError: () => setUnit({ status: "error" }),
      });
    },
    [cancel],
  );

  const retry = useCallback(() => {
    if (question) ask(question);
  }, [ask, question]);

  useEffect(() => cancel, [cancel]);

  return { unit, question, ask, retry };
}
