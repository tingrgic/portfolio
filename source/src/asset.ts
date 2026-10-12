/** Resolve public assets against Vite's deployment base (root locally, /portfolio/ on Pages). */
export function asset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
