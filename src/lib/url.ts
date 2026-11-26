/** Prefix an internal path with the configured Astro base (e.g. /astrology). */
export const basePath = import.meta.env.BASE_URL.replace(/\/+$/, '');

export function href(path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${clean}`;
}
