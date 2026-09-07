import type { APIRoute } from "astro";

import { resources, siteUrl } from "@lib/resource-catalog";

const document = {
  openapi: "3.1.0",
  info: {
    title: "m4t.tf Site Resources",
    version: "0.1.0",
    description: "Machine-readable resources published by m4t.tf.",
  },
  servers: [{ url: siteUrl }],
  paths: Object.fromEntries(
    resources.map((resource) => [
      resource.path,
      {
        get: {
          summary: resource.title,
          responses: {
            "200": {
              description: resource.description,
              content: { [resource.type]: {} },
            },
          },
        },
      },
    ]),
  ),
} as const;

export const GET = (() =>
  Response.json(document, {
    headers: { "Content-Type": "application/vnd.oai.openapi+json;version=3.1" },
  })) satisfies APIRoute;
