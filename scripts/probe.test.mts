import type { Page } from "playwright";

import { describe, expect, it } from "vite-plus/test";

import { parseClip, preparePage } from "@/scripts/probe.mts";

function stubPage(calls: string[]) {
  const target = (name: string) => () => {
    calls.push(name);
    return Promise.resolve();
  };
  return {
    goto: target("goto"),
    evaluate: target("evaluate"),
    locator: (selector: string) => ({
      first: () => ({
        hover: () => {
          calls.push(`hover:${selector}`);
          return Promise.resolve();
        },
        focus: () => {
          calls.push(`focus:${selector}`);
          return Promise.resolve();
        },
        click: () => {
          calls.push(`click:${selector}`);
          return Promise.resolve();
        },
      }),
    }),
    waitForTimeout: target("wait"),
    screenshot: (options: { clip?: unknown }) => {
      calls.push(options.clip ? "shot:clip" : "shot");
      return Promise.resolve("shot-bytes");
    },
  } as unknown as Page;
}

function baseOptions() {
  return {
    url: "http://localhost:4321/",
    viewport: { width: 1440, height: 900 },
    scroll: 0,
    hover: undefined,
    focus: undefined,
    click: undefined,
    wait: 0,
    shot: undefined,
    clip: undefined,
    selectors: ["nav"],
  };
}

describe("parseClip", () => {
  it("returns undefined without a value", () => {
    expect(parseClip(undefined, true)).toBeUndefined();
  });

  it("rejects a clip without a shot", () => {
    expect(() => parseClip("1,2,3,4", false)).toThrow("--clip needs --shot");
  });

  it("rejects malformed values", () => {
    for (const value of ["1,2,3", "a,b,c,d", "1,2,-3,4"]) {
      expect(() => parseClip(value, true)).toThrow("must look like");
    }
  });

  it("rejects a zero size", () => {
    expect(() => parseClip("1,2,0,4", true)).toThrow("non-zero size");
  });

  it("parses a valid region", () => {
    expect(parseClip("180,40,220,160", true)).toEqual({ x: 180, y: 40, width: 220, height: 160 });
  });
});

describe("preparePage", () => {
  it("runs interactions in order before waiting and shooting", async () => {
    const calls: string[] = [];
    const page = stubPage(calls);

    await preparePage(page, {
      ...baseOptions(),
      scroll: 100,
      hover: "a",
      focus: "button",
      click: "summary",
      wait: 50,
      shot: "/tmp/x.png",
      clip: { x: 1, y: 2, width: 3, height: 4 },
    });

    expect(calls).toEqual([
      "goto",
      "evaluate",
      "evaluate",
      "hover:a",
      "focus:button",
      "click:summary",
      "wait",
      "shot:clip",
    ]);
  });

  it("skips unset interactions and an unclipped shot", async () => {
    const calls: string[] = [];
    const page = stubPage(calls);

    await preparePage(page, { ...baseOptions(), shot: "/tmp/x.png" });
    expect(calls).toEqual(["goto", "evaluate", "shot"]);
  });
});
