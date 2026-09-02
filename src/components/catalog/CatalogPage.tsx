"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  CATALOG_GROUPS,
  CATALOG_PRODUCTS,
  getCheckoutProductId,
  type CatalogGroupId,
  type CatalogProduct,
} from "@/data/catalog";
import { SiteLink } from "@/components/site/SiteLink";
import { useCart } from "@/components/cart/useCart";
import catalogTiles from "@/data/catalog-tiles.json";
import { addCartItem, setCartItemQuantity } from "@/lib/cart-store";
import styles from "./CatalogPage.module.css";

type Filter = "all" | CatalogGroupId;
type Sort = "featured" | "price-asc" | "price-desc" | "name";

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

const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
  { id: "name", label: "Name, A to Z" },
];

/** The figure in "45.38 AED", or null on the five sold by quotation. */
function amount(product: CatalogProduct): number | null {
  const value = Number.parseFloat(product.price ?? "");
  return Number.isFinite(value) ? value : null;
}

function sortProducts(products: CatalogProduct[], sort: Sort): CatalogProduct[] {
  if (sort === "featured") return products;
  const sorted = [...products];
  if (sort === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }
  // Quoted products carry no figure to sort by, so they hold the end of the
  // shelf either way rather than sorting as zero and leading it.
  sorted.sort((a, b) => {
    const left = amount(a);
    const right = amount(b);
    if (left === null || right === null) return left === right ? 0 : left === null ? 1 : -1;
    return sort === "price-asc" ? left - right : right - left;
  });
  return sorted;
}

function ProductCard({
  product,
  weight,
  quantity,
  eager,
}: {
  product: CatalogProduct;
  weight: string | null;
  quantity: number;
  eager: boolean;
}) {
  const sellable = Boolean(getCheckoutProductId(product.slug));
  const name = SHELF_NAMES[product.slug] ?? product.name;

  return (
    <article
      className={styles.card}
      data-catalog-card
      data-product-slug={product.slug}
      data-in-cart={quantity > 0 ? "true" : undefined}
    >
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
        {quantity > 0 && <span className={styles.inCart}>In cart</span>}
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

      <p className={styles.meta}>{weight ? `${weight} pouch` : ""}</p>
      <p className={styles.description}>{product.description}</p>

      {/*
       * Wholesale buyers order in multiples, so once a product is in the cart
       * the button becomes the quantity rather than staying a button that has
       * already been pressed. `data-cart-add` stays on the first press, which
       * is what the smoke and the commerce audit reach for.
       */}
      {!sellable ? (
        <SiteLink className={styles.action} data-cart-add href="/contacts">
          Request price
        </SiteLink>
      ) : quantity === 0 ? (
        <button
          className={styles.action}
          data-cart-add
          type="button"
          onClick={() => addCartItem(product.slug)}
        >
          Add to cart
        </button>
      ) : (
        <div className={styles.stepper} role="group" aria-label={`${name} quantity`}>
          <button
            className={styles.step}
            type="button"
            aria-label={`Remove one ${name}`}
            onClick={() => setCartItemQuantity(product.slug, quantity - 1)}
          >
            −
          </button>
          <span className={styles.quantity} aria-live="polite">
            {quantity} in cart
          </span>
          <button
            className={styles.step}
            type="button"
            aria-label={`Add one ${name}`}
            disabled={quantity >= 10}
            onClick={() => addCartItem(product.slug)}
          >
            +
          </button>
        </div>
      )}
    </article>
  );
}

function Shelf({
  products,
  weights,
  quantities,
  offset,
}: {
  products: CatalogProduct[];
  weights: Record<string, string | null>;
  quantities: Record<string, number>;
  offset: number;
}) {
  return (
    <div className={styles.grid}>
      {products.map((product, index) => (
        <ProductCard
          key={product.slug}
          product={product}
          weight={weights[product.slug] ?? null}
          quantity={quantities[product.slug] ?? 0}
          eager={offset + index < 4}
        />
      ))}
    </div>
  );
}

export function CatalogPage({ weights = {} }: { weights?: Record<string, string | null> }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("featured");
  const cart = useCart();

  const quantities = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of cart.items) map[item.slug] = item.quantity;
    return map;
  }, [cart.items]);

  const products = useMemo(() => {
    const picked =
      filter === "all"
        ? CATALOG_PRODUCTS
        : CATALOG_PRODUCTS.filter((product) => product.categoryId === filter);
    return sortProducts(picked, sort);
  }, [filter, sort]);

  /*
   * The whole range is four ranges, and a flat run of sixteen tiles says so
   * nowhere. Left alone it is laid out under its own headings, which is both
   * the structure and a second way to read what is on offer. Sorting is a
   * question about the whole shelf, so it collapses the sections — as does
   * filtering, where the one heading left would only repeat the filter.
   */
  const grouped = filter === "all" && sort === "featured";
  const lines = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="catalog-title">
        <div>
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

        <div className={styles.introSide}>
          <p className={styles.lede}>
            Dry premixes for cafes, restaurants and hotels. Bulk and private label supply
            across the UAE and worldwide.
          </p>
          <dl className={styles.facts}>
            <div>
              <dt>Products</dt>
              <dd>{CATALOG_PRODUCTS.length}</dd>
            </div>
            <div>
              <dt>Ranges</dt>
              <dd>{CATALOG_GROUPS.length}</dd>
            </div>
            <div>
              <dt>Made in</dt>
              <dd>Dubai</dd>
            </div>
          </dl>
        </div>
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

          <label className={styles.sort}>
            <span>Sort</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
              {SORTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {grouped ? (
        CATALOG_GROUPS.map((group, groupIndex) => {
          const inGroup = products.filter((product) => product.categoryId === group.id);
          return (
            <section key={group.id} className={styles.range} aria-label={group.label}>
              <header className={styles.rangeHead}>
                <h2 className={styles.rangeName}>{group.label}</h2>
                <span className={styles.rangeCount}>{inGroup.length}</span>
              </header>
              <Shelf
                products={inGroup}
                weights={weights}
                quantities={quantities}
                offset={groupIndex === 0 ? 0 : 4}
              />
            </section>
          );
        })
      ) : (
        <section className={styles.range} aria-label="Products">
          <Shelf products={products} weights={weights} quantities={quantities} offset={0} />
        </section>
      )}

      <section className={styles.close}>
        <p className={styles.closeText}>
          Ordering for a chain, or putting your own name on the pouch? We quote bulk
          volumes and private label runs directly.
        </p>
        <SiteLink className={styles.closeLink} href="/contacts">
          Request a price list <span aria-hidden="true">→</span>
        </SiteLink>
      </section>

      {/* Only once something is in it: a running total is reassurance while the
          shelf is long, and noise before anything has been chosen. */}
      {lines > 0 && (
        <div className={styles.tray} role="status">
          <span>
            {lines} {lines === 1 ? "item" : "items"} in cart
          </span>
          <SiteLink className={styles.trayLink} href="/checkout">
            Checkout <span aria-hidden="true">→</span>
          </SiteLink>
        </div>
      )}
    </main>
  );
}
