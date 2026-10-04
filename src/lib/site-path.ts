/** Next Link handles basePath; raw assets, downloads and browser redirects do not. */
export function sitePath(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return path.startsWith("/") &&
    !path.startsWith("//") &&
    !(base && (path === base || path.startsWith(`${base}/`)))
    ? `${base}${path}`
    : path;
}
