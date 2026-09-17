import { resources, siteUrl } from "@features/discovery/catalog";

export function buildApiCatalog() {
  return {
    linkset: [
      {
        anchor: `${siteUrl}/`,
        describedby: [
          {
            href: `${siteUrl}/openapi.json`,
            type: "application/vnd.oai.openapi+json;version=3.1",
          },
        ],
        item: resources.map((resource) => ({
          href: `${siteUrl}${resource.path}`,
          type: resource.type,
        })),
      },
    ],
  };
}
