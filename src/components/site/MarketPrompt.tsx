"use client";

import { useEffect, useState } from "react";
import { DISTRIBUTOR_MARKETS } from "@/data/distributor-markets";
import { countryCodeFromPath, switchCountryPath } from "@/lib/country-paths";
import { pageMarket, readMarketPreference, saveMarketPreference } from "@/lib/market-preference";
import styles from "./MarketPrompt.module.css";

const SESSION_KEY = "tb_market_session";
const marketName = (code: string) => DISTRIBUTOR_MARKETS.find((market) => market.code === code)?.name ?? code;
const here = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

/**
 * Market on arrival.
 *
 * A returning visitor who chose a market opens in it: once per browser
 * session, the first page they land on moves to their market's prefix. A
 * visitor who has not chosen is never moved — redirecting on location would
 * confuse crawlers and annoy people — they are asked instead, from the
 * country Cloudflare reports (`/api/geo`), with "Yes" and "Stay". Either
 * answer is remembered as their choice.
 *
 * It also hands the page's market and language to the data layer, so every
 * analytics event after it carries them.
 */
export function MarketPrompt() {
  const [suggested, setSuggested] = useState<string | null>(null);

  // Market and language on the data layer, and on every Shop / Buy click.
  useEffect(() => {
    const layer = ((window as { dataLayer?: unknown[] }).dataLayer ??= []);
    layer.push(pageMarket(window.location.pathname));
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a[data-shop-link]") : null;
      if (link) layer.push({ event: "shop_click", ...pageMarket(window.location.pathname) });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {

    const current = countryCodeFromPath(window.location.pathname);
    const preferred = readMarketPreference();

    let firstPage = false;
    try {
      firstPage = !window.sessionStorage.getItem(SESSION_KEY);
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Storage blocked: treat every page as already seen; nothing moves.
    }

    if (preferred) {
      if (firstPage && preferred !== current) window.location.replace(switchCountryPath(here(), preferred));
      return;
    }

    const controller = new AbortController();
    fetch("/api/geo", { signal: controller.signal, cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { country?: string | null } | null) => {
        const country = body?.country?.toUpperCase();
        if (country && country !== current && DISTRIBUTOR_MARKETS.some((market) => market.code === country)) {
          setSuggested(country);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (!suggested) return null;

  const go = () => {
    saveMarketPreference(suggested);
    window.location.assign(switchCountryPath(here(), suggested));
  };
  const stay = () => {
    saveMarketPreference(countryCodeFromPath(window.location.pathname));
    setSuggested(null);
  };

  return (
    <div className={styles.bar} role="region" aria-label="Your country">
      <p className={styles.text}>
        Looks like you’re in {marketName(suggested)}. Go to {marketName(suggested)} site?
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.yes} onClick={go}>
          Yes
        </button>
        <button type="button" className={styles.stay} onClick={stay}>
          Stay
        </button>
      </div>
    </div>
  );
}
