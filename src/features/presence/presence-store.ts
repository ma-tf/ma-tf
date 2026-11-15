import { degrade } from "@lib/wide-event";

const prefix = "presence";
const ttlMs = 90_000;

type Presence = { lastSeen: number };

async function presenceStore() {
  const { getDeployStore, getStore } = await import("@netlify/blobs");
  const options = { name: "presence", consistency: "strong" } as const;

  return process.env.DEPLOY_ID ? getStore(options) : getDeployStore(options);
}

export async function recordPresence(hash: string): Promise<void> {
  try {
    const store = await presenceStore();

    await store.setJSON(`${prefix}:${hash}`, { lastSeen: Date.now() });
  } catch (error) {
    degrade("presence", "write_failed", error);
  }
}

export async function countOnline(now: number = Date.now()): Promise<number> {
  try {
    const store = await presenceStore();
    const { blobs } = await store.list({ prefix: `${prefix}:` });
    let online = 0;

    await Promise.all(
      blobs.map(async ({ key }) => {
        const entry = (await store.get(key, { type: "json" })) as Presence | null;

        if (entry && now - entry.lastSeen <= ttlMs) {
          online += 1;

          return;
        }

        await store.delete(key).catch(() => undefined);
      }),
    );

    return online;
  } catch (error) {
    degrade("presence", "count_failed", error);

    return 0;
  }
}
