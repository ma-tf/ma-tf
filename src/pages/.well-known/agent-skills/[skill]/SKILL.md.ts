import type { APIRoute } from "astro";

import {
  agentSkillMarkdown,
  agentSkillSummaries,
} from "@features/discovery/documents/agent-skills";

export function getStaticPaths() {
  return agentSkillSummaries().map(({ name }) => ({ params: { skill: name } }));
}

export const GET = (({ params }) => {
  const markdown = agentSkillMarkdown(params.skill ?? "");
  if (!markdown) return new Response(null, { status: 404 });

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}) satisfies APIRoute;
