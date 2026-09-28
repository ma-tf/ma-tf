import * as v from "valibot";

export const NLWebAskRequestSchema = v.looseObject({
  query: v.looseObject({
    text: v.string(),
    site: v.optional(v.string()),
  }),
  context: v.optional(
    v.looseObject({
      "@type": v.optional(v.string()),
      "@context": v.optional(v.string()),
      prev: v.optional(v.array(v.string())),
      text: v.optional(v.string()),
      memory: v.optional(v.string()),
    }),
  ),
  prefer: v.optional(
    v.looseObject({
      streaming: v.optional(v.boolean()),
      response_format: v.optional(v.string()),
      mode: v.optional(v.string()),
      "accept-language": v.optional(v.string()),
      "user-agent": v.optional(v.string()),
    }),
  ),
  meta: v.optional(
    v.looseObject({
      version: v.optional(v.string()),
      session_context: v.optional(v.record(v.string(), v.unknown())),
      user: v.optional(v.union([v.string(), v.record(v.string(), v.unknown())])),
      remember: v.optional(v.boolean()),
    }),
  ),
});

export type NLWebAskRequest = v.InferOutput<typeof NLWebAskRequestSchema>;
