import type { McpResource } from "@features/mcp/catalogue";

export type AskTag = {
  short: string;
  keywords: string[];
};

export type AskTagFile = Record<string, Record<string, AskTag>>;

export type CorpusPage = {
  url: string;
  title: string;
  content: string;
};

export type CorpusResource = McpResource & { text: string };

export type CorpusArtefact = {
  sourceHash: string;
  pages: CorpusPage[];
};

export type ResourceArtefact = {
  sourceHash: string;
  resources: CorpusResource[];
};

export type CorpusInput = {
  pages: CorpusPage[];
  resources: McpResource[];
  tags: AskTagFile | undefined;
  sourceHash: string;
  fetchBody: (uri: string) => Promise<string>;
};

export type CorpusResult = {
  corpus: CorpusArtefact;
  catalogue: ResourceArtefact;
};

export type StoredCorpus = {
  corpusHash: string | undefined;
  resourcesHash: string | undefined;
  hasResources: boolean;
};

export type CorpusStaleReason =
  | "corpus-missing"
  | "corpus-hash"
  | "resources-missing"
  | "resources-hash"
  | "empty-catalogue";

export type CorpusStatus = { state: "current" } | { state: "stale"; reason: CorpusStaleReason };
