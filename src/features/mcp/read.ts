import type { ResourceArtefact } from "@features/ask/corpus/types";
import type { McpResource } from "@features/mcp/catalogue";

import generated from "@features/mcp/resources.generated.json";

export type McpResourceText = {
  uri: string;
  mimeType: "text/markdown";
  text: string;
};

const catalogue = generated as ResourceArtefact;

export function listResources(): McpResource[] {
  return catalogue.resources.map((resource) => ({
    uri: resource.uri,
    name: resource.name,
    title: resource.title,
    description: resource.description,
    mimeType: resource.mimeType,
    ...(resource.annotations ? { annotations: resource.annotations } : {}),
  }));
}

export function readResource(uri: string): McpResourceText | undefined {
  const resource = catalogue.resources.find((candidate) => candidate.uri === uri);

  if (!resource) return undefined;

  return { uri, mimeType: "text/markdown", text: resource.text };
}
