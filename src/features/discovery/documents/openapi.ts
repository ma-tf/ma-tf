import { resources, siteUrl } from "@features/discovery/catalog";
import { problemSchema } from "@features/discovery/problems";

export function buildOpenApiDocument() {
  return {
    openapi: "3.1.0",
    info: {
      title: "m4t.tf Site Resources",
      version: "0.1.0",
      description:
        "Machine-readable resources published by m4t.tf. Clients may send the API-Version header to declare the API compatibility version they expect. The current API version is 1. Deprecated resources return RFC 9745 Deprecation and RFC 8594 Sunset response headers and stay available for at least six months after the deprecation date.",
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
      },
      schemas: {
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
      },
    },
    servers: [{ url: siteUrl }],
    paths: Object.fromEntries(
      resources.map((resource) => [
        resource.path,
        {
          get: {
            summary: resource.title,
            parameters: [{ $ref: "#/components/parameters/ApiVersion" }],
            responses: {
              "200": {
                description: resource.description,
                headers: {
                  Deprecation: { $ref: "#/components/headers/Deprecation" },
                  Sunset: { $ref: "#/components/headers/Sunset" },
                },
                content: { [resource.type]: {} },
              },
              "404": { $ref: "#/components/responses/NotFound" },
              "500": { $ref: "#/components/responses/InternalServerError" },
            },
          },
        },
      ]),
    ),
  };
}
