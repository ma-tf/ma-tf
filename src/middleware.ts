import type { APIContext, MiddlewareNext } from "astro";

import { linkHeader } from "@features/discovery/catalog";
import { formatMarkdownResponse } from "@features/discovery/markdown";
import { selectRepresentation } from "@features/discovery/negotiation";
import { preflightResponse, problemResponse } from "@features/discovery/problems";
import { rateLimitHeaders } from "@features/discovery/rate-limits";
import { resourceMarkdownResponse } from "@features/discovery/resource-markdown";
import { defineMiddleware } from "astro:middleware";

type Representation = ReturnType<typeof selectRepresentation>;

function applySiteHeaders(response: Response): Response {
  response.headers.set("Link", linkHeader);

  for (const [name, value] of Object.entries(rateLimitHeaders)) {
    response.headers.set(name, value);
  }

  return response;
}

async function resolveResponse(
  next: MiddlewareNext,
  representation: Representation,
): Promise<Response> {
  if (representation.kind === "markdown-suffix") {
    return (
      resourceMarkdownResponse(representation.target.pathname) ??
      formatMarkdownResponse(await next(representation.target), false)
    );
  }

  if (representation.kind === "markdown-accept") {
    return formatMarkdownResponse(await next(), true);
  }

  return next();
}

async function respond(context: APIContext, next: MiddlewareNext): Promise<Response> {
  if (context.isPrerendered) return next();

  const accept = context.request.headers.get("Accept");
  const { pathname } = context.url;
  const rejection = preflightResponse(context.request, accept, pathname);
  if (rejection) return rejection;

  const response = await resolveResponse(next, selectRepresentation(context.url, accept));

  return response.status >= 400 ? problemResponse(response, accept, pathname) : response;
}

export const onRequest = defineMiddleware(async (context, next) => {
  return applySiteHeaders(await respond(context, next));
});
