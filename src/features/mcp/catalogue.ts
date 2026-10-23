import { resourceByPath, siteUrl } from "@features/discovery/catalog";
import { agentSkillSummaries, skillUrl } from "@features/discovery/documents/agent-skills";
import { routableEntries, type PageEntry } from "@features/discovery/page-inventory";
import { getPageInventory } from "@features/discovery/page-inventory-source";

export type McpResource = {
  uri: string;
  name: string;
  title: string;
  description: string;
  mimeType: "text/markdown";
  annotations?: { lastModified: string };
};

const guidePaths = ["/llms.txt", "/blog/llms.txt", "/developers/llms.txt", "/cv/llms.txt"] as const;

function pageResource(entry: PageEntry): McpResource {
  return {
    uri: `${siteUrl}${entry.path}`,
    name: entry.path === "/" ? "home" : entry.path.slice(1),
    title: entry.title,
    description: entry.description,
    mimeType: "text/markdown",
    ...(entry.lastmod ? { annotations: { lastModified: entry.lastmod } } : {}),
  };
}

function guideResource(path: string): McpResource {
  const resource = resourceByPath(path);

  if (!resource) throw new Error(`No discovery resource at ${path}`);

  return {
    uri: `${siteUrl}${path}`,
    name: path.slice(1),
    title: resource.title,
    description: resource.description,
    mimeType: "text/markdown",
  };
}

function skillResource(skill: { name: string; description: string }): McpResource {
  return {
    uri: `${siteUrl}${skillUrl(skill.name)}`,
    name: `agent-skills/${skill.name}`,
    title: skill.name,
    description: skill.description,
    mimeType: "text/markdown",
  };
}

export async function listResourceMetadata(): Promise<McpResource[]> {
  const inventory = await getPageInventory();

  return [
    ...routableEntries(inventory).map(pageResource),
    ...guidePaths.map(guideResource),
    ...agentSkillSummaries().map(skillResource),
  ];
}
