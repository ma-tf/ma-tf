export function sortByDate(a: Date | undefined, b: Date | undefined): number {
  if (a === undefined) return -1;
  if (b === undefined) return 1;
  return b.valueOf() - a.valueOf();
}

export function getOrInit<T>(map: Map<string, T>, key: string, factory: () => T): T {
  const existing = map.get(key);
  if (existing !== undefined) return existing;
  const value = factory();
  map.set(key, value);
  return value;
}
