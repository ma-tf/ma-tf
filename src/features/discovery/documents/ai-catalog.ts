import profile from "@content/profile.json";
import { resources, siteUrl } from "@features/discovery/catalog";

export function buildAiCatalog() {
  return {
    specVersion: "1.0",
    host: {
      displayName: profile.name,
      identifier: "did:web:m4t.tf",
      documentationUrl: `${siteUrl}/developers`,
    },
    entries: resources.map((resource) => ({
      identifier: resource.identifier,
      type: resource.type,
      url: `${siteUrl}${resource.path}`,
      displayName: resource.title,
      description: resource.description,
      tags: [...resource.tags],
      representativeQueries: [...resource.representativeQueries],
    })),
  };
}
