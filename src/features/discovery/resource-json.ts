import type { DiscoveryResource } from "@features/discovery/catalog";

import { resourceByPath, siteUrl } from "@features/discovery/catalog";

type ResourceDescriptor = {
  path: string;
  url: string;
  mediaType: string;
  title: string;
  description: string;
  tags: string[];
  representativeQueries: string[];
};

export function describeResource(resource: DiscoveryResource): ResourceDescriptor {
  return {
    path: resource.path,
    url: `${siteUrl}${resource.path}`,
    mediaType: resource.type,
    title: resource.title,
    description: resource.description,
    tags: [...resource.tags],
    representativeQueries: [...resource.representativeQueries],
  };
}

export function resourceJson(resource: DiscoveryResource): Response {
  return Response.json(describeResource(resource));
}

export function resourceJsonResponse(pathname: string): Response | undefined {
  const resource = resourceByPath(pathname);

  return resource ? resourceJson(resource) : undefined;
}
