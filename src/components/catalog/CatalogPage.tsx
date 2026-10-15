"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  CATALOG_PRODUCTS,
  getCheckoutProductId,
  type CatalogProduct,
} from "@/data/catalog";
import catalogTiles from "@/data/catalog-tiles.json";
import { SiteLink } from "@/components/site/SiteLink";
import { useCart } from "@/components/cart/useCart";
import { cartLineKey, setCartItemQuantity, type CartItem } from "@/lib/cart-store";
import { SHOP_URL } from "@/lib/site-config";
import styles from "./CatalogPage.module.css";

/** Searchable product ranges, with the current shop and cart connections. */

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

const tiles = catalogTiles as Record<string, { image: string; source: string }>;
const FEATURED_SLUGS = ["milkshake", "iced-tea", "cordial", "matcha", "raf-coffee", "chocolate"];
const featuredRank = (slug: string) => {
  const index = FEATURED_SLUGS.indexOf(slug);
  return index < 0 ? FEATURED_SLUGS.length : index;
};
const SHELF_PRODUCTS = [...CATALOG_PRODUCTS].sort((left, right) => featuredRank(left.slug) - featuredRank(right.slug));
const FORMAT_LABELS: Readonly<Record<string, string>> = {
  tea: "1 g sachets",
  "sugar-free": "1 g sachets",
  puree: "950 ml bottle",
  sauce: "1.89 L bottle",
  "colour-collection": "100 g tin",
  "add-ons": "1–5 g sticks",
  electrolyte: "Sticks, packs and bulk",
  "at-home": "150 g pouch",
};

function shelfName(product: CatalogProduct) {
  return SHELF_NAMES[product.slug] ?? product.name;
}

/**
 * Matches on everything the card shows plus the range it belongs to, so
 * "cold" finds the four cold products and "matcha" finds the one.
 */
function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function matches(product: CatalogProduct, query: string) {
  if (!query) return true;
  const haystack = `${shelfName(product)} ${product.name} ${product.slug} ${product.categoryLabel}`;
  return normalizeSearch(haystack).includes(query);
}

