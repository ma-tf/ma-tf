import { clientIp, clientKey } from "@lib/rate-limit-middleware";
import { degrade } from "@lib/wide-event";

export function visitorHash(request: Request, stage: string): string | null {
  const ip = clientIp(request);

  if (!ip) {
    degrade(stage, "no_client_ip");

    return null;
  }

  const salt = process.env.RATE_LIMIT_SALT;

  if (!salt) {
    degrade(stage, "no_salt");

    return null;
  }

  return clientKey(ip, salt);
}
