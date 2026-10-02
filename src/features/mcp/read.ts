import corpus from "@features/ask/published-pages.generated.json";
import { getRawPosts } from "@features/blog/post-data";
import { resourceByPath, siteUrl } from "@features/discovery/catalog";
import {
  agentSkillMarkdown,
  buildAgentSkillsIndex,
} from "@features/discovery/documents/agent-skills";
import {
  buildBlogLlmsTxt,
  buildCvLlmsTxt,
  buildDevelopersLlmsTxt,
  buildLlmsTxt,
} from "@features/discovery/documents/llms";
import {
  buildPageInventory,
  routableEntries,
  type PageEntry,
} from "@features/discovery/page-inventory";
import { getTagIndex } from "@features/tags/tag-data";
import { getCollection, type CollectionEntry } from "astro:content";

type McpResource = {
  uri: string;
  name: string;
  title: string;
  description: string;
  mimeType: "text/markdown";
  annotations?: { lastModified: string };
};

export type McpResourceText = {
  uri: string;
  mimeType: "text/markdown";
  text: string;
};

type McpResourceEntry = {
  resource: McpResource;
  body: () => string | Promise<string> | undefined;
};

const guides: { path: string; body: () => string | Promise<string> }[] = [
  { path: "/llms.txt", body: () => buildLlmsTxt() },
  { path: "/blog/llms.txt", body: async () => buildBlogLlmsTxt(await getRawPosts()) },
  { path: "/developers/llms.txt", body: () => buildDevelopersLlmsTxt() },
  { path: "/cv/llms.txt", body: () => buildCvLlmsTxt() },
];

function pageEntry(entry: PageEntry): McpResourceEntry {
  const uri = `${siteUrl}${entry.path}`;

  return {
    resource: {
      uri,
      name: entry.path === "/" ? "home" : entry.path.slice(1),
      title: entry.title,
      description: entry.description,
      mimeType: "text/markdown",
      ...(entry.lastmod ? { annotations: { lastModified: entry.lastmod } } : {}),
    },
    body: () => corpus.pages.find((candidate) => candidate.url === uri)?.content,
  };
}

function guideEntry(guide: {
  path: string;
  body: () => string | Promise<string>;
}): McpResourceEntry {
  const resource = resourceByPath(guide.path);

  if (!resource) throw new Error(`No discovery resource at ${guide.path}`);

  return {
    resource: {
      uri: `${siteUrl}${guide.path}`,
      name: guide.path.slice(1),
      title: resource.title,
      description: resource.description,
      mimeType: "text/markdown",
    },
    body: guide.body,
  };
}

async function skillEntries(): Promise<McpResourceEntry[]> {
  const index = await buildAgentSkillsIndex();

  return index.skills.map((skill) => ({
    resource: {
      uri: `${siteUrl}${skill.url}`,
      name: `agent-skills/${skill.name}`,
      title: skill.name,
      description: skill.description,
      mimeType: "text/markdown",
    },
    body: () => agentSkillMarkdown(skill.name),
  }));
}

async function resourceEntries(): Promise<McpResourceEntry[]> {
  const [posts, tagIndex, vignettes] = await Promise.all([
    getRawPosts(),
    getTagIndex(),
    getCollection("vignettes"),
  ]);

  const inventory = buildPageInventory({
    posts: posts.map((post) => ({
      slug: post.data.slug,
      title: post.data.title,
      description: post.data.description,
      publicationDate: post.data.publicationDate,
    })),
    tags: tagIndex.tags,
    vignettes: vignettes
      .filter((entry: CollectionEntry<"vignettes">) => entry.data.enabled)
      .map((entry) => ({
        slug: entry.data.slug,
        title: entry.data.id,
        description: entry.data.summary,
      })),
  });

  return [
    ...routableEntries(inventory).map(pageEntry),
    ...guides.map(guideEntry),
    ...(await skillEntries()),
  ];
}

export async function listResources(): Promise<McpResource[]> {
  return (await resourceEntries()).map((entry) => entry.resource);
}

export async function readResource(uri: string): Promise<McpResourceText | undefined> {
  const entry = (await resourceEntries()).find((candidate) => candidate.resource.uri === uri);

  if (!entry) return undefined;

  const text = await entry.body();

  if (text === undefined) return undefined;

  return { uri, mimeType: "text/markdown", text };
}
