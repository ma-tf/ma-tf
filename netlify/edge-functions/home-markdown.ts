import { prefersMarkdown } from "../../src/lib/accept.ts";

export default function homeMarkdown(request: Request): URL | undefined {
  if (!prefersMarkdown(request.headers.get("Accept"))) return undefined;

  return new URL("/index.md", request.url);
}

export const config = {
  path: "/",
  method: ["GET", "HEAD"],
  header: { accept: "text/markdown" },
  onError: "bypass",
};
