import { chromium } from "playwright";

type Viewport = { width: number; height: number };

type ProbeResult = {
  selector: string;
  found: boolean;
  top?: number;
  height?: number;
  bottom?: number;
  position?: string;
  display?: string;
  transform?: string;
  fontSize?: string;
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

function parseViewport(value: string | undefined): Viewport {
  const match = value?.match(/^(\d+)x(\d+)$/);

  if (!match?.[1] || !match[2])
    throw new Error(`--viewport must look like 390x844, got "${value ?? ""}"`);

  return { width: Number(match[1]), height: Number(match[2]) };
}

function parseNumber(value: string | undefined, flag: string): number {
  if (value === undefined) return 0;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0)
    throw new Error(`${flag} needs a non-negative number`);

  return parsed;
}

function parseOptions(argv: string[]): Options {
  if (argv.includes("--help")) {
    console.log(HELP);
    process.exit(0);
  }

  const unknown = argv
    .filter((arg) => arg.startsWith("--"))
    .find((arg) => !optionNames.some((name) => arg.startsWith(`${name}=`)));
  if (unknown) throw new Error(`Unknown option ${unknown}\n\n${HELP}`);

  const positional = argv.filter((arg) => !arg.startsWith("--"));
  const [url, ...selectors] = positional;
  if (!url) throw new Error(`A URL is required\n\n${HELP}`);
  if (selectors.length === 0) throw new Error(`At least one selector is required\n\n${HELP}`);

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
    `top=${round(result.top ?? 0)}`,
    `height=${round(result.height ?? 0)}`,
    `bottom=${round(result.bottom ?? 0)}`,
    `position=${result.position ?? "unknown"}`,
    `display=${result.display ?? "unknown"}`,
    `transform=${result.transform ?? "unknown"}`,
    `font-size=${result.fontSize ?? "unknown"}`,
  ].join("  ");
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({ viewport: options.viewport });

    await page.goto(options.url, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);

    if (options.scroll > 0) await page.evaluate((y) => window.scrollTo(0, y), options.scroll);
    if (options.wait > 0) await page.waitForTimeout(options.wait);
    if (options.shot) await page.screenshot({ path: options.shot });

    const results = await page.evaluate((selectors): ProbeResult[] => {
      return selectors.map((selector): ProbeResult => {
        const element = document.querySelector(selector);
        if (!element) return { selector, found: false };

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
    }, options.selectors);

    console.log(`${options.url} @ ${options.viewport.width}x${options.viewport.height}`);
    for (const result of results) console.log(formatResult(result));
  } finally {
    await browser.close();
  }
}

await main();
