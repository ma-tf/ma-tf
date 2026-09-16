import type { APIRoute } from "astro";

import { siteUrl } from "../../lib/resource-catalog";

const catalog = {
  specVersion: "1.0",
  host: {
    displayName: "Matt F",
    identifier: "did:web:m4t.tf",
    documentationUrl: `${siteUrl}/developers`,
  },
  entries: [
    {
      identifier: "urn:air:m4t.tf:api:openapi",
      type: "application/vnd.oai.openapi+json;version=3.1",
      url: `${siteUrl}/openapi.json`,
      displayName: "OpenAPI document",
      description: "OpenAPI 3.1 description of the site's machine-readable resources.",
      tags: ["openapi", "api", "schema"],
      representativeQueries: [
        "What API endpoints does m4t.tf expose?",
        "Show the OpenAPI schema for m4t.tf.",
        "How do I call the m4t.tf API?",
      ],
    },
    {
      identifier: "urn:air:m4t.tf:guide:llms",
      type: "text/plain",
      url: `${siteUrl}/llms.txt`,
      displayName: "Agent site guide",
      description: "A guide to the site and when agents should use it.",
      tags: ["llms", "guide", "identity"],
      representativeQueries: [
        "Who is Matt F?",
        "What is m4t.tf and when should I use it?",
        "Which pages does m4t.tf publish?",
      ],
    },
    {
      identifier: "urn:air:m4t.tf:archive:content",
      type: "text/plain",
      url: `${siteUrl}/llms-full.txt`,
      displayName: "Full content archive",
      description: "The published-content archive for agent retrieval.",
      tags: ["archive", "blog", "content"],
      representativeQueries: [
        "Give me the full text of Matt F's blog.",
        "What has Matt F written about?",
        "Summarise Matt F's published content.",
      ],
    },
    {
      identifier: "urn:air:m4t.tf:feed:blog",
      type: "application/rss+xml",
      url: `${siteUrl}/rss.xml`,
      displayName: "Blog RSS feed",
      description: "The feed of published blog posts.",
      tags: ["rss", "feed", "blog"],
      representativeQueries: [
        "What are the latest blog posts on m4t.tf?",
        "List recent posts from m4t.tf.",
        "How do I subscribe to Matt F's writing?",
      ],
    },
    {
      identifier: "urn:air:m4t.tf:catalog:api",
      type: "application/linkset+json",
      url: `${siteUrl}/.well-known/api-catalog`,
      displayName: "API catalog",
      description: "An RFC 9727 linkset describing the site's resources.",
      tags: ["api", "catalog", "linkset"],
      representativeQueries: [
        "What machine-readable resources does m4t.tf publish?",
        "How do I discover the m4t.tf endpoints?",
        "List the m4t.tf resource catalogue.",
      ],
    },
  ],
};

export const GET = (() =>
  Response.json(catalog, {
    headers: {
      "Content-Type": "application/ai-catalog+json",
      "Access-Control-Allow-Origin": "*",
    },
  })) satisfies APIRoute;
