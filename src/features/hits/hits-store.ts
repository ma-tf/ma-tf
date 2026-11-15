import { degrade } from "@lib/wide-event";

type Hits = { count: number };

async function hitsStore() {
  const { getDeployStore, getStore } = await import("@netlify/blobs");
  const options = { name: "hits", consistency: "strong" } as const;

  return process.env.DEPLOY_ID ? getStore(options) : getDeployStore(options);
}

export async function readHits(): Promise<number> {
  try {
    const store = await hitsStore();
    const entry = (await store.get("total", { type: "json" })) as Hits | null;

    return entry?.count ?? 0;
  } catch (error) {
    degrade("hits", "read_failed", error);

    return 0;
  }
}

export async function incrementHits(): Promise<number> {
  let lastKnown = 0;

  try {
    const store = await hitsStore();
    const entry = (await store.get("total", { type: "json" })) as Hits | null;
    lastKnown = entry?.count ?? 0;
    const count = lastKnown + 1;

    await store.setJSON("total", { count });

    return count;
  } catch (error) {
    degrade("hits", "increment_failed", error);

    return lastKnown;
  }
}
