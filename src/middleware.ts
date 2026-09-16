import type { APIContext, MiddlewareNext } from "astro";

import { formatMarkdownResponse, selectRepresentation } from "@lib/markdown";
import { resources } from "@lib/resource-catalog";
import { defineMiddleware } from "astro:middleware";

type Representation = ReturnType<typeof selectRepresentation>;

const homepageLinkHeader = resources
  .flatMap((resource) =>
    "rel" in resource ? [`<${resource.path}>; rel="${resource.rel}"; type="${resource.type}"`] : [],
  )
  .join(", ");

function applyDiscoveryLinks(response: Response, url: URL): Response {
  if (url.pathname !== "/") return response;

  response.headers.set("Link", homepageLinkHeader);

  return response;
}

async function resolveResponse(
  context: APIContext,
  next: MiddlewareNext,
  representation: Representation,
): Promise<{ response: Response; url: URL }> {
  switch (representation.kind) {
    case "html":
      return { response: await next(), url: context.url };
    case "markdown-suffix":
      return {
        response: await formatMarkdownResponse(await next(representation.target), false),
        url: representation.target,
      };
    case "markdown-accept":
      return { response: await formatMarkdownResponse(await next(), true), url: context.url };
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next();

  const representation = selectRepresentation(context.url, context.request.headers.get("Accept"));
  const { response, url } = await resolveResponse(context, next, representation);

  return applyDiscoveryLinks(response, url);
});
