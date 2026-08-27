"use client";

import { useMemo, useRef, useState } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import { PRODUCTS } from "@/data/products";
import { resizedImage } from "@/lib/images";
import { SITE_NAV } from "@/lib/site-config";
import { useOverlay } from "./useOverlay";
import styles from "./Overlay.module.css";

/**
 * Site search.
 *
 * Real, working search over what the site actually has — the product registry
 * and the top-level pages — rather than a decorative field. It is client-side
 * because the corpus is small and fixed; nothing is fetched, so results are
 * instant and there is no empty loading state to design around.
 */

type Hit = {
  href: string;
  name: string;
  kind: string;
  image: string | null;
  color?: string;
};

const PAGE_HITS: Hit[] = SITE_NAV.map((item) => ({
  href: item.href,
  name: item.label,
  kind: "Page",
  image: null,
}));

/**
 * The swatch is 44px square and it was painting the product's full pack plate
 * into it — six of them at around 1.1 MB each, fetched on every page of the
 * site because this overlay is mounted everywhere. That was 6.8 MB of the
 * 14.7 MB a product page weighed, and none of it was even on screen.
 */
const PRODUCT_HITS: Hit[] = PRODUCTS.map((product) => ({
  href: product.route,
  name: product.name,
  kind: "Product",
  image: resizedImage(product.image),
  color: product.backgroundColor,
}));

function score(hit: Hit, query: string, haystack: string): number {
  const name = hit.name.toLowerCase();
  if (name === query) return 0;
  if (name.startsWith(query)) return 1;
  if (name.includes(query)) return 2;
  return haystack.includes(query) ? 3 : Number.POSITIVE_INFINITY;
}

export function SiteSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  useOverlay(open, onClose, panelRef, inputRef);

  const corpus = useMemo(
    () =>
      [...PRODUCT_HITS, ...PAGE_HITS].map((hit) => {
        const product = PRODUCTS.find((item) => item.route === hit.href);
        return {
          hit,
          haystack: [hit.name, hit.kind, product?.headline, product?.description]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
        };
      }),
    [],
  );

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return PRODUCT_HITS.slice(0, 6);

    return corpus
      .map((entry) => ({ ...entry, rank: score(entry.hit, normalized, entry.haystack) }))
      .filter((entry) => Number.isFinite(entry.rank))
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 12)
      .map((entry) => entry.hit);
  }, [corpus, query]);

  const close = () => {
    setQuery("");
    onClose();
  };

  return (
    <div
      ref={panelRef}
      className={`${styles.root} ${open ? styles.open : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      aria-hidden={!open}
      tabIndex={-1}
      inert={!open}
    >
      <div className={styles.body}>
        <div
          className={`${styles.searchField} ${styles.item}`}
          style={{ transitionDelay: open ? "120ms" : "0ms" }}
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" aria-hidden="true">
            <circle cx="11" cy="11" r="6" />
            <path d="m15.5 15.5 4 4" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            className={styles.searchInput}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the site"
            aria-label="Search the site"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <span className="tbb-label" style={{ marginTop: "1.5rem", display: "block" }}>
          {query.trim() ? `${results.length} results` : "Popular"}
        </span>

        {results.length > 0 ? (
          <div className={styles.results} data-native-scroll>
            {results.map((hit, index) => (
              <span
                key={hit.href + hit.kind}
                className={styles.item}
                style={{ transitionDelay: open ? `${200 + index * 35}ms` : "0ms" }}
              >
                <SiteLink href={hit.href} className={styles.result} onClick={close}>
                  <span
                    className={styles.swatch}
                    style={{
                      backgroundColor: hit.color ?? "var(--tbb-sand)",
                      backgroundImage: hit.image ? `url(${hit.image})` : undefined,
                    }}
                  />
                  <span>
                    <span className={styles.resultName}>{hit.name}</span>
                    <span className={styles.resultKind}>{hit.kind}</span>
                  </span>
                </SiteLink>
              </span>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>
            Nothing matches “{query.trim()}”. Try a product name, or{" "}
            <SiteLink href="/contacts" onClick={close}>
              contact us
            </SiteLink>
            .
          </p>
        )}
      </div>
    </div>
  );
}
