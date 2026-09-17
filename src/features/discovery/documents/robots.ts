import { siteUrl } from "@features/discovery/catalog";

const allowedCrawlers = [
  "Amazonbot",
  "Applebot-Extended",
  "Applebot",
  "Baiduspider",
  "BingBot",
  "BingPreview",
  "Bytespider",
  "CCBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "CloudflareBrowserRenderingCrawler",
  "cohere-ai",
  "Diffbot",
  "DuckDuckBot",
  "DuckDuckGo-Favicons-Bot",
  "FacebookBot",
  "Google-Extended",
  "Google-InspectionTool",
  "GoogleOther-Image",
  "GoogleOther-Video",
  "GoogleOther",
  "GPTBot",
  "ImagesiftBot",
  "meta-externalagent",
  "Meta-ExternalFetcher",
  "OAI-SearchBot",
  "PerplexityBot",
  "SeznamBot",
  "Twitterbot",
  "Yandex",
  "YandexBot",
];

function crawlerGroup(crawlers: readonly string[]): string[] {
  return crawlers.flatMap((crawler) => [`User-agent: ${crawler}`, "Allow: /", ""]);
}

export function buildRobotsTxt(): string {
  return [
    "User-agent: *",
    "Content-Signal: ai-train=yes, search=yes, ai-input=yes",
    "Allow: /",
    "",
    "# Named AI crawlers and retrieval agents — explicitly allowed",
    ...crawlerGroup(allowedCrawlers),
    `Agentmap: ${siteUrl}/.well-known/ai-catalog.json`,
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
}
