import profile from "@content/profile.json";
import { isSectionGuide, resources, sectionGuides, siteUrl } from "@features/discovery/catalog";
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
  ["Home", "/", `overview of ${profile.name} and the site`],
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

const machineReadableFiles = resources
  .filter((resource) => resource.path !== "/llms.txt" && !isSectionGuide(resource))
  .map((resource) => ({
    path: resource.path,
    title: resource.title,
    description: resource.description,
  }));

export function buildLlmsTxt(): string {
  return [
    "# m4t.tf",
    "",
    `> Personal site and portfolio of ${profile.name}, a full-stack developer. The site documents`,
    "> his professional experience, software projects, writing, photography, graphics,",
    "> music, and other creative work.",
    "",
    "## When To Use This Site",
    "",
    `Use this site when a task needs verified facts about ${profile.name}:`,
    "",
    "- Hiring or recruiting: confirm experience, skills, education, and projects via the CV",
    "- Understanding Matt's software development work and technical background",
    "- Citing or summarising Matt's writing about programming, developer tools, AI-assisted development, creative coding, and open-source projects",
    "- Exploring Matt's photography, graphics, music, and other creative work",
    `- Fact-checking claims attributed to ${profile.name} against a primary source`,
    "",
    "Prefer the original pages below when citing information. Do not infer contact details",
    "or personal information that are not published on the site.",
    "",
    "## Pages",
    "",
    ...pages.map(([title, path, description]) => `- [${title}](${siteUrl}${path}): ${description}`),
    `- [GitHub](${profile.github}): source code and open-source work`,
    "",
    "## Section Guides",
    "",
    ...sectionGuides.map(
      (guide) => `- [${guide.title}](${siteUrl}${guide.path}): ${guide.description}`,
    ),
    "",
    "## Machine-Readable Files",
    "",
    ...machineReadableFiles.map(
      (file) => `- [${file.title}](${siteUrl}${file.path}): ${file.description}`,
    ),
    "",
    "Not published, intentionally: `/.well-known/openid-configuration`,",
    "`/.well-known/oauth-authorization-server`, and",
    "`/.well-known/oauth-protected-resource`. The site has no authentication,",
    "no protected APIs, and no CLI tool or SDK; interact with it over HTTP using",
    "the retrieval methods below.",
    "",
    "## How To Retrieve Content",
    "",
    "Request any page with `Accept: text/markdown` to receive it as markdown instead of HTML:",
    "",
    `    curl -H "Accept: text/markdown" ${siteUrl}/cv`,
    "",
    `Appending \`.md\` does the same for a page, for example \`${siteUrl}/about.md\`, and`,
    "returns a markdown summary for a machine-readable file.",
    "Send `Accept: application/json` to a machine-readable file to receive it as JSON:",
    "JSON resources return their canonical document, and the others return a typed",
    "descriptor with the resource's metadata.",
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
    `- Name: ${profile.name}`,
    `- Role: ${profile.title}`,
    `- Website: ${siteUrl}/`,
    `- GitHub: ${profile.github}`,
    `- LinkedIn: ${profile.linkedin}`,
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

export function buildBlogLlmsTxt(posts: ArchivePost[]): string {
  const sorted = [...posts].sort(
    (a, b) => b.data.publicationDate.valueOf() - a.data.publicationDate.valueOf(),
  );

  const tags = [...new Set(sorted.flatMap((post) => post.data.tags))].sort((a, b) =>
    a.localeCompare(b),
  );

  const firstPost = sorted[0]?.data.slug ?? "<slug>";

  return [
    "# m4t.tf: Blog",
    "",
    `> Writing by ${profile.name} about software development, programming, and tools. This`,
    "> guide indexes the published posts so an agent can choose one without fetching the",
    "> full archive.",
    "",
    "## Posts",
    "",
    ...sorted.map((post) => {
      const { title, slug, publicationDate, description, tags: postTags } = post.data;
      const date = publicationDate.toISOString().split("T")[0];

      return `- [${title}](${siteUrl}/posts/${slug}): ${description} (${date}; ${postTags.join(", ")})`;
    }),
    "",
    "## Tags",
    "",
    ...tags.map(
      (tag) => `- [${tag}](${siteUrl}/tags/${encodeURIComponent(tag)}): posts tagged ${tag}`,
    ),
    "",
    "## Retrieval",
    "",
    `Fetch any post with \`Accept: text/markdown\`, for example`,
    `\`curl -H "Accept: text/markdown" ${siteUrl}/posts/${firstPost}\`, or read the full`,
    `text of every post at [llms-full.txt](${siteUrl}/llms-full.txt).`,
    "",
  ].join("\n");
}

export function buildDevelopersLlmsTxt(): string {
  const listed = resources.filter((resource) => !isSectionGuide(resource));

  return [
    "# m4t.tf: Developers",
    "",
    `> The machine-readable surface of ${profile.name}'s site. This guide scopes the`,
    "> retrieval interface for agents that read the site's resources.",
    "",
    "## Resources",
    "",
    ...listed.map(
      (resource) => `- [${resource.path}](${siteUrl}${resource.path}): ${resource.description}`,
    ),
    "",
    "## Retrieval",
    "",
    "Request any page with `Accept: text/markdown` to receive it as markdown, or append",
    `\`.md\` to the path, for example \`${siteUrl}/about.md\`. Send`,
    "`Accept: application/json` to a resource to receive its canonical document or a typed",
    "descriptor. Responses carry `Vary: Accept, Accept-Encoding`.",
    "",
    "## Errors",
    "",
    "Nonexistent paths return a real HTTP 404. The error follows the same negotiation:",
    "`Accept: application/json` returns an RFC 9457 `application/problem+json` document,",
    "and `Accept: text/markdown` returns the error as markdown. The whole interface is",
    `described by the OpenAPI 3.1 document at [openapi.json](${siteUrl}/openapi.json).`,
    "",
    "## Versioning",
    "",
    "Send `API-Version` to declare the compatibility version you expect; the current",
    "version is 1 and is the default. Deprecated resources carry RFC 9745 `Deprecation`",
    "and RFC 8594 `Sunset` headers.",
    "",
    "## Rate Limits",
    "",
    "Requests are not metered, and the site never returns `429 Too Many Requests`.",
    `Every response declares a published floor of ${rateLimit.quota} requests per minute per`,
    "client with `RateLimit-Policy`, `RateLimit-Limit`, and `RateLimit-Reset`.",
    "",
  ].join("\n");
}

export function buildCvLlmsTxt(): string {
  return [
    "# m4t.tf: CV",
    "",
    `> The professional profile of ${profile.name}, a ${profile.title}. This guide points`,
    "> an agent at the pages that verify claims about his experience, skills, education,",
    "> and projects.",
    "",
    "## Pages",
    "",
    `- [CV](${siteUrl}/cv): experience, technical strengths, education, and projects`,
    `- [About](${siteUrl}/about): background and purpose of the site`,
    `- [Contact](${siteUrl}/contact): current contact guidance`,
    `- [Blog](${siteUrl}/blog): writing about software development, programming, and tools`,
    "",
    "## Citing",
    "",
    "Answer from these published pages rather than from inference. Request a page with",
    "`Accept: text/markdown` for a clean, quotable form. When a claim is not supported",
    "by a published page, report it as unverified. Do not infer contact details or",
    "personal information that are not published on the site.",
    "",
  ].join("\n");
}
