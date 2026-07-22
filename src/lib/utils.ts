export function sortByDate(a: Date | undefined, b: Date | undefined): number {
  if (a === undefined) return -1;
  if (b === undefined) return 1;
  return b.valueOf() - a.valueOf();
}
