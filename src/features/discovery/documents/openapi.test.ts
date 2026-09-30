import { isJsonMediaType, resources } from "@features/discovery/catalog";
import { buildOpenApiDocument } from "@features/discovery/documents/openapi";
import { validate } from "@readme/openapi-parser";
import { describe, expect, it } from "vite-plus/test";

const ERROR_STATUSES = ["404", "405", "406", "500"] as const;
const PROBLEM_REF = "#/components/schemas/Problem";
const DESCRIPTOR_REF = "#/components/schemas/DiscoveryResource";
const JSON_MEDIA_TYPE = "application/json";
const ASK_PATH = "/ask";

type Operation = {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  responses: Record<string, { content?: unknown }>;
};

const document = buildOpenApiDocument();
const paths = document.paths as unknown as Record<string, { get?: Operation; post?: Operation }>;
const operationFor = (path: string) => paths[path]?.get;

const schemaAt = (content: unknown, mediaType: string) =>
  (content as Record<string, { schema: unknown }> | undefined)?.[mediaType]?.schema as
    | Record<string, unknown>
    | undefined;

const schemaRefAt = (content: unknown, mediaType: string) => schemaAt(content, mediaType)?.$ref;

const isTypedSchema = (content: unknown, mediaType: string) => {
  const schema = schemaAt(content, mediaType);

  return Boolean(schema?.type ?? schema?.$ref);
};

describe("buildOpenApiDocument", () => {
  it("validates as OpenAPI 3.1", async () => {
    const fresh = buildOpenApiDocument() as unknown as Parameters<typeof validate>[0];

    await expect(validate(fresh)).resolves.toBeTruthy();
  });

  it("declares a path per discovery resource plus the ask endpoint", () => {
    expect(Object.keys(document.paths).sort()).toEqual(
      [...resources.map((resource) => resource.path), ASK_PATH].sort(),
    );
  });

  it("documents the ask endpoint with its rate limit", () => {
    const post = paths[ASK_PATH]?.post;

    expect(post?.operationId).toBe("ask");
    expect(Object.keys(post?.responses ?? {})).toEqual(["200", "400", "429"]);
  });

  it("gives every operation a unique operationId", () => {
    const operationIds = Object.values(paths).flatMap((item) =>
      [item.get?.operationId, item.post?.operationId].filter((id) => id !== undefined),
    );

    expect(new Set(operationIds).size).toBe(operationIds.length);
  });

  it("documents operation metadata for every resource", () => {
    const table = resources.map((resource) => {
      const operation = operationFor(resource.path);

      return [
        resource.path,
        operation?.summary,
        operation?.tags,
        Boolean(operation?.operationId),
        Boolean(operation?.description),
      ];
    });

    expect(table).toEqual(
      resources.map((resource) => [resource.path, resource.title, [...resource.tags], true, true]),
    );
  });

  it("documents typed canonical and JSON schemas for every 200 response", () => {
    const table = resources.map((resource) => {
      const content = operationFor(resource.path)?.responses["200"]?.content as
        | Record<string, unknown>
        | undefined;

      return [
        resource.path,
        Object.keys(content ?? {}).sort(),
        isTypedSchema(content, resource.type),
        isTypedSchema(content, JSON_MEDIA_TYPE),
      ];
    });

    expect(table).toEqual(
      resources.map((resource) => [
        resource.path,
        [...new Set([resource.type, JSON_MEDIA_TYPE])].sort(),
        true,
        true,
      ]),
    );
  });

  it("points the JSON response of non-JSON resources at the descriptor schema", () => {
    const descriptorResources = resources.filter((resource) => !isJsonMediaType(resource.type));

    const table = descriptorResources.map((resource) => [
      resource.path,
      schemaRefAt(operationFor(resource.path)?.responses["200"]?.content, JSON_MEDIA_TYPE),
    ]);

    expect(table).toEqual(descriptorResources.map((resource) => [resource.path, DESCRIPTOR_REF]));
  });

  it("types every 4xx and 5xx response with the Problem schema", () => {
    const table = resources.flatMap((resource) =>
      ERROR_STATUSES.map((status) => [
        resource.path,
        status,
        schemaRefAt(
          operationFor(resource.path)?.responses[status]?.content,
          "application/problem+json",
        ),
      ]),
    );

    expect(table).toEqual(
      resources.flatMap((resource) =>
        ERROR_STATUSES.map((status) => [resource.path, status, PROBLEM_REF]),
      ),
    );
  });
});
