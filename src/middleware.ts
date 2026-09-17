import type { MiddlewareNext } from "astro";

import { linkHeader } from "@features/discovery/catalog";
import { formatMarkdownResponse } from "@features/discovery/markdown";
import { prefersJson, selectRepresentation } from "@features/discovery/negotiation";
import { problemResponse } from "@features/discovery/problems";
import { defineMiddleware } from "astro:middleware";

type Representation = ReturnType<typeof selectRepresentation>;

function applyDiscoveryLinks(response: Response, url: URL): Response {
  if (url.pathname !== "/") return response;

  response.headers.set("Link", linkHeader);

  return response;
}

async function resolveResponse(
  next: MiddlewareNext,
  representation: Representation,
): Promise<Response> {
  if (representation.kind === "markdown-suffix") {
    return formatMarkdownResponse(await next(representation.target), false);
  }

  if (representation.kind === "markdown-accept") {
    return formatMarkdownResponse(await next(), true);
  }

  return next();
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next();

  const accept = context.request.headers.get("Accept");
  const representation = selectRepresentation(context.url, accept);
  const response = await resolveResponse(next, representation);

  if (response.status >= 400) {
    return problemResponse(response, prefersJson(accept), context.url.pathname);
  }

  return applyDiscoveryLinks(response, context.url);
});
