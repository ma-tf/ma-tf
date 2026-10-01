import type { DiscoveryResource } from "@features/discovery/catalog";

import { isJsonMediaType, resources, siteUrl } from "@features/discovery/catalog";
import { problemSchema } from "@features/discovery/problems";
import { askRateLimit } from "@lib/rate-limits";

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

const ardSchema = {
  type: "object",
  required: ["specVersion", "host", "entries"],
  properties: {
    specVersion: { type: "string", description: "The ARD specification version." },
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

const agentSkillsIndexSchema = {
  type: "object",
  required: ["$schema", "skills"],
  properties: {
    $schema: {
      type: "string",
      format: "uri",
      description: "The Agent Skills discovery schema the index conforms to.",
    },
    skills: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "type", "description", "url", "digest"],
        properties: {
          name: { type: "string", description: "The skill name." },
          type: { type: "string", enum: ["skill-md", "archive"] },
          description: { type: "string", description: "What the skill does and when to use it." },
          url: { type: "string", description: "Where the skill artifact is served." },
          digest: {
            type: "string",
            pattern: "^sha256:[a-f0-9]{64}$",
            description: "The sha256 digest of the artifact's raw bytes.",
          },
        },
      },
    },
  },
};

const discoveryResourceSchema = {
  type: "object",
  required: ["path", "url", "mediaType", "title", "description", "tags", "representativeQueries"],
  properties: {
    path: { type: "string", description: "The resource's site-relative path." },
    url: { type: "string", format: "uri", description: "The resource's canonical absolute URL." },
    mediaType: {
      type: "string",
      description: "The media type the canonical resource is served with.",
    },
    title: { type: "string", description: "The resource's human-readable title." },
    description: { type: "string", description: "What the resource is for." },
    tags: { type: "array", items: { type: "string" }, description: "Discovery tags." },
    representativeQueries: {
      type: "array",
      items: { type: "string" },
      description: "The kinds of query the resource answers.",
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
    case "application/xml":
      return { type: "string" };
    case "application/linkset+json":
      return { $ref: "#/components/schemas/Linkset" };
    case "application/ard+json":
      return { $ref: "#/components/schemas/Ard" };
    case "application/json":
      return { $ref: "#/components/schemas/AgentSkillsIndex" };
    case "application/vnd.oai.openapi+json;version=3.1":
      return { type: "object", additionalProperties: true };
    default:
      throw new Error(`No OpenAPI response schema is defined for media type "${resource.type}"`);
  }
}

function jsonSchemaFor(resource: DiscoveryResource): Record<string, unknown> {
  return isJsonMediaType(resource.type)
    ? responseSchemaFor(resource)
    : { $ref: "#/components/schemas/DiscoveryResource" };
}

function responseContentFor(resource: DiscoveryResource): Record<string, { schema: unknown }> {
  return {
    [resource.type]: { schema: responseSchemaFor(resource) },
    "application/json": { schema: jsonSchemaFor(resource) },
  };
}

function problemContent() {
  return {
    "application/problem+json": {
      schema: { $ref: "#/components/schemas/Problem" },
    },
  };
}

function markdownProblemContent() {
  return {
    ...problemContent(),
    "text/markdown": {
      schema: {
        type: "string",
        description: "The problem rendered as markdown for markdown-preferring clients.",
      },
    },
  };
}

function errorResponses() {
  return {
    "404": {
      description: "The requested resource does not exist.",
      content: markdownProblemContent(),
    },
    "405": {
      description: "The resource does not support the request method.",
      headers: {
        Allow: {
          description: "The methods the resource supports.",
          schema: { type: "string", examples: ["GET, HEAD"] },
        },
      },
      content: problemContent(),
    },
    "406": {
      description: "No representation matches the Accept header.",
      content: problemContent(),
    },
    "500": {
      description: "The server encountered an unexpected condition.",
      content: markdownProblemContent(),
    },
  };
}

const nlWebAskRequestSchema = {
  type: "object",
  required: ["query"],
  properties: {
    query: {
      type: "object",
      required: ["text"],
      properties: {
        text: { type: "string" },
        site: { type: "string" },
      },
      additionalProperties: true,
    },
    context: { type: "object", additionalProperties: true },
    prefer: {
      type: "object",
      properties: {
        streaming: { type: "boolean" },
        response_format: { type: "string", examples: ["conversational_search"] },
        mode: { type: "string", examples: ["list", "summarize"] },
        "accept-language": { type: "string" },
        "user-agent": { type: "string" },
      },
      additionalProperties: true,
    },
    meta: { type: "object", additionalProperties: true },
  },
  additionalProperties: true,
};

const nlWebAnswerSchema = {
  type: "object",
  required: ["_meta", "results"],
  properties: {
    _meta: {
      type: "object",
      required: ["response_type", "version"],
      properties: {
        response_type: { type: "string", examples: ["answer"] },
        response_format: { type: "string", examples: ["conversational_search"] },
        version: { type: "string", examples: ["0.55"] },
      },
    },
    results: {
      type: "array",
      items: {
        oneOf: [
          {
            type: "object",
            required: ["@type", "text"],
            properties: {
              "@type": { type: "string", examples: ["SearchSummary"] },
              text: { type: "string" },
            },
          },
          {
            type: "object",
            required: ["@type", "name", "url"],
            properties: {
              "@type": { type: "string", examples: ["WebPage"] },
              name: { type: "string" },
              url: { type: "string", format: "uri" },
            },
          },
        ],
      },
    },
  },
};

const nlWebFailureSchema = {
  type: "object",
  required: ["_meta", "error"],
  properties: {
    _meta: {
      type: "object",
      required: ["response_type", "version"],
      properties: {
        response_type: { type: "string", examples: ["failure"] },
        version: { type: "string", examples: ["0.55"] },
      },
    },
    error: {
      type: "object",
      required: ["code"],
      properties: {
        code: {
          type: "string",
          enum: ["NO_RESULTS", "UNSUPPORTED_FORMAT", "UNSUPPORTED_MODE", "INTERNAL_ERROR"],
        },
        message: { type: "string" },
      },
    },
  },
};

const askOperation = {
  operationId: "ask",
  summary: "Ask a question about the published content.",
  description: `Answers a question from the content published on ${siteUrl}, linking the pages used as sources. The request body carries the preferences, and the Accept header picks the transport: application/json for a single response, or text/event-stream for server-sent events. POST /ask is metered at ${askRateLimit.quota} requests per minute per client.`,
  requestBody: {
    required: true,
    content: {
      "application/json": { schema: { $ref: "#/components/schemas/NLWebAskRequest" } },
    },
  },
  responses: {
    "200": {
      description: "A conversational search answer, or an application-level failure.",
      headers: {
        "RateLimit-Policy": { $ref: "#/components/headers/AskRateLimitPolicy" },
        "RateLimit-Limit": { $ref: "#/components/headers/AskRateLimitLimit" },
        "RateLimit-Reset": { $ref: "#/components/headers/AskRateLimitReset" },
      },
      content: {
        "application/json": {
          schema: {
            oneOf: [
              { $ref: "#/components/schemas/NLWebAnswer" },
              { $ref: "#/components/schemas/NLWebFailure" },
            ],
          },
        },
        "text/event-stream": {
          schema: {
            type: "string",
            description:
              "Server-sent events in the NLWeb 0.55 order: start, one result per item, an optional error, then complete.",
          },
        },
      },
    },
    "400": {
      description: "The request body is not valid JSON, or not a valid NLWeb ask request.",
    },
    "429": {
      description: "The client exceeded the ask rate limit.",
      headers: {
        "Retry-After": { $ref: "#/components/headers/RetryAfter" },
        "RateLimit-Policy": { $ref: "#/components/headers/AskRateLimitPolicy" },
        "RateLimit-Limit": { $ref: "#/components/headers/AskRateLimitLimit" },
        "RateLimit-Reset": { $ref: "#/components/headers/AskRateLimitReset" },
      },
    },
  },
};

export function buildOpenApiDocument() {
  return {
    openapi: "3.1.0",
    info: {
      title: "m4t.tf Site Resources",
      version: "0.1.0",
      description: `Machine-readable resources published by m4t.tf. Clients may send the API-Version header to declare the API compatibility version they expect. The current API version is 1. Deprecated resources return RFC 9745 Deprecation and RFC 8594 Sunset response headers and stay available for at least six months after the deprecation date. Requests are not metered, except POST /ask, which is metered at ${askRateLimit.quota} requests per minute per client. Every machine-readable resource is available as application/json: the canonical document for JSON resources, and a typed descriptor for the others.`,
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
            "The representation the client accepts. Pages are available as text/html or text/markdown. Each machine-readable resource is served with the media type documented in its 200 response, or as application/json when the client asks for it: the canonical document for JSON resources, and a typed descriptor for the others. Error responses follow the same negotiation, returning application/problem+json for JSON clients and text/markdown for markdown clients. Clients that state no preference, whether by a */* Accept header or no Accept header at all, receive application/problem+json for errors. A request whose Accept header matches none of these returns application/problem+json with status 406.",
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
        AskRateLimitPolicy: {
          description: "The published ask limit as an IETF RateLimit-Policy field.",
          schema: {
            type: "string",
            examples: [
              `"${askRateLimit.name}";q=${askRateLimit.quota};w=${askRateLimit.windowSeconds}`,
            ],
          },
        },
        AskRateLimitLimit: {
          description: "The published ask request limit per window.",
          schema: { type: "integer", examples: [askRateLimit.quota] },
        },
        AskRateLimitReset: {
          description: "Seconds until the ask rate-limit window resets.",
          schema: { type: "integer", examples: [askRateLimit.windowSeconds] },
        },
        RetryAfter: {
          description: "Seconds until the next request is allowed.",
          schema: { type: "integer" },
        },
      },
      schemas: {
        AgentSkillsIndex: agentSkillsIndexSchema,
        Ard: ardSchema,
        DiscoveryResource: discoveryResourceSchema,
        Linkset: linksetSchema,
        LinksetReference: linksetReferenceSchema,
        NLWebAnswer: nlWebAnswerSchema,
        NLWebAskRequest: nlWebAskRequestSchema,
        NLWebFailure: nlWebFailureSchema,
        Problem: problemSchema,
      },
    },
    servers: [{ url: siteUrl }],
    paths: {
      ...Object.fromEntries(
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
                  },
                  content: responseContentFor(resource),
                },
                ...errorResponses(),
              },
            },
          },
        ]),
      ),
      "/ask": { post: askOperation },
    },
  };
}
