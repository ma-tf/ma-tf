const apiPaths = new Set(["/ask"]);

export function isApiPath(pathname: string): boolean {
  return apiPaths.has(pathname);
}
