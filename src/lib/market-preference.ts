import { COUNTRY_CODES, countryCodeFromPath } from "@/lib/country-paths";

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

export function pageMarket(pathname: string) {
  return { market: countryCodeFromPath(pathname), language: "en" };
}
