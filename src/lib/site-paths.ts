export const PUBLIC_PREFIX = "/ae";
export const SITE_ORIGIN = "https://thebasebev.com";

const unprefixed = /^\/(?:api|_next|__static_pages|images|css|js|video|files|fonts)(?:\/|$)|^\/(?:robots\.txt|sitemap\.xml|rss\.xml|favicon\.ico)$/;

export function publicPath(href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const suffixAt = href.search(/[?#]/);
  const pathname = suffixAt < 0 ? href : href.slice(0, suffixAt);
  const suffix = suffixAt < 0 ? "" : href.slice(suffixAt);
  if (pathname === PUBLIC_PREFIX || pathname.startsWith(`${PUBLIC_PREFIX}/`) || unprefixed.test(pathname)) {
    return href;
  }
  return `${PUBLIC_PREFIX}${pathname === "/" ? "" : pathname}${suffix}`;
}

export function publicUrl(value: string) {
  if (!value) return value;
  try {
    const url = new URL(value);
    if (url.origin !== SITE_ORIGIN) return value;
    url.pathname = publicPath(url.pathname);
    return url.toString();
  } catch {
    return value;
  }
}
