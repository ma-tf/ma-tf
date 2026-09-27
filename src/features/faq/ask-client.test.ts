import {
  getAskClient,
  setAskClient,
  type AskClient,
  type AskReply,
} from "@features/faq/ask-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const THINK_MS = 450;
const TOKEN_MS = 22;
const DRAIN_MS = THINK_MS + TOKEN_MS * 200;

let original: AskClient;

function ask(question: string) {
  const tokens: string[] = [];
  const replies: AskReply[] = [];
  let errored = false;

  const cancel = getAskClient().ask(question, {
    onToken: (token) => tokens.push(token),
    onDone: (reply) => replies.push(reply),
    onError: () => {
      errored = true;
    },
  });

  return { tokens, replies, cancel, hasErrored: () => errored };
}

beforeEach(() => {
  original = getAskClient();
  vi.useFakeTimers();
});

afterEach(() => {
  setAskClient(original);
  vi.useRealTimers();
});

describe("ask client seam", () => {
  it("reports the injected fixture through getAskClient", () => {
    const fixture: AskClient = { ask: () => () => {} };

    setAskClient(fixture);

    expect(getAskClient()).toBe(fixture);
  });
});

describe("stub ask client", () => {
  it("streams an answer from the matching entry", async () => {
    const { tokens, replies } = ask("who are you");

    await vi.advanceTimersByTimeAsync(DRAIN_MS);

    const [reply] = replies;

    expect(reply?.kind).toBe("answer");
    expect(reply?.text).toContain("full-stack developer");
    expect(tokens.join("")).toBe(reply?.text);
  });

  it("returns the canned refusal without streaming", async () => {
    const { tokens, replies } = ask("what is your salary");

    await vi.advanceTimersByTimeAsync(DRAIN_MS);

    expect(replies).toHaveLength(1);
    expect(replies[0]?.kind).toBe("refusal");
    expect(tokens).toEqual([]);
  });

  it("reports an error for a connection question", async () => {
    const { tokens, replies, hasErrored } = ask("network error");

    await vi.advanceTimersByTimeAsync(DRAIN_MS);

    expect(hasErrored()).toBe(true);
    expect(replies).toEqual([]);
    expect(tokens).toEqual([]);
  });

  it("falls back for an unclassifiable question", async () => {
    const { tokens, replies } = ask("what is the meaning of life");

    await vi.advanceTimersByTimeAsync(DRAIN_MS);

    const [reply] = replies;

    expect(reply?.kind).toBe("answer");
    expect(reply?.text).toContain("I can answer best");
    expect(tokens.join("")).toBe(reply?.text);
  });

  it("stops callbacks when cancelled before thinking finishes", async () => {
    const { tokens, replies, hasErrored, cancel } = ask("who are you");

    cancel();
    await vi.advanceTimersByTimeAsync(DRAIN_MS);

    expect(tokens).toEqual([]);
    expect(replies).toEqual([]);
    expect(hasErrored()).toBe(false);
  });

  it("stops the token stream when cancelled mid-reply", async () => {
    const { tokens, replies, cancel } = ask("who are you");

    await vi.advanceTimersByTimeAsync(THINK_MS + TOKEN_MS * 2);
    const streamed = tokens.length;

    cancel();
    await vi.advanceTimersByTimeAsync(DRAIN_MS);

    expect(tokens).toHaveLength(streamed);
    expect(replies).toEqual([]);
  });
});
