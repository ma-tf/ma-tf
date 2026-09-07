import type { APIRoute } from "astro";

import { resources, siteUrl } from "../../lib/resource-catalog";

const catalog = {
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

export const GET = (() =>
  Response.json(catalog, {
    headers: { "Content-Type": "application/linkset+json" },
  })) satisfies APIRoute;
