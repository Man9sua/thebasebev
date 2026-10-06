"use client";

import { useState, useSyncExternalStore } from "react";
import { SampleRequestModal } from "@/components/forms/SampleRequestModal";
import { SiteLink } from "@/components/site/SiteLink";
import { DISTRIBUTOR_GROUPS, DISTRIBUTOR_MARKETS } from "@/data/distributor-markets";
import { COMPANY, SHOP_URL } from "@/lib/site-config";
import styles from "./DistributorFinderPage.module.css";

function subscribeMarket(change: () => void) {
  window.addEventListener("popstate", change);
  return () => window.removeEventListener("popstate", change);
}

function requestedMarket() {
  const code = new URLSearchParams(window.location.search).get("market")?.toUpperCase();
  return DISTRIBUTOR_MARKETS.find((market) => market.code === code)?.code ?? "AE";
}

const defaultMarket = () => "AE";

export function DistributorFinderPage() {
  const requestedCode = useSyncExternalStore(subscribeMarket, requestedMarket, defaultMarket);
  const [chosenCode, setChosenCode] = useState<string | null>(null);
  const selectedCode = chosenCode ?? requestedCode;
  const [query, setQuery] = useState("");
  const selected = DISTRIBUTOR_MARKETS.find((market) => market.code === selectedCode)!;
  const uae = selected.code === "AE";
  const search = query.trim().toLocaleLowerCase();
  const filtered = DISTRIBUTOR_MARKETS.filter((market) =>
    `${market.name} ${market.code}`.toLocaleLowerCase().includes(search),
  );

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.intro}>
          <h1 className={styles.title}>Find your<br />distributor</h1>
          <p className={styles.lede}>
            Choose your country to get local prices, stock, delivery and samples.
            We are building our partner network across 17 markets.
          </p>
        </div>

        <div className={styles.layout}>
          <div className={styles.countryList}>
            <label className={styles.search}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search country"
                aria-label="Search country"
              />
            </label>
            {DISTRIBUTOR_GROUPS.map((group) => {
              const markets = filtered.filter((market) => market.group === group);
              if (!markets.length) return null;
              return (
                <div className={styles.group} key={group}>
                  <h2 className={styles.groupName}>{group}</h2>
                  <div className={styles.countries}>
                    {markets.map((market) => (
                      <button
                        type="button"
                        key={market.code}
                        className={`${styles.country} ${selectedCode === market.code ? styles.selected : ""}`}
                        aria-pressed={selectedCode === market.code}
                        aria-controls="distributor-details"
                        onClick={() => setChosenCode(market.code)}
                      >
                        <span>{market.name}</span>
                        <span className={styles.code}>{market.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {!filtered.length && <p className={styles.noResults} role="status">No partner in this country yet. Contact the UAE team below.</p>}
          </div>

          <section className={styles.partner} id="distributor-details" aria-labelledby="distributor-partner-name">
            <div className={styles.partnerHeading}>
              <h2 id="distributor-partner-name" className={styles.partnerTitle}>
                {uae ? "The Base Beverage" : "Partner details coming soon"}
              </h2>
              <span className={styles.languages}>{selected.languages}</span>
            </div>
            <dl className={styles.details}>
              <div><dt>Address</dt><dd>{uae ? "Showroom, Dubai, UAE" : "Details pending"}</dd></div>
              <div><dt>Working hours</dt><dd>{uae ? "Mon–Sat, 09:00–18:00 GST" : "Details pending"}</dd></div>
              <div><dt>Phone</dt><dd>{uae ? <a href={COMPANY.phoneHref}>{COMPANY.phone}</a> : "Contact the UAE team"}</dd></div>
              <div><dt>Email</dt><dd>{uae ? <a href="mailto:sales@thebasebev.com">sales@thebasebev.com</a> : "Contact the UAE team"}</dd></div>
            </dl>
            <div className={styles.actions}>
              <a
                href={uae ? COMPANY.whatsappHref : `${COMPANY.whatsappHref}?text=${encodeURIComponent(`Hello, I would like to find THE BASE distributor in ${selected.name}.`)}`}
                className={`${styles.button} ${styles.red}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {uae ? "WhatsApp" : "WhatsApp UAE team"}
              </a>
              <SampleRequestModal
                key={selected.code}
                className={`${styles.button} ${styles.outline}`}
                country={selected.code}
                label="Request samples"
              />
              {uae && <a className={`${styles.button} ${styles.shop}`} href={SHOP_URL} target="_blank" rel="noreferrer noopener">Shop online ↗</a>}
            </div>
            <div className={styles.partnerFoot}>
              <p>
                {uae ? "Enquiries from this page go to THE BASE UAE team." : `Local contact details for ${selected.name} are not published yet. The UAE team will help with your enquiry.`}
              </p>
              {uae && <SiteLink href="/" className={styles.marketLink}>Open thebasebev.com/ae →</SiteLink>}
            </div>
          </section>
        </div>

        <div className={styles.support}>
          <section className={styles.supportCard} aria-labelledby="finder-not-listed">
            <h2 id="finder-not-listed">Not on the list?</h2>
            <p>We supply direct from the UAE to any country. Tell us your market and volume.</p>
            <SiteLink href="/contacts" className={`${styles.button} ${styles.black}`}>Contact the UAE team</SiteLink>
          </section>
          <section className={styles.supportCard} aria-labelledby="finder-apply">
            <h2 id="finder-apply">Become a distributor</h2>
            <p>We are opening new markets. Exclusive territory on the Strategic tier.</p>
            <SiteLink href="/distributors#distributor-form" className={`${styles.button} ${styles.apply}`}>Apply for distribution</SiteLink>
          </section>
        </div>
      </div>
    </main>
  );
}
