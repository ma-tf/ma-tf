import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { format } from "vite-plus/fmt";

type Tag = { short: string; keywords: string[] };
type TagResult = { tag: Tag; inputTokens: number; outputTokens: number };
type CacheEntry = Tag & { inputHash: string };
type Cache = Record<string, Record<string, CacheEntry>>;
type KnowledgeItem = { target: string; key: string; context?: string };
type RequestContent =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string; detail: "auto" };
type WorkItem = {
  target: string;
  key: string;
  hashSeed: unknown;
  run: (client: OpenAI) => Promise<TagResult>;
};

const root = fileURLToPath(new URL("../", import.meta.url));
const cachePath = `${root}.ask-tags-cache.json`;
const outputPath = `${root}src/features/ask/ask-tags.json`;
const model = "gpt-6-luna";

const TAG_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["short", "keywords"],
  properties: {
    short: {
      type: "string",
      description: "One plain descriptor phrase, at most eight words, no trailing full stop",
    },
    keywords: {
      type: "array",
      description: "Short list of keywords",
      items: { type: "string" },
    },
  },
};

const VISION_PROMPT =
  "Tag the photograph for a private search index. Return one plain descriptor phrase for the main subject or scene, at most eight words, with no trailing full stop. Return a short list of keywords naming what is visible: subject, setting, light, mood and notable objects. Keywords are lower case, except proper nouns. Do not guess a camera, film stock or location the image does not show. British English.";

const KNOWLEDGE_PROMPT =
  "Tag the named item for a private search index on a personal website. Use the item's name and any supplied context. Return one plain descriptor phrase saying what the item is, at most eight words, with no trailing full stop. Return a short list of keywords: the maker, the category, and cross-cutting themes, synonyms or alternate spellings that add signal beyond the context. Keywords are lower case, except proper nouns. Stay factual; if the item is unfamiliar, describe its category only. British English.";

const KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    target: "/photography",
    key: "Canon EOS-1V",
    context:
      "35mm autofocus film SLR, the primary camera, with swappable lenses, also written Canon EOS 1V.",
  },
  {
    target: "/photography",
    key: "Olympus mju mini Digital",
    context: "Compact digital point-and-shoot used for retro digital shots.",
  },
  {
    target: "/photography",
    key: "Ricoh Mirai",
    context: "Bridge camera used as an all-rounder.",
  },
  {
    target: "/photography",
    key: "Nikon CoolScan V ED",
    context: "35mm film scanner used to scan every roll.",
  },
  {
    target: "/photography",
    key: "SilverFast",
    context: "Film scanning software.",
  },
  {
    target: "/photography",
    key: "SilverFast HDR",
    context: "Software used to colour correct scanned frames.",
  },
  {
    target: "/",
    key: "Kodak Vision3 Color Negative",
    context: "16mm motion picture colour negative film stock.",
  },
  {
    target: "/",
    key: "Kern-Paillard Vario-Switar 16-100mm",
    context: "Battery-powered zoom lens for the Bolex, also called Kern Vario-Switar 16-100mm.",
  },
  {
    target: "/",
    key: "LAOWA 4mm f/2.8 Fisheye",
    context: "Ultra-wide fisheye lens.",
  },
  {
    target: "/",
    key: "Bolex H-16 SBM",
    context: "16mm film camera with a wind-up motor, the vignettes camera body.",
  },
  {
    target: "/vignettes/rangefinder-bokeh",
    key: "SOM Berthiot Pan Cinor 85",
    context: "85mm lens used for 16mm film, named in the Rangefinder Bokeh vignette.",
  },
  {
    target: "/music",
    key: "Sony WM-D6C Walkman Professional",
    context: "Portable cassette recorder.",
  },
  {
    target: "/music",
    key: "Sennheiser HD 800 S",
    context: "Open-back reference headphones.",
  },
  {
    target: "/music",
    key: "JDS Labs Element III",
    context: "Desktop DAC and headphone amplifier.",
  },
  {
    target: "/music",
    key: "RTM C90 Type I",
    context: "90-minute Type I cassette tape.",
  },
  {
    target: "/music",
    key: "Korg Triton",
    context: "Music workstation synthesiser.",
  },
  {
    target: "/music",
    key: "E-mu Emulator III",
    context: "Sampling synthesiser, also written E-mu Systems Emulator III.",
  },
  {
    target: "/cv",
    key: "ma-tf",
    context:
      "Topics: Astro, React, TypeScript. Description: Personal website built with Astro, React, and Tailwind CSS.",
  },
  {
    target: "/cv",
    key: "135ify",
    context:
      "Topics: React, TypeScript, Image Processing. Description: Give digital images an analogue look with real 135 film grain scans.",
  },
  {
    target: "/cv",
    key: "meta1v",
    context:
      "Topics: Go, Metadata, Photography. Description: Metadata editor for EFD files pulled from a Canon EOS 1V.",
  },
  {
    target: "/cv",
    key: "ogle",
    context: "Topics: Go, Docker, TUI. Description: TUI for monitoring Docker Compose projects.",
  },
];