function ProductCard({
  product,
  weight,
  lines,
  flavors,
  eager,
}: {
  product: CatalogProduct;
  weight: string | null;
  /** This product's cart lines, one per flavour. */
  lines: readonly CartItem[];
  flavors: readonly string[];
  eager: boolean;
}) {
  /*
   * Sellable means a price and a flavour list: the checkout needs the first and
   * the factory needs the second, and an order that names a product without
   * saying which flavour is not an order anyone can fill. Either one missing
   * and the card asks for a quote instead, which is the honest control.
   */
  const sellable = Boolean(getCheckoutProductId(product.slug)) && flavors.length > 0;
  const name = shelfName(product);
  const quantity = lines.reduce((total, line) => total + line.quantity, 0);
  const tile = tiles[product.slug];
  const image = tile?.source === "illustration" ? product.image : tile?.image ?? product.image;
  const format = FORMAT_LABELS[product.slug] ?? (weight ? `${weight.replace(/(\d)(g|kg)\b/, "$1 $2")} pouch` : "Formats on request");

  return (
    <article
      className={styles.card}
      data-catalog-card
      data-product-slug={product.slug}
      data-in-cart={quantity > 0 ? "true" : undefined}
      data-catalog-price={product.price ?? "Price on request"}
    >
      <div className={styles.tile} style={{ backgroundColor: product.backgroundColor }}>
        <SiteLink
          className={styles.tileLink}
          href={product.route}
          tabIndex={-1}
          aria-hidden="true"
        >
          {image && <Image
            src={image}
            alt=""
            className={tile?.source === "illustration" ? styles.packPhoto : undefined}
            fill
            sizes="(max-width: 1023px) calc((100vw - 52px) / 2), (max-width: 1920px) 29vw, 560px"
            loading={eager ? "eager" : "lazy"}
          />}
        </SiteLink>

        {/*
         * Buying uses the configured external shop. The shelf hands the visitor over
         * rather than filling a cart here; the product's own page still carries
         * "Add to cart" for the native cart and the Stripe checkout behind it.
         *
         * A plain link, out of the app router, because it leaves the site —
         * `SiteLink` is for routes this build owns.
         */}
        {!sellable ? (
          <SiteLink className={styles.buy} href="/contacts">
            Request price
          </SiteLink>
        ) : (
          <a className={styles.buy} data-shop-link href={SHOP_URL}>
            Buy <span aria-hidden="true">↗</span>
            <span className="tbb-visually-hidden"> {name} in the shop</span>
          </a>
        )}

        {quantity > 0 && <span className={styles.inCart}>In cart</span>}
      </div>

      <div className={styles.info}>
        <h2 className={styles.name}>
          <SiteLink data-catalog-name href={product.route}>
            {name}
          </SiteLink>
        </h2>
        <SiteLink className={styles.learn} href={product.route} tabIndex={-1} aria-hidden="true">
          Learn more
        </SiteLink>
      </div>

      <p className={styles.meta}>
        {format}
      </p>

      {/*
       * What is in the cart, by flavour, with its own quantity. Wholesale
       * buyers order in multiples, and stepping a product rather than a flavour
       * would be stepping something the order does not have.
       */}
      {lines.length > 0 && (
        <ul className={styles.lines}>
          {lines.map((line) => (
            <li key={cartLineKey(line.slug, line.flavor)} className={styles.line}>
              <span className={styles.lineName}>{line.flavor}</span>
              <span
                className={styles.lineStepper}
                role="group"
                aria-label={`${name} ${line.flavor} quantity`}
              >
                <button
                  className={styles.step}
                  type="button"
                  aria-label={`Remove one ${line.flavor} ${name}`}
                  onClick={() =>
                    setCartItemQuantity(line.slug, line.flavor, line.quantity - 1)
                  }
                >
                  −
                </button>
                <span className={styles.lineQuantity} aria-live="polite">
                  {line.quantity}
                </span>
                <button
                  className={styles.step}
                  type="button"
                  aria-label={`Add one ${line.flavor} ${name}`}
                  disabled={line.quantity >= 10}
                  onClick={() =>
                    setCartItemQuantity(line.slug, line.flavor, line.quantity + 1)
                  }
                >
                  +
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function Shelf({
  products,
  weights,
  flavors,
  linesBySlug,
}: {
  products: CatalogProduct[];
  weights: Record<string, string | null>;
  flavors: Record<string, string[]>;
  linesBySlug: Record<string, CartItem[]>;
}) {
  return (
    <div className={styles.grid}>
      {products.map((product, index) => (
        <ProductCard
          key={product.slug}
          product={product}
          weight={weights[product.slug] ?? null}
          flavors={flavors[product.slug] ?? EMPTY}
          lines={linesBySlug[product.slug] ?? EMPTY_LINES}
          eager={index < 3}
        />
      ))}
    </div>
  );
}

/* Stable empties, so a card with nothing in the cart is not handed a new array
   on every render of the shelf. */
const EMPTY: readonly string[] = [];
const EMPTY_LINES: readonly CartItem[] = [];

export function CatalogPage({
  weights = {},
  flavors = {},
}: {
  weights?: Record<string, string | null>;
  flavors?: Record<string, string[]>;
}) {
  const [query, setQuery] = useState("");
  const cart = useCart();
  const linesBySlug = useMemo(() => {
    const map: Record<string, CartItem[]> = {};
    for (const item of cart.items) (map[item.slug] ??= []).push(item);
    return map;
  }, [cart.items]);
  const search = normalizeSearch(query.trim());
  const products = useMemo(() => SHELF_PRODUCTS.filter((product) => matches(product, search)), [search]);
  const lines = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="catalog-title">
        <div className={styles.introCopy}>
          <h1 id="catalog-title" className={styles.title}>Catalogue</h1>
          <p className={styles.lede}>
            {CATALOG_PRODUCTS.length} categories for caf&eacute;s, restaurants and hotels.
            <span className={styles.desktopOnly}><br />Wholesale and private label supply from Dubai.</span>
          </p>
        </div>
        <div className={styles.searchBlock}>
          <label className={styles.search}>
            <span className="tbb-visually-hidden">Search products</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input data-catalog-search type="search" value={query} placeholder="Search products" autoComplete="off" onChange={(event) => setQuery(event.currentTarget.value)} />
          </label>
          <a className={styles.orderLink} href={SHOP_URL} data-shop-link>Buying for your caf&eacute;? Order online <span aria-hidden="true">&#8599;</span></a>
        </div>
      </section>

      <section className={styles.shelf} aria-label="Products">
        <p className="tbb-visually-hidden" role="status">{search ? `${products.length} product ranges found` : ""}</p>
        {products.length === 0 ? (
          <p className={styles.empty}>Nothing matches &ldquo;{query.trim()}&rdquo;. Try a product name, or <SiteLink href="/contacts">ask us</SiteLink>.</p>
        ) : <Shelf products={products} weights={weights} flavors={flavors} linesBySlug={linesBySlug} />}
      </section>

      <section className={styles.close} aria-label="Wholesale enquiries">
        <div className={styles.closeCopy}>
          <h2 className={styles.closeTitle}>Need wholesale prices or samples?</h2>
          <p className={styles.closeText}>Send your list, we reply within one business day.</p>
        </div>
        <SiteLink className={styles.closeLink} href="/contacts">Get a quote</SiteLink>
        <a className={styles.mobileShop} href={SHOP_URL} data-shop-link>Shop <span aria-hidden="true">&#8599;</span></a>
      </section>

      {lines > 0 && (
        <div className={styles.tray} role="status">
          <span>{lines} {lines === 1 ? "item" : "items"} in cart</span>
          <SiteLink className={styles.trayLink} href="/checkout">Checkout <span aria-hidden="true">&#8594;</span></SiteLink>
        </div>
      )}
    </main>
  );
}
