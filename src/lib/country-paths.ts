import { DISTRIBUTOR_MARKETS } from "../data/distributor-markets";

export const DEFAULT_COUNTRY_CODE = "AE";
export const COUNTRY_CODES = DISTRIBUTOR_MARKETS.map(({ code }) => code);
export const COUNTRY_ALIAS_PREFIXES = COUNTRY_CODES
  .filter((code) => code !== DEFAULT_COUNTRY_CODE)
  .map((code) => code.toLowerCase());

const countryCodes = new Set(COUNTRY_CODES);
const countryPrefix = /^\/([a-z]{2})(?=\/|$)/i;
const reservedSegments = "api|_next|__static_pages|images|css|js|video|files|fonts|checkout";
const reservedFiles = "robots\\.txt|sitemap\\.xml|rss\\.xml|favicon\\.ico";
const reservedPath = new RegExp(`^/(?:${reservedSegments})(?:/|$)|^/(?:${reservedFiles})$`, "i");

/** Public media, APIs and the standalone checkout keep their original paths. */
export const COUNTRY_DOCUMENT_PATH_PATTERN = `(?!(?:${reservedSegments})(?:/|$)|(?:${reservedFiles})$).+`;

function splitHref(href: string) {
  const suffixAt = href.search(/[?#]/);
  return suffixAt < 0
    ? { pathname: href, suffix: "" }
    : { pathname: href.slice(0, suffixAt), suffix: href.slice(suffixAt) };
}

function pathCountry(pathname: string) {
  const match = countryPrefix.exec(pathname);
  if (!match) return null;
  const code = match[1].toUpperCase();
  return countryCodes.has(code) ? { code, prefix: match[0] } : null;
}

function documentPath(pathname: string) {
  const country = pathCountry(pathname);
  const route = country ? pathname.slice(country.prefix.length) || "/" : pathname;
  // Encoded separators must not turn a country document request into an asset/API alias.
  let decodedRoute: string;
  try {
    decodedRoute = decodeURIComponent(route);
  } catch {
    return null;
  }
  if (decodedRoute.includes("\\") || reservedPath.test(decodedRoute)) return null;
  return { country, route };
}

/** The visible URL is authoritative; shared English documents default to UAE. */
export function countryCodeFromPath(pathname: string) {
  return pathCountry(splitHref(pathname).pathname)?.code ?? DEFAULT_COUNTRY_CODE;
}

/** Explicit cross-country links keep their destination; ordinary links follow the visitor. */
export function countryPath(href: string, code: string) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const { pathname } = splitHref(href);
  const country = pathCountry(pathname);
  if (country && country.code !== DEFAULT_COUNTRY_CODE) return href;
  return switchCountryPath(href, code);
}

/** Country selector: replace the prefix while preserving the route, query and fragment. */
export function switchCountryPath(href: string, code: string) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const { pathname, suffix } = splitHref(href);
  const parsed = documentPath(pathname);
  if (!parsed) return href;
  const requested = code.toUpperCase();
  const country = countryCodes.has(requested) ? requested : DEFAULT_COUNTRY_CODE;
  return `/${country.toLowerCase()}${parsed.route === "/" ? "" : parsed.route}${suffix}`;
}

/** Reuse the generated English HTML/RSC document, without redirecting the visible URL. */
export function toDefaultCountryPath(pathname: string) {
  if (!pathname.startsWith("/") || pathname.startsWith("//")) return pathname;
  const parsed = documentPath(pathname);
  if (!parsed?.country || parsed.country.code === DEFAULT_COUNTRY_CODE) return pathname;
  return `/ae${parsed.route === "/" ? "" : parsed.route}`;
}
