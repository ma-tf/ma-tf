import type {
  CorpusInput,
  CorpusResult,
  CorpusStatus,
  StoredCorpus,
} from "@features/ask/corpus/types";

import { applyAskTags } from "@features/ask/corpus/tags";

export type {
  AskTag,
  AskTagFile,
  CorpusArtefact,
  CorpusInput,
  CorpusPage,
  CorpusResource,
  CorpusResult,
  CorpusStaleReason,
  CorpusStatus,
  ResourceArtefact,
  StoredCorpus,
} from "@features/ask/corpus/types";

export {
  askTagsPath,
  catalogueOutputPath,
  corpusOutputPath,
  corpusSourceHash,
} from "@features/ask/corpus/hash";

export async function buildCorpus(input: CorpusInput): Promise<CorpusResult> {
  const pages = applyAskTags(input.pages, input.tags);
  const bodies = new Map(pages.map((page) => [page.url, page.content]));

  await Promise.all(
    input.resources
      .filter((resource) => !bodies.has(resource.uri))
      .map(async (resource) => {
        bodies.set(resource.uri, await input.fetchBody(resource.uri));
      }),
  );

  return {
    corpus: { sourceHash: input.sourceHash, pages },
    catalogue: {
      sourceHash: input.sourceHash,
      resources: input.resources.map((resource) => {
        const text = bodies.get(resource.uri);

        if (text === undefined) throw new Error(`No body fetched for ${resource.uri}`);

        return { ...resource, text };
      }),
    },
  };
}

export function corpusStatus(sourceHash: string, stored: StoredCorpus): CorpusStatus {
  if (stored.corpusHash === undefined) return { state: "stale", reason: "corpus-missing" };
  if (stored.corpusHash !== sourceHash) return { state: "stale", reason: "corpus-hash" };
  if (stored.resourcesHash === undefined) return { state: "stale", reason: "resources-missing" };
  if (stored.resourcesHash !== sourceHash) return { state: "stale", reason: "resources-hash" };
  if (!stored.hasResources) return { state: "stale", reason: "empty-catalogue" };

  return { state: "current" };
}
