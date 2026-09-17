import type { APIRoute } from "astro";

import { buildAgentSkillsIndex } from "@features/discovery/documents/agent-skills";

export const GET = (async () =>
  Response.json(await buildAgentSkillsIndex(), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })) satisfies APIRoute;
