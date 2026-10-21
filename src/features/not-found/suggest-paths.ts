// TODO: rank suggestions with a Jev judgment, the way judgeAskPages asks
// per-page questions in @features/ask/typesafe-ai.ts, instead of edit distance.
// Levenshtein only recovers typos; it cannot map a renamed or moved section.
const SECTION_ALIASES: Record<string, string> = {
  posts: "/blog",
  tags: "/blog",
};

function normalise(pathname: string): string {
  const path = pathname.split("?")[0]?.split("#")[0] ?? "";
  let decoded: string;

  try {
    decoded = decodeURIComponent(path);
  } catch {
    return "/";
  }

  const trimmed = decoded
    .trim()
    .toLowerCase()
    .replace(/\/+$/, "")
    .replace(/\.(md|html?)$/i, "");

  return trimmed || "/";
}

function threshold(length: number): number {
  if (length <= 5) return 1;
  if (length <= 9) return 2;

  return 3;
}

function distance(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;

    for (let j = 1; j <= b.length; j += 1) {
      const substitution = previous[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[j] = Math.min(previous[j]! + 1, current[j - 1]! + 1, substitution);
    }

    for (let j = 0; j <= b.length; j += 1) previous[j] = current[j]!;
  }

  return previous[b.length]!;
}

export function suggestPaths(pathname: string, knownPaths: readonly string[], limit = 2): string[] {
  const normalised = normalise(pathname);
  if (normalised === "/") return [];

  const raw = pathname.trim().toLowerCase();
  if (knownPaths.some((path) => path.toLowerCase() === raw)) return [];

  const known = knownPaths.map((path) => ({ path, normalised: normalise(path) }));
  const segments = normalised.split("/").filter(Boolean);
  const sectionCandidate = segments.length > 1 ? `/${segments[0]}` : undefined;
  const aliasCandidate = segments[0] ? SECTION_ALIASES[segments[0]] : undefined;
  const sectionSuggestion = [sectionCandidate, aliasCandidate].find(
    (candidate): candidate is string =>
      candidate !== undefined && known.some((entry) => entry.normalised === candidate),
  );
  const exact = known.find((entry) => entry.normalised === normalised);
  const candidates = new Map<string, number>();

  if (sectionSuggestion) candidates.set(sectionSuggestion, 0);
  if (exact) candidates.set(exact.path, 0);

  for (const entry of known) {
    if (entry.path === "/") continue;

    const score = distance(normalised, entry.normalised);
    if (score > threshold(normalised.length)) continue;

    const existing = candidates.get(entry.path);
    if (existing === undefined || score < existing) candidates.set(entry.path, score);
  }

  return [...candidates.entries()]
    .sort(
      ([pathA, scoreA], [pathB, scoreB]) =>
        scoreA - scoreB || pathA.length - pathB.length || pathA.localeCompare(pathB),
    )
    .slice(0, limit)
    .map(([path]) => path);
}
