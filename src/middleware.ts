import type { APIContext, MiddlewareHandler, MiddlewareNext } from "astro";

import { linkHeader } from "@features/discovery/catalog";
import { isAgentSkillArtifactPath } from "@features/discovery/documents/agent-skills";
import { formatMarkdownResponse } from "@features/discovery/markdown";
import { appendVaryValue, selectRepresentation } from "@features/discovery/negotiation";
import { preflightResponse, problemResponse } from "@features/discovery/problems";
import { resourceJson } from "@features/discovery/resource-json";
import { resourceMarkdownResponse } from "@features/discovery/resource-markdown";
import { apiRateLimitFor, isApiPath } from "@lib/api-paths";
import { enforceRateLimit } from "@lib/rate-limit-middleware";
import { wideEventMiddleware } from "@lib/wide-event-middleware";
import { sequence } from "astro:middleware";

type Representation = ReturnType<typeof selectRepresentation>;

function jsonResponse(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  appendVaryValue(headers, "Accept");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function resolveResponse(
  next: MiddlewareNext,
  representation: Representation,
): Promise<Response> {
  switch (representation.kind) {
    case "markdown-suffix":
      return (
        resourceMarkdownResponse(representation.target.pathname) ??
        formatMarkdownResponse(await next(representation.target), false)
      );

    case "markdown-accept":
      return formatMarkdownResponse(await next(), true);

    case "json-document":
      return jsonResponse(await next());

    case "json-descriptor":
      return jsonResponse(resourceJson(representation.resource));

    default:
      return next();
  }
}

async function respond(context: APIContext, next: MiddlewareNext): Promise<Response> {
  if (context.isPrerendered) return next();

  const accept = context.request.headers.get("Accept");
  const { pathname } = context.url;
  const rejection = preflightResponse(context.request, accept, pathname);
  if (rejection) return rejection;

  const response = isAgentSkillArtifactPath(pathname)
    ? await next()
    : await resolveResponse(next, selectRepresentation(context.url, accept));

  return response.status >= 400 ? problemResponse(response, accept, pathname) : response;
}

const discoveryMiddleware: MiddlewareHandler = async (context, next) => {
  const { pathname } = context.url;

  if (isApiPath(pathname)) {
    const limit = apiRateLimitFor(pathname, context.request);

    if (limit) {
      const limited = await enforceRateLimit(context.request, limit);

      if (limited) return limited;
    }

    return next();
  }

  const response = await respond(context, next);
  response.headers.set("Link", linkHeader);

  return response;
};

type ResponseMiddleware = (context: APIContext, next: MiddlewareNext) => Promise<Response>;

export const onRequest = sequence(wideEventMiddleware, discoveryMiddleware) as ResponseMiddleware;
