import type { MiddlewareNext } from "astro";

import {
  appendVaryValue,
  formatMarkdownResponse,
  prefersJson,
  selectRepresentation,
} from "@lib/markdown";
import { resources, siteUrl } from "@lib/resource-catalog";
import { defineMiddleware } from "astro:middleware";

type Representation = ReturnType<typeof selectRepresentation>;

const homepageLinkHeader = resources
  .flatMap((resource) =>
    "rel" in resource ? [`<${resource.path}>; rel="${resource.rel}"; type="${resource.type}"`] : [],
  )
  .join(", ");

const notFoundProblem = {
  type: `${siteUrl}/problems/not-found`,
  title: "Resource not found",
  status: 404,
  detail: `No resource exists at the requested path. The published resources are listed at ${siteUrl}/llms.txt.`,
  code: "RESOURCE_NOT_FOUND",
};

const serverErrorProblem = {
  type: `${siteUrl}/problems/internal-server-error`,
  title: "Internal server error",
  status: 500,
  detail: "The server could not complete the request.",
  code: "INTERNAL_SERVER_ERROR",
};

function applyDiscoveryLinks(response: Response, url: URL): Response {
  if (url.pathname !== "/") return response;

  response.headers.set("Link", homepageLinkHeader);

  return response;
}

function errorResponse(response: Response, acceptsJson: boolean, pathname: string): Response {
  if (acceptsJson) {
    const problem = response.status === 404 ? notFoundProblem : serverErrorProblem;

    return new Response(JSON.stringify({ ...problem, instance: pathname }), {
      status: response.status,
      headers: {
        "Content-Type": "application/problem+json; charset=utf-8",
        Vary: "Accept",
      },
    });
  }

  const headers = new Headers(response.headers);
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
    return errorResponse(response, prefersJson(accept), context.url.pathname);
  }

  return applyDiscoveryLinks(response, context.url);
});
