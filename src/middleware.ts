import type { MiddlewareNext } from "astro";

import { linkHeader } from "@features/discovery/catalog";
import { formatMarkdownResponse } from "@features/discovery/markdown";
import { selectRepresentation } from "@features/discovery/negotiation";
import { preflightResponse, problemResponse } from "@features/discovery/problems";
import { defineMiddleware } from "astro:middleware";

type Representation = ReturnType<typeof selectRepresentation>;

function applyDiscoveryLinks(response: Response): Response {
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
  const { pathname } = context.url;
  const rejection = preflightResponse(context.request, accept, pathname);
  if (rejection) return rejection;

  const response = await resolveResponse(next, selectRepresentation(context.url, accept));

  if (response.status >= 400) return problemResponse(response, accept, pathname);

  return applyDiscoveryLinks(response);
});