try {
  loadEnvFile(`${root}.env`);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

const cdn = process.env.R2_PUBLIC_URL;
if (!cdn) throw new Error("R2_PUBLIC_URL is not set");

function isTag(value: unknown): value is Tag {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as { short?: unknown; keywords?: unknown };
  return (
    typeof candidate.short === "string" &&
    Array.isArray(candidate.keywords) &&
    candidate.keywords.every((keyword) => typeof keyword === "string")
  );
}

function hashInput(seed: unknown): string {
  return createHash("sha256").update(JSON.stringify(seed)).digest("hex");
}

function photoUrl(image: string): string {
  return `${encodeURI(`${cdn}/${image}`)}_thumb.webp`;
}

function readLimit(): number | undefined {
  const index = process.argv.indexOf("--limit");
  if (index === -1) return undefined;

  const limit = Number(process.argv[index + 1]);
  if (!Number.isInteger(limit) || limit < 1) throw new Error("--limit needs a positive integer");

  return limit;
}

function cap<T>(items: T[], limit: number | undefined): T[] {
  return limit === undefined ? items : items.slice(0, limit);
}

function photoWork(image: string): WorkItem {
  const url = photoUrl(image);

  return {
    target: "/photography",
    key: image,
    hashSeed: { kind: "photo", model, prompt: VISION_PROMPT, url },
    run: (client) =>
      requestTag(client, VISION_PROMPT, [
        { type: "input_text", text: "Describe this photograph." },
        { type: "input_image", image_url: url, detail: "auto" },
      ]),
  };
}

function knowledgeWork(item: KnowledgeItem): WorkItem {
  const text = item.context ? `${item.key}\n${item.context}` : item.key;

  return {
    target: item.target,
    key: item.key,
    hashSeed: {
      kind: "knowledge",
      model,
      prompt: KNOWLEDGE_PROMPT,
      name: item.key,
      context: item.context ?? "",
    },
    run: (client) => requestTag(client, KNOWLEDGE_PROMPT, [{ type: "input_text", text }]),
  };
}

async function requestTag(
  client: OpenAI,
  instructions: string,
  content: RequestContent[],
): Promise<TagResult> {
  const response = await client.responses.create({
    model,
    store: false,
    instructions,
    input: [{ role: "user", content }],
    text: {
      format: { type: "json_schema", name: "tag", strict: true, schema: TAG_SCHEMA },
    },
  });

  const parsed: unknown = JSON.parse(response.output_text);
  if (!isTag(parsed)) throw new Error(`Model returned an invalid tag: ${response.output_text}`);

  return {
    tag: {
      short: parsed.short.trim(),
      keywords: parsed.keywords.map((keyword) => keyword.trim()),
    },
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
  };
}

async function discoverPhotos(): Promise<WorkItem[]> {
  const directory = `${root}src/content/photography`;
  const files = (await readdir(directory)).filter((file) => file.endsWith(".md")).sort();
  const images = await Promise.all(
    files.map(async (file) => {
      const source = await readFile(`${directory}/${file}`, "utf8");
      const match = source.match(/^image:\s*"((?:\\.|[^"\\])*)"$/m)?.[1];
      if (match === undefined) throw new Error(`No image frontmatter in ${file}`);

      return JSON.parse(`"${match}"`) as string;
    }),
  );

  return images.map((image) => photoWork(image));
}

async function loadCache(): Promise<Cache> {
  try {
    return JSON.parse(await readFile(cachePath, "utf8")) as Cache;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};

    throw error;
  }
}

async function serialise(value: unknown): Promise<string> {
  const result = await format("ask-tags.json", JSON.stringify(value, null, 2));
  if (result.errors.length > 0) {
    throw new Error(`Could not format ask-tags.json: ${JSON.stringify(result.errors)}`);
  }

  return result.code;
}

const limit = readLimit();
const items = [
  ...cap(await discoverPhotos(), limit),
  ...cap(
    KNOWLEDGE_ITEMS.map((item) => knowledgeWork(item)),
    limit,
  ),
];
const cache = await loadCache();
const client = new OpenAI({ apiKey });
const startedAt = Date.now();
let inputTokens = 0;
let outputTokens = 0;

for (const item of items) {
  const inputHash = hashInput(item.hashSeed);
  const cached = cache[item.target]?.[item.key];

  if (cached?.inputHash === inputHash) {
    console.log("cached", item.target, item.key);
    continue;
  }

  const itemStartedAt = Date.now();
  const result = await item.run(client);
  const entries = cache[item.target] ?? {};
  entries[item.key] = { inputHash, ...result.tag };
  cache[item.target] = entries;
  await writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
  inputTokens += result.inputTokens;
  outputTokens += result.outputTokens;
  console.log(
    "tagged",
    item.target,
    item.key,
    `${Date.now() - itemStartedAt}ms`,
    `${result.inputTokens}/${result.outputTokens} tokens`,
  );
}

const grouped = new Map<string, Map<string, Tag>>();
for (const item of items) {
  const entry = cache[item.target]?.[item.key];
  if (!entry) continue;

  const tags = grouped.get(item.target) ?? new Map<string, Tag>();
  tags.set(item.key, { short: entry.short, keywords: entry.keywords });
  grouped.set(item.target, tags);
}

const output: Record<string, Record<string, Tag>> = {};
for (const target of [...grouped.keys()].sort()) {
  const tags = grouped.get(target)!;
  const sorted: Record<string, Tag> = {};
  for (const key of [...tags.keys()].sort()) sorted[key] = tags.get(key)!;
  output[target] = sorted;
}

await writeFile(outputPath, await serialise(output));
console.log("Wrote", items.length, "tags in", `${Date.now() - startedAt}ms`);
console.log("Total tokens", `${inputTokens} in / ${outputTokens} out`);
