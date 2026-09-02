"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  CATALOG_GROUPS,
  CATALOG_PRODUCTS,
  getCheckoutProductId,
  type CatalogGroupId,
  type CatalogProduct,
} from "@/data/catalog";
import { SiteLink } from "@/components/site/SiteLink";
import catalogTiles from "@/data/catalog-tiles.json";
import { addCartItem } from "@/lib/cart-store";
import styles from "./CatalogPage.module.css";

type Filter = "all" | CatalogGroupId;

const tiles = catalogTiles as Record<string, { image: string }>;

/*
 * Four products are listed under a longer name than the shelf needs. The name
 * on the page is the shelf's, not the registry's; the registry keeps the full
 * one because the product page and the structured data both use it.
 */
const SHELF_NAMES: Partial<Record<string, string>> = {
  jam: "Jam",
  garnish: "Garnish",
  topping: "Topping",
  "sugar-syrup": "Syrup",
};

function ProductCard({ product, eager }: { product: CatalogProduct; eager: boolean }) {
  const [added, setAdded] = useState(false);
  const checkoutId = getCheckoutProductId(product.slug);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1400);
    return () => window.clearTimeout(timer);
  }, [added]);

  const name = SHELF_NAMES[product.slug] ?? product.name;

  return (
    <article className={styles.card} data-catalog-card data-product-slug={product.slug}>
      <div className={styles.frame}>
        <SiteLink className={styles.imageLink} href={product.route} tabIndex={-1} aria-hidden>
          <Image
            className={styles.image}
            src={tiles[product.slug]?.image ?? product.image ?? `/images/pack-${product.slug}.webp`}
            alt=""
            fill
            sizes="(max-width: 639px) 46vw, (max-width: 1099px) 31vw, 23vw"
            loading={eager ? "eager" : "lazy"}
          />
        </SiteLink>
        {/* On the tile rather than under the copy: it costs the card no row and
            the grid reads as sorted at a glance. */}
        <span className={styles.tag}>{product.categoryLabel}</span>
      </div>

      <div className={styles.titleRow}>
        <h3 className={styles.heading}>
          <SiteLink className={styles.name} data-catalog-name href={product.route}>
            {name}
          </SiteLink>
        </h3>
        <span className={styles.price} data-catalog-price>
          {product.price ?? "Price on request"}
        </span>
      </div>

      <p className={styles.description}>{product.description}</p>

      {checkoutId ? (
        <button
          className={styles.action}
          data-cart-add
          data-added={added ? "true" : undefined}
          type="button"
          onClick={() => {
            addCartItem(product.slug);
            setAdded(true);
          }}
        >
          {added ? "Added to cart" : "Add to cart"}
        </button>
      ) : (
        <SiteLink className={styles.action} data-cart-add href="/contacts">
          Request price
        </SiteLink>
      )}
    </article>
  );
}

export function CatalogPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const products = useMemo(
    () =>
      filter === "all"
        ? CATALOG_PRODUCTS
        : CATALOG_PRODUCTS.filter((product) => product.categoryId === filter),
    [filter],
  );

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="catalog-title">
        <div className={styles.introText}>
          <h1 id="catalog-title" className={styles.title}>
            Shop
          </h1>
          {/*
            Production's own h1 for this route, a level down — the wording the
            page ranks on, kept on the page rather than dropped when the shelf
            took its own name. `audit:seo-parity` checks it is still here.
          */}
          <h2 className={styles.headline}>Beverage Base Premixes — Wholesale Catalogue</h2>
        </div>
        <p className={styles.lede}>
          Dry premixes for cafes, restaurants and hotels. Bulk and private label supply
          across the UAE and worldwide.
        </p>
      </section>

      {/*
        Sticky: sixteen products are four screens of scrolling, and a filter row
        that scrolls away with the heading is a filter row nobody uses twice.
      */}
      <div className={styles.bar}>
        <div className={styles.barInner}>
          <div className={styles.filters} data-catalog-filters aria-label="Filter the shop">
            <button
              type="button"
              className={filter === "all" ? styles.filterActive : styles.filter}
              aria-pressed={filter === "all"}
              data-f="All"
              onClick={() => setFilter("all")}
            >
              All <span>{CATALOG_PRODUCTS.length}</span>
            </button>
            {CATALOG_GROUPS.map((group) => (
              <button
                key={group.id}
                type="button"
                className={filter === group.id ? styles.filterActive : styles.filter}
                aria-pressed={filter === group.id}
                data-f={group.label}
                onClick={() => setFilter(group.id)}
              >
                {group.label} <span>{group.slugs.length}</span>
              </button>
            ))}
          </div>
          <p className={styles.count} aria-live="polite">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>
      </div>

      <section className={styles.grid} aria-label="Products">
        {products.map((product, index) => (
          <ProductCard key={product.slug} product={product} eager={index < 4} />
        ))}
      </section>
    </main>
  );
}
