import { COUNTRY_CODES, countryCodeFromPath } from "@/lib/country-paths";

/**
 * The visitor's chosen market, kept for a year. Written only when they pick a
 * country themselves (the selector, or "Yes"/"Stay" on the location prompt),
 * never inferred, so it is a preference rather than tracking. Search engines
 * send no cookies, so it never changes what a crawler sees.
 */
export const MARKET_COOKIE = "tb_market";
const ONE_YEAR = 60 * 60 * 24 * 365;

const known = new Set(COUNTRY_CODES);

export function readMarketPreference(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${MARKET_COOKIE}=([A-Za-z]{2})`));
  const code = match?.[1]?.toUpperCase();
  return code && known.has(code) ? code : null;
}

export function saveMarketPreference(code: string) {
  const value = code.toUpperCase();
  if (!known.has(value)) return;
  document.cookie = `${MARKET_COOKIE}=${value}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
}

/** The market and language a page is in, for analytics events. */
export function pageMarket(pathname: string) {
  // Every market currently shares the English site; the language follows the
  // path once localized versions exist.
  return { market: countryCodeFromPath(pathname), language: "en" };
}
