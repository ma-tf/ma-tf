import { appendVaryValue } from "@features/discovery/negotiation";

const browserCacheControl = "public, max-age=0, must-revalidate";
const sharedCacheControl = "public, durable, s-maxage=3600, stale-while-revalidate=86400";
const uncachedCacheControl = "no-store";

function isCacheableDocument(request: Request, response: Response): boolean {
  return (request.method === "GET" || request.method === "HEAD") && response.status === 200;
}

export function applyCacheHeaders(response: Response, request: Request): Response {
  const headers = new Headers(response.headers);

  if (isCacheableDocument(request, response)) {
    headers.set("Cache-Control", browserCacheControl);
    headers.set("Netlify-CDN-Cache-Control", sharedCacheControl);
    appendVaryValue(headers, "Accept");
  } else {
    headers.set("Cache-Control", uncachedCacheControl);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
