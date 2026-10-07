import type { Page } from "playwright";

import { chromium } from "playwright";

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
  wait: number;
  shot: string | undefined;
  selectors: string[];
};

const optionNames = ["--viewport", "--scroll", "--shot", "--wait"];

const HELP = [
  "Usage: node scripts/probe.mts <url> --viewport=<width>x<height> [options] <selector>...",
  "",
  "Options:",
  "  --viewport=<width>x<height>  Viewport size, for example 390x844 (required)",
  "  --scroll=<y>                 Scroll to a vertical offset before probing",
  "  --shot=<path>                Save a screenshot to the given path",
  "  --wait=<ms>                  Wait after load and scroll before probing",
  "  --help                       Print this message",
].join("\n");

function readFlag(args: string[], name: string): string | undefined {
  const prefix = `${name}=`;

  return args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function viewportMatch(value: string | undefined): RegExpMatchArray | null {
  return value?.match(/^(\d+)x(\d+)$/) ?? null;
}

function parseViewport(value: string | undefined): Viewport {
  const match = viewportMatch(value);

  if (!match) throw new Error(`--viewport must look like 390x844, got "${value ?? ""}"`);

  return { width: Number(match[1]), height: Number(match[2]) };
}

function parseNumber(value: string | undefined, flag: string): number {
  if (value === undefined) return 0;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0)
    throw new Error(`${flag} needs a non-negative number`);

  return parsed;
}

function findUnknownOption(argv: string[]): string | undefined {
  return argv
    .filter((arg) => arg.startsWith("--"))
    .find((arg) => !optionNames.some((name) => arg.startsWith(`${name}=`)));
}

function positionalArgs(argv: string[]): string[] {
  return argv.filter((arg) => !arg.startsWith("--"));
}

function requireTargets(positional: string[]): [string, string[]] {
  const [url, ...selectors] = positional;
  if (!url) throw new Error(`A URL is required\n\n${HELP}`);
  if (selectors.length === 0) throw new Error(`At least one selector is required\n\n${HELP}`);
  return [url, selectors];
}

function parseOptions(argv: string[]): Options {
  if (argv.includes("--help")) {
    console.log(HELP);
    process.exit(0);
  }

  const unknown = findUnknownOption(argv);
  if (unknown) throw new Error(`Unknown option ${unknown}\n\n${HELP}`);

  const [url, selectors] = requireTargets(positionalArgs(argv));

  return {
    url,
    viewport: parseViewport(readFlag(argv, "--viewport")),
    scroll: parseNumber(readFlag(argv, "--scroll"), "--scroll"),
    wait: parseNumber(readFlag(argv, "--wait"), "--wait"),
    shot: readFlag(argv, "--shot"),
    selectors,
  };
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

async function preparePage(page: Page, options: Options): Promise<void> {
  await page.goto(options.url, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);

  if (options.scroll > 0) await page.evaluate((y) => window.scrollTo(0, y), options.scroll);
  if (options.wait > 0) await page.waitForTimeout(options.wait);
  if (options.shot) await page.screenshot({ path: options.shot });
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

await main();
