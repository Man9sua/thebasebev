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
const CATALOG_NAMES: Partial<Record<string, string>> = {
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

  const name = CATALOG_NAMES[product.slug] ?? product.name;

  return (
    <article className={styles.card} data-catalog-card data-product-slug={product.slug}>
      <SiteLink className={styles.imageLink} href={product.route}>
        <Image
          className={styles.image}
          src={tiles[product.slug]?.image ?? product.image ?? `/images/pack-${product.slug}.webp`}
          alt={`${product.name} beverage base by THE BASE`}
          fill
          sizes="(max-width: 719px) 92vw, (max-width: 1099px) 46vw, 31vw"
          loading={eager ? "eager" : "lazy"}
        />
      </SiteLink>

      <div className={styles.titleRow}>
        <SiteLink className={styles.name} data-catalog-name href={product.route}>
          {name}
        </SiteLink>
        <span className={styles.price} data-catalog-price>
          {product.price ?? "Price on request"}
        </span>
      </div>
      <p className={styles.description}>{product.description}</p>
      <p className={styles.category}>{product.categoryLabel}</p>

      {checkoutId ? (
        <button
          className={styles.action}
          data-cart-add
          type="button"
          onClick={() => {
            addCartItem(product.slug);
            setAdded(true);
          }}
        >
          {added ? "Added" : "Add to cart"}
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
        <p className={styles.eyebrow}>Catalogue</p>
        <h1 id="catalog-title" className={styles.title}>
          Beverage Base Premixes — Wholesale Catalogue
        </h1>
        <p className={styles.lede}>
          Dry premixes for cafes, restaurants and hotels. Bulk and private label supply
          across the UAE and worldwide.
        </p>

        <div className={styles.filters} data-catalog-filters aria-label="Filter catalogue">
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
      </section>

      <section className={styles.grid} aria-live="polite" aria-label="Catalogue products">
        {products.map((product, index) => (
          <ProductCard key={product.slug} product={product} eager={index < 3} />
        ))}
      </section>
    </main>
  );
}
