export function getAcceptedQuality(value: string, mediaType: string): number {
  const candidate = value
    .split(",")
    .map((item) => item.trim())
    .find((item) => item.split(";", 1)[0]?.trim().toLowerCase() === mediaType);

  if (!candidate) return 0;

  const qualityMatch = candidate.match(/(?:^|;)\s*q\s*=\s*([^;]+)/i);
  const quality = Number.parseFloat(qualityMatch ? qualityMatch[1]! : "1");
  if (!Number.isFinite(quality)) return 0;

  return Math.min(Math.max(quality, 0), 1);
}

export function acceptsMediaType(
  accept: string | null,
  mediaType: string,
  { explicitOnly = false }: { explicitOnly?: boolean } = {},
): boolean {
  if (!accept) return false;

  const [type] = mediaType.split("/");
  const candidates = explicitOnly ? [mediaType, `${type}/*`] : [mediaType, `${type}/*`, "*/*"];

  for (const candidate of candidates) {
    const matched = accept
      .split(",")
      .some((item) => item.split(";", 1)[0]?.trim().toLowerCase() === candidate);

    if (matched) return getAcceptedQuality(accept, candidate) > 0;
  }

  return false;
}
