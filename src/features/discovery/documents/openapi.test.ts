import { isJsonMediaType, resources } from "@features/discovery/catalog";
import { buildOpenApiDocument } from "@features/discovery/documents/openapi";
import { validate } from "@readme/openapi-parser";
import { describe, expect, it } from "vite-plus/test";

describe("buildOpenApiDocument", () => {
  it("validates as OpenAPI 3.1", async () => {
    const document = buildOpenApiDocument() as unknown as Parameters<typeof validate>[0];

    await expect(validate(document)).resolves.toBeTruthy();
  });

  it("declares one path per discovery resource", () => {
    const document = buildOpenApiDocument();

    expect(Object.keys(document.paths).sort()).toEqual(
      resources.map((resource) => resource.path).sort(),
    );
  });

  it("gives every operation unique, non-empty metadata", () => {
    const document = buildOpenApiDocument();
    const operations = Object.values(document.paths).map((pathItem) => pathItem.get);

    const operationIds = operations.map((operation) => operation.operationId);
    expect(new Set(operationIds).size).toBe(operationIds.length);

    for (const operation of operations) {
      expect(operation.operationId).toBeTruthy();
      expect(operation.summary).toBeTruthy();
      expect(operation.description).toBeTruthy();
      expect(operation.tags.length).toBeGreaterThan(0);
    }
  });

  it("documents the media type and schema of every 200 response", () => {
    const document = buildOpenApiDocument();

    for (const resource of resources) {
      const operation = document.paths[resource.path]?.get;
      if (!operation) throw new Error(`Missing path for ${resource.path}`);

      expect(operation.tags).toEqual([...resource.tags]);
      expect(operation.summary).toBe(resource.title);

      const ok = operation.responses["200"];
      if (!ok) throw new Error(`Missing 200 response for ${resource.path}`);

      expect(Object.keys(ok.content)).toContain(resource.type);
      expect(Object.keys(ok.content)).toContain("application/json");

      const schema = ok.content[resource.type]?.schema as Record<string, unknown> | undefined;
      if (!schema) throw new Error(`Missing 200 schema for ${resource.path}`);

      expect(schema.type ?? schema.$ref).toBeTruthy();
    }
  });

  it("declares a typed application/json response for every operation", () => {
    const document = buildOpenApiDocument();
    const operations = Object.values(document.paths).map((pathItem) => pathItem.get);

    const withJson = operations.filter((operation) => {
      const schema = operation.responses["200"]?.content["application/json"]?.schema as
        | Record<string, unknown>
        | undefined;

      return Boolean(schema?.type ?? schema?.$ref);
    });

    expect(withJson.length).toBe(operations.length);
    expect(withJson.length / operations.length).toBeGreaterThan(0.6);
  });

  it("describes non-JSON resources with the DiscoveryResource schema", () => {
    const document = buildOpenApiDocument();

    for (const resource of resources) {
      if (isJsonMediaType(resource.type)) continue;

      const schema = document.paths[resource.path]?.get.responses["200"]?.content[
        "application/json"
      ]?.schema as Record<string, unknown> | undefined;

      expect(schema?.$ref).toBe("#/components/schemas/DiscoveryResource");
    }
  });
});
