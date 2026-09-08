import { formatMarkdownResponse, selectRepresentation } from "@lib/markdown";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const representation = selectRepresentation(context.url, context.request.headers.get("Accept"));

  if (representation.kind === "html") return next();

  const response =
    representation.source === "suffix" ? await next(representation.target) : await next();

  return formatMarkdownResponse(response, representation.source === "accept");
});
