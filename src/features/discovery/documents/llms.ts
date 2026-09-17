import { resources, siteUrl } from "@features/discovery/catalog";
import { rateLimit } from "@features/discovery/rate-limits";

type ArchivePost = {
  body?: string;
  data: {
    title: string;
    slug: string;
    publicationDate: Date;
    description: string;
    tags: string[];
  };
};

const pages = [
  ["Home", "/", "overview of Matt F and the site"],
  ["CV", "/cv", "experience, technical strengths, education, and projects"],
  ["About", "/about", "background and purpose of the site"],
  ["Contact", "/contact", "current contact guidance"],
  ["Privacy", "/privacy", "initial privacy notice"],
  [
    "Developers",
    "/developers",
    "machine-readable endpoints, retrieval quickstart, and error shape",
  ],
  ["Blog", "/blog", "writing about software development, programming, and tools"],
  ["Photography", "/photography", "photography collections"],
  ["Graphics", "/graphics", "graphics and creative coding work"],
  ["Music", "/music", "music-related projects and media"],
  ["Vignettes", "/vignettes", "short-form creative projects"],
] as const;

const machineReadableFiles = [
  ...resources
    .filter((resource) => resource.path !== "/llms.txt")
    .map((resource) => ({
      path: resource.path,
      title: resource.title,
      description: resource.description,
    })),
  { path: "/sitemap.xml", title: "Sitemap", description: "indexable site pages" },
];

export function buildLlmsTxt(): string {
  return [
    "# m4t.tf",
    "",
    "> Personal site and portfolio of Matt F, a full-stack developer. The site documents",
    "> his professional experience, software projects, writing, photography, graphics,",
    "> music, and other creative work.",
    "",
    "## When To Use This Site",
    "",
    "Use this site when a task needs verified facts about Matt F:",
    "",
    "- Hiring or recruiting: confirm experience, skills, education, and projects via the CV",
    "- Understanding Matt's software development work and technical background",
    "- Citing or summarising Matt's writing about programming, developer tools, AI-assisted development, creative coding, and open-source projects",
    "- Exploring Matt's photography, graphics, music, and other creative work",
    "- Fact-checking claims attributed to Matt F against a primary source",
    "",
    "Prefer the original pages below when citing information. Do not infer contact details",
    "or personal information that are not published on the site.",
    "",
    "## Pages",
    "",
    ...pages.map(([title, path, description]) => `- [${title}](${siteUrl}${path}): ${description}`),
    "- [GitHub](https://github.com/ma-tf): source code and open-source work",
    "",
    "## Machine-Readable Files",
    "",
    ...machineReadableFiles.map(
      (file) => `- [${file.title}](${siteUrl}${file.path}): ${file.description}`,
    ),
    "",
    "Not published, intentionally: `/.well-known/openid-configuration`,",
    "`/.well-known/oauth-authorization-server`,",
    "`/.well-known/oauth-protected-resource`, and",
    "`/.well-known/mcp/server-card.json`. The site has no authentication, no",
    "protected APIs, and no MCP server.",
    "",
    "## How To Retrieve Content",
    "",
    "Request any page with `Accept: text/markdown` to receive it as markdown instead of HTML:",
    "",
    `    curl -H "Accept: text/markdown" ${siteUrl}/cv`,
    "",
    `Appending \`.md\` to a page path does the same, for example \`${siteUrl}/about.md\`.`,
    "Responses carry `Vary: Accept, Accept-Encoding`, so caches must store the HTML and markdown",
    "representations separately. Nonexistent paths return a real HTTP 404, so a 404 is proof the",
    "path does not exist. The error follows the same negotiation: `Accept: application/json`",
    "returns an RFC 9457 `application/problem+json` document, and `Accept: text/markdown` returns",
    "the error as markdown. The whole interface is described by the OpenAPI 3.1",
    `document at [openapi.json](${siteUrl}/openapi.json).`,
    "",
    "## Rate Limits",
    "",
    "Requests are not metered, and the site never returns `429 Too Many Requests`.",
    `Every response declares a published floor of ${rateLimit.quota} requests per minute per client`,
    "with `RateLimit-Policy`, `RateLimit-Limit`, and `RateLimit-Reset`. The origin will",
    "not reject you below that floor.",
    "",
    "## Identity",
    "",
    "- Name: Matt F",
    "- Role: Full-stack developer",
    `- Website: ${siteUrl}/`,
    "- GitHub: https://github.com/ma-tf/",
    "",
  ].join("\n");
}

export function buildLlmsFullTxt(posts: ArchivePost[]): string {
  const sorted = [...posts].sort(
    (a, b) => b.data.publicationDate.valueOf() - a.data.publicationDate.valueOf(),
  );

  const sections = sorted.map((post) => {
    const { title, slug, publicationDate, description, tags } = post.data;

    return [
      `## ${title}`,
      "",
      `- URL: ${siteUrl}/posts/${slug}`,
      `- Published: ${publicationDate.toISOString().split("T")[0]}`,
      `- Description: ${description}`,
      `- Tags: ${tags.join(", ")}`,
      "",
      post.body?.trim() ?? "",
    ].join("\n");
  });

  return [
    "# m4t.tf: Full Content Archive",
    "",
    "This file contains the published blog content from m4t.tf.",
    "",
    ...sections.flatMap((section) => [section, "---", ""]),
  ].join("\n");
}
