import { clientIp, clientKey } from "@lib/rate-limit-middleware";
import { degrade } from "@lib/wide-event";

const prefix = "unique";

async function uniquesStore() {
  const { getDeployStore, getStore } = await import("@netlify/blobs");
  const options = { name: "uniques", consistency: "strong" } as const;

  return process.env.DEPLOY_ID ? getStore(options) : getDeployStore(options);
}

export function utcDay(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function uniqueHash(request: Request): string | null {
  const ip = clientIp(request);

  if (!ip) {
    degrade("uniques", "no_client_ip");

    return null;
  }

  const salt = process.env.RATE_LIMIT_SALT;

  if (!salt) {
    degrade("uniques", "no_salt");

    return null;
  }

  return clientKey(ip, salt);
}

export async function recordUnique(hash: string): Promise<void> {
  try {
    const store = await uniquesStore();

    await store.set(`${prefix}:${utcDay()}:${hash}`, "1", { onlyIfNew: true });
  } catch (error) {
    degrade("uniques", "write_failed", error);
  }
}

export async function countUniques(day: string): Promise<number> {
  try {
    const store = await uniquesStore();
    const { blobs } = await store.list({ prefix: `${prefix}:${day}:` });

    return blobs.length;
  } catch (error) {
    degrade("uniques", "count_failed", error);

    return 0;
  }
}
