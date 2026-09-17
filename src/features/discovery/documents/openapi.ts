import type { DiscoveryResource } from "@features/discovery/catalog";

import { resources, siteUrl } from "@features/discovery/catalog";
import { problemSchema } from "@features/discovery/problems";
import { rateLimit, rateLimitPolicy } from "@features/discovery/rate-limits";

const linksetReferenceSchema = {
  type: "object",
  required: ["href", "type"],
  properties: {
    href: { type: "string", format: "uri" },
    type: { type: "string" },
  },
};

const linksetSchema = {
  type: "object",
  required: ["linkset"],
  properties: {
    linkset: {
      type: "array",
      items: {
        type: "object",
        required: ["anchor", "describedby", "item"],
        properties: {
          anchor: {
            type: "string",
            format: "uri",
            description: "The resource the linkset describes.",
          },
          describedby: {
            type: "array",
            description: "Documents that describe the anchor resource.",
            items: { $ref: "#/components/schemas/LinksetReference" },
          },
          item: {
            type: "array",
            description: "The resources published for the anchor.",
            items: { $ref: "#/components/schemas/LinksetReference" },
          },
        },
      },
    },
  },
};

const aiCatalogSchema = {
  type: "object",
  required: ["specVersion", "host", "entries"],
  properties: {
    specVersion: { type: "string", description: "The AI catalogue specification version." },
    host: {
      type: "object",
      required: ["displayName", "identifier", "documentationUrl"],
      properties: {
        displayName: { type: "string" },
        identifier: { type: "string", description: "A DID identifying the host." },
        documentationUrl: { type: "string", format: "uri" },
      },
    },
    entries: {
      type: "array",
      items: {
        type: "object",
        required: [
          "identifier",
          "type",
          "url",
          "displayName",
          "description",
          "tags",
          "representativeQueries",
        ],
        properties: {
          identifier: { type: "string" },
          type: { type: "string" },
          url: { type: "string", format: "uri" },
          displayName: { type: "string" },
          description: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          representativeQueries: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};

function operationIdFor(resource: DiscoveryResource): string {
  const name = resource.identifier.split(":").slice(-2).join("-");
  const pascal = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return `get${pascal}`;
}

function responseSchemaFor(resource: DiscoveryResource): Record<string, unknown> {
  switch (resource.type) {
    case "text/plain":
    case "application/rss+xml":
      return { type: "string" };
    case "application/linkset+json":
      return { $ref: "#/components/schemas/Linkset" };
    case "application/ai-catalog+json":
      return { $ref: "#/components/schemas/AiCatalog" };
    case "application/vnd.oai.openapi+json;version=3.1":
      return { type: "object", additionalProperties: true };
    default:
      throw new Error(`No OpenAPI response schema is defined for media type "${resource.type}"`);
  }
}

export function buildOpenApiDocument() {
  return {
    openapi: "3.1.0",
    info: {
      title: "m4t.tf Site Resources",
      version: "0.1.0",
      description: `Machine-readable resources published by m4t.tf. Clients may send the API-Version header to declare the API compatibility version they expect. The current API version is 1. Deprecated resources return RFC 9745 Deprecation and RFC 8594 Sunset response headers and stay available for at least six months after the deprecation date. Requests are not metered; every response declares a published floor of ${rateLimit.quota} requests per minute per client.`,
    },
    components: {
      parameters: {
        ApiVersion: {
          name: "API-Version",
          in: "header",
          required: false,
          description:
            "The API compatibility version the client expects. The current API version is 1; requests without this header receive the current version.",
          schema: { type: "integer", enum: [1] },
        },
        Accept: {
          name: "Accept",
          in: "header",
          required: false,
          description:
            "The representation the client accepts. Pages are available as text/html or text/markdown; each machine-readable resource is served with the media type documented in its 200 response. A request whose Accept header matches none of these returns application/problem+json with status 406.",
          schema: { type: "string" },
        },
      },
      headers: {
        Deprecation: {
          description: "RFC 9745 deprecation date. Present only on deprecated resources.",
          schema: { type: "string", examples: ["@1688169599"] },
        },
        Sunset: {
          description:
            "RFC 8594 date after which the resource stops responding. Present only on deprecated resources.",
          schema: { type: "string", examples: ["Sat, 31 Dec 2026 23:59:59 GMT"] },
        },
        RateLimitPolicy: {
          description: "The published request floor as an IETF RateLimit-Policy field.",
          schema: { type: "string", examples: [rateLimitPolicy] },
        },
        RateLimitLimit: {
          description: "The published request floor per window.",
          schema: { type: "integer", examples: [rateLimit.quota] },
        },
        RateLimitReset: {
          description: "The length of the rate-limit window in seconds.",
          schema: { type: "integer", examples: [rateLimit.windowSeconds] },
        },
      },
      schemas: {
        AiCatalog: aiCatalogSchema,
        Linkset: linksetSchema,
        LinksetReference: linksetReferenceSchema,
        Problem: problemSchema,
      },
      responses: {
        NotFound: {
          description: "The requested resource does not exist.",
          content: {
            "application/problem+json": {
              schema: { $ref: "#/components/schemas/Problem" },
            },
          },
        },
        InternalServerError: {
          description: "The server encountered an unexpected condition.",
          content: {
            "application/problem+json": {
              schema: { $ref: "#/components/schemas/Problem" },
            },
          },
        },
        MethodNotAllowed: {
          description: "The resource does not support the request method.",
          headers: {
            Allow: {
              description: "The methods the resource supports.",
              schema: { type: "string", examples: ["GET, HEAD"] },
            },
          },
          content: {
            "application/problem+json": {
              schema: { $ref: "#/components/schemas/Problem" },
            },
          },
        },
        NotAcceptable: {
          description: "No representation matches the Accept header.",
          content: {
            "application/problem+json": {
              schema: { $ref: "#/components/schemas/Problem" },
            },
          },
        },
      },
    },
    servers: [{ url: siteUrl }],
    paths: Object.fromEntries(
      resources.map((resource) => [
        resource.path,
        {
          get: {
            operationId: operationIdFor(resource),
            summary: resource.title,
            description: resource.description,
            tags: [...resource.tags],
            parameters: [
              { $ref: "#/components/parameters/ApiVersion" },
              { $ref: "#/components/parameters/Accept" },
            ],
            responses: {
              "200": {
                description: resource.description,
                headers: {
                  Deprecation: { $ref: "#/components/headers/Deprecation" },
                  Sunset: { $ref: "#/components/headers/Sunset" },
                  "RateLimit-Policy": { $ref: "#/components/headers/RateLimitPolicy" },
                  "RateLimit-Limit": { $ref: "#/components/headers/RateLimitLimit" },
                  "RateLimit-Reset": { $ref: "#/components/headers/RateLimitReset" },
                },
                content: { [resource.type]: { schema: responseSchemaFor(resource) } },
              },
              "404": { $ref: "#/components/responses/NotFound" },
              "405": { $ref: "#/components/responses/MethodNotAllowed" },
              "406": { $ref: "#/components/responses/NotAcceptable" },
              "500": { $ref: "#/components/responses/InternalServerError" },
            },
          },
        },
      ]),
    ),
  };
}
