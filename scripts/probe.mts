import type { Page } from "playwright";

import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

import {
  formatHelp,
  parseArgs,
  parseNumericFlag,
  printHelpAndExit,
  readValue,
} from "@/scripts/argv.mts";

type Viewport = { width: number; height: number };

type ProbeResult = {
  selector: string;
  found: boolean;
  top: number;
  height: number;
  bottom: number;
  position: string;
  display: string;
  transform: string;
  fontSize: string;
};

type Options = {
  url: string;
  viewport: Viewport;
  scroll: number;
  hover: string | undefined;
  focus: string | undefined;
  click: string | undefined;
  wait: number;
  shot: string | undefined;
  clip: { x: number; y: number; width: number; height: number } | undefined;
  selectors: string[];
};

const OPTIONS = [
  {
    name: "--viewport",
    placeholder: "<width>x<height>",
    description: "Viewport size, for example 390x844 (required)",
  },
  {
    name: "--scroll",
    placeholder: "<y>",
    description: "Scroll to a vertical offset before probing",
  },
  {
    name: "--hover",
    placeholder: "<selector>",
    description: "Hover the first match before probing",
  },
  {
    name: "--focus",
    placeholder: "<selector>",
    description: "Focus the first match before probing",
  },
  {
    name: "--click",
    placeholder: "<selector>",
    description: "Click the first match before probing (may navigate)",
  },
  { name: "--shot", placeholder: "<path>", description: "Save a screenshot to the given path" },
  {
    name: "--clip",
    placeholder: "<x,y,w,h>",
    description: "Clip the screenshot region (needs --shot)",
  },
  {
    name: "--wait",
    placeholder: "<ms>",
    description: "Wait after load and scroll before probing",
  },
];

const HELP = formatHelp(
  "node --import ./scripts/alias-loader.mjs scripts/probe.mts <url> --viewport=<width>x<height> [options] <selector>...",
  OPTIONS,
);

function viewportMatch(value: string | undefined): RegExpMatchArray | null {
  return value?.match(/^(\d+)x(\d+)$/) ?? null;
}

function parseViewport(value: string | undefined): Viewport {
  const match = viewportMatch(value);

  if (!match) throw new Error(`--viewport must look like 390x844, got "${value ?? ""}"`);

  return { width: Number(match[1]), height: Number(match[2]) };
}

function requireTargets(positional: string[]): [string, string[]] {
  const [url, ...selectors] = positional;
  if (!url) throw new Error(`A URL is required\n\n${HELP}`);
  if (selectors.length === 0) throw new Error(`At least one selector is required\n\n${HELP}`);
  return [url, selectors];
}

function parseOptions(argv: string[]): Options {
  if (argv.includes("--help")) printHelpAndExit(HELP);

  const args = parseArgs(argv, OPTIONS, HELP);
  const [url, selectors] = requireTargets(args.positionals);

  return {
    url,
    viewport: parseViewport(readValue(args, "--viewport")),
    scroll: parseNumericFlag(readValue(args, "--scroll"), "--scroll", { fallback: 0, minimum: 0 }),
    hover: readValue(args, "--hover"),
    focus: readValue(args, "--focus"),
    click: readValue(args, "--click"),
    wait: parseNumericFlag(readValue(args, "--wait"), "--wait", { fallback: 0, minimum: 0 }),
    shot: readValue(args, "--shot"),
    clip: parseClip(readValue(args, "--clip"), Boolean(readValue(args, "--shot"))),
    selectors,
  };
}

function clipNumbers(value: string): number[] | null {
  const parts = value.split(",").map(Number);
  if (parts.length !== 4) return null;
  if (!parts.every((part) => Number.isFinite(part) && part >= 0)) return null;
  return parts;
}

function clipParts(value: string): [number, number, number, number] | null {
  const parts = clipNumbers(value);
  if (!parts) return null;
  const [x = 0, y = 0, width = 0, height = 0] = parts;
  if (width * height === 0) return null;
  return [x, y, width, height];
}

export function parseClip(
  value: string | undefined,
  hasShot: boolean,
): { x: number; y: number; width: number; height: number } | undefined {
  if (value === undefined) return undefined;
  if (!hasShot) throw new Error("--clip needs --shot to save the clipped region into");
  const parts = clipParts(value);
  if (!parts) {
    throw new Error(`--clip must look like 180,40,220,160 with a non-zero size, got "${value}"`);
  }
  const [x, y, width, height] = parts;
  return { x, y, width, height };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatResult(result: ProbeResult): string {
  if (!result.found) return `${result.selector}  not found`;

  return [
    result.selector,
    `top=${round(result.top)}`,
    `height=${round(result.height)}`,
    `bottom=${round(result.bottom)}`,
    `position=${result.position}`,
    `display=${result.display}`,
    `transform=${result.transform}`,
    `font-size=${result.fontSize}`,
  ].join("  ");
}

async function runInteractions(page: Page, options: Options): Promise<void> {
  const interactions = [
    [options.hover, "hover"],
    [options.focus, "focus"],
    [options.click, "click"],
  ] as const;
  for (const [selector, method] of interactions) {
    if (selector) await page.locator(selector).first()[method]();
  }
}

export async function preparePage(page: Page, options: Options): Promise<void> {
  await page.goto(options.url, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);

  if (options.scroll > 0) await page.evaluate((y) => window.scrollTo(0, y), options.scroll);
  await runInteractions(page, options);
  if (options.wait > 0) await page.waitForTimeout(options.wait);
  if (options.shot) {
    await page.screenshot(
      options.clip ? { path: options.shot, clip: options.clip } : { path: options.shot },
    );
  }
}

function collectResults(page: Page, selectors: string[]): Promise<ProbeResult[]> {
  return page.evaluate((targets): ProbeResult[] => {
    return targets.map((selector): ProbeResult => {
      const element = document.querySelector(selector);
      if (!element) {
        return {
          selector,
          found: false,
          top: 0,
          height: 0,
          bottom: 0,
          position: "unknown",
          display: "unknown",
          transform: "unknown",
          fontSize: "unknown",
        };
      }

      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);

      return {
        selector,
        found: true,
        top: rect.top,
        height: rect.height,
        bottom: rect.bottom,
        position: style.position,
        display: style.display,
        transform: style.transform,
        fontSize: style.fontSize,
      };
    });
  }, selectors);
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({ viewport: options.viewport });
    await preparePage(page, options);

    const results = await collectResults(page, options.selectors);

    console.log(`${options.url} @ ${options.viewport.width}x${options.viewport.height}`);
    for (const result of results) console.log(formatResult(result));
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
