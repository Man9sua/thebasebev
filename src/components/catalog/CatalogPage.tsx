"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  CATALOG_GROUPS,
  CATALOG_PRODUCTS,
  getCheckoutProductId,
  type CatalogGroupId,
  type CatalogProduct,
} from "@/data/catalog";
import { FlavorPicker } from "@/components/cart/FlavorPicker";
import { ProductTileArt } from "@/components/product/ProductTileArt";
import { SiteLink } from "@/components/site/SiteLink";
import { SortMenu } from "./SortMenu";
import { useCart } from "@/components/cart/useCart";
import { cartLineKey, setCartItemQuantity, type CartItem } from "@/lib/cart-store";
import styles from "./CatalogPage.module.css";

type Filter = "all" | CatalogGroupId;
type Sort = "featured" | "price-asc" | "price-desc" | "name";

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

const SORTS: readonly { id: Sort; label: string }[] = [
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

function sortProducts(
  products: CatalogProduct[],
  sort: Sort,
): CatalogProduct[] {
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
    if (left === null || right === null)
      return left === right ? 0 : left === null ? 1 : -1;
    return sort === "price-asc" ? left - right : right - left;
  });
  return sorted;
}

function ProductCard({
  product,
  weight,
  lines,
  flavors,
  onPick,
  eager,
}: {
  product: CatalogProduct;
  weight: string | null;
  /** This product's cart lines, one per flavour. */
  lines: readonly CartItem[];
  flavors: readonly string[];
  onPick: (product: CatalogProduct) => void;
  eager: boolean;
}) {
  /*
   * Sellable means a price and a flavour list: the checkout needs the first and
   * the factory needs the second, and an order that names a product without
   * saying which flavour is not an order anyone can fill. Either one missing
   * and the card asks for a quote instead, which is the honest control.
   */
  const sellable = Boolean(getCheckoutProductId(product.slug)) && flavors.length > 0;
  const name = SHELF_NAMES[product.slug] ?? product.name;
  const quantity = lines.reduce((total, line) => total + line.quantity, 0);

  return (
    <article
      className={styles.card}
      data-catalog-card
      data-product-slug={product.slug}
      data-in-cart={quantity > 0 ? "true" : undefined}
    >
      {/*
       * The whole tile is the link and the name is printed inside it, which is
       * how the design draws the card. One anchor per card rather than the
       * hidden-image-plus-name pair this used to carry: the name is the only
       * text in the frame, so the anchor announces itself correctly without a
       * second route to the same page.
       */}
      <h3 className={styles.heading}>
        <SiteLink
          className={styles.tileLink}
          data-catalog-name
          href={product.route}
        >
          <ProductTileArt
            slug={product.slug}
            name={name}
            sizes="(max-width: 639px) 46vw, (max-width: 1099px) 31vw, 23vw"
            priority={eager}
          />
        </SiteLink>
      </h3>
      {quantity > 0 && <span className={styles.inCart}>In cart</span>}

      <p className={styles.priceRow}>
        <span className={styles.price} data-catalog-price>
          {product.price ?? "Price on request"}
        </span>
      </p>

      <p className={styles.meta}>{weight ? `${weight} pouch` : ""}</p>
      <p className={styles.description}>{product.description}</p>

      {/*
       * The foot of the card, held to the bottom so the buttons stay level
       * across a row however long the copy above them runs — and however many
       * flavours of this one are in the cart.
       */}
      <div className={styles.foot}>
        {/*
         * What is in the cart, by flavour, with its own quantity. Wholesale
         * buyers order in multiples, and stepping a product rather than a
         * flavour would be stepping something the order does not have.
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

        {/*
         * Adding is two steps now, because the flavour is part of the order:
         * this opens the picker and the picker puts the line in the cart. Same
         * label whether or not something is already in it — it does the same
         * thing either way, and what is in the cart is listed above it —
         * and `data-cart-add` either way, which is what the smoke and the
         * commerce audit press.
         */}
        {!sellable ? (
          <SiteLink className={styles.action} data-cart-add href="/contacts">
            Request price
          </SiteLink>
        ) : (
          <button
            className={styles.action}
            data-cart-add
            type="button"
            aria-haspopup="dialog"
            onClick={() => onPick(product)}
          >
            Add to cart
          </button>
        )}
      </div>
    </article>
  );
}

function Shelf({
  products,
  weights,
  flavors,
  linesBySlug,
  onPick,
  offset,
}: {
  products: CatalogProduct[];
  weights: Record<string, string | null>;
  flavors: Record<string, string[]>;
  linesBySlug: Record<string, CartItem[]>;
  onPick: (product: CatalogProduct) => void;
  offset: number;
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
          onPick={onPick}
          eager={offset + index < 4}
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
  /** Per product, the flavours its own page lists — see `catalogFlavors`. */
  flavors?: Record<string, string[]>;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("featured");
  /*
   * One picker for the whole shelf rather than one per card: it is a modal over
   * the page, and sixteen of them waiting in the markup would be sixteen
   * dialogs for a screen reader to walk past.
   */
  const [picking, setPicking] = useState<CatalogProduct | null>(null);
  const closePicker = useCallback(() => setPicking(null), []);
  const cart = useCart();
  const shelfRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  /*
   * The rule under the live filter, measured rather than drawn on the button
   * itself: a border on each button can only appear and disappear, and what the
   * row wants is for the mark to travel to the label that was just picked.
   *
   * Laid out before paint so it is never seen in the wrong place, and re-read on
   * resize because the labels reflow. The row scrolls sideways on a phone and
   * the rule scrolls with it, which is why the offsets are the button's own
   * inside the row rather than anything read off the viewport.
   */
  const [rule, setRule] = useState<{ x: number; w: number } | null>(null);
  const measureRule = useCallback(() => {
    const live = filtersRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (live) setRule({ x: live.offsetLeft, w: live.offsetWidth });
  }, []);

  useLayoutEffect(measureRule, [measureRule, filter]);

  useEffect(() => {
    const row = filtersRef.current;
    if (!row || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measureRule);
    observer.observe(row);
    return () => observer.disconnect();
  }, [measureRule]);

  /*
   * Sorting and filtering both re-lay the whole shelf, and sorting collapses
   * the four range headings as well — so the page shortens under whoever asked
   * for it, and from halfway down the only visible effect is that the tiles
   * under the cursor are suddenly different ones. Anyone who has scrolled past
   * the top of the shelf is taken back to it, which is where the answer to
   * "sort by price" actually is. Nobody already at the top is moved.
   */
  const reshelve = useCallback((change: () => void) => {
    change();
    const shelf = shelfRef.current;
    if (!shelf || shelf.getBoundingClientRect().top >= 0) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    shelf.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  /* The cart, grouped the way a card reads it: this product's flavours, in the
     order they were added. */
  const linesBySlug = useMemo(() => {
    const map: Record<string, CartItem[]> = {};
    for (const item of cart.items) (map[item.slug] ??= []).push(item);
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
          <h2 className={styles.headline}>
            Beverage Base Premixes — Wholesale Catalogue
          </h2>
        </div>

        <div className={styles.introSide}>
          <p className={styles.lede}>
            Dry premixes for cafes, restaurants and hotels. Bulk and private
            label supply across the UAE and worldwide.
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
          <div
            className={styles.filters}
            data-catalog-filters
            aria-label="Filter the shop"
            ref={filtersRef}
          >
            <button
              type="button"
              className={filter === "all" ? styles.filterActive : styles.filter}
              aria-pressed={filter === "all"}
              data-f="All"
              onClick={() => reshelve(() => setFilter("all"))}
            >
              All <span>{CATALOG_PRODUCTS.length}</span>
            </button>
            {CATALOG_GROUPS.map((group) => (
              <button
                key={group.id}
                type="button"
                className={
                  filter === group.id ? styles.filterActive : styles.filter
                }
                aria-pressed={filter === group.id}
                data-f={group.label}
                onClick={() => reshelve(() => setFilter(group.id))}
              >
                {group.label} <span>{group.slugs.length}</span>
              </button>
            ))}
            {rule && (
              <span
                className={styles.rule}
                aria-hidden="true"
                style={{
                  ["--rule-x" as string]: `${rule.x}px`,
                  ["--rule-w" as string]: `${rule.w}px`,
                }}
              />
            )}
          </div>

          <SortMenu
            label="Sort"
            value={sort}
            options={SORTS}
            onChange={(next) => reshelve(() => setSort(next))}
          />
        </div>
      </div>

      <div className={styles.shelf} ref={shelfRef}>
        {grouped ? (
          CATALOG_GROUPS.map((group, groupIndex) => {
            const inGroup = products.filter(
              (product) => product.categoryId === group.id,
            );
            return (
              <section
                key={group.id}
                className={styles.range}
                aria-label={group.label}
              >
                <header className={styles.rangeHead}>
                  <h2 className={styles.rangeName}>{group.label}</h2>
                  <span className={styles.rangeCount}>{inGroup.length}</span>
                </header>
                <Shelf
                  products={inGroup}
                  weights={weights}
                  flavors={flavors}
                  linesBySlug={linesBySlug}
                  onPick={setPicking}
                  offset={groupIndex === 0 ? 0 : 4}
                />
              </section>
            );
          })
        ) : (
          <section className={styles.range} aria-label="Products">
            <Shelf
              products={products}
              weights={weights}
              flavors={flavors}
              linesBySlug={linesBySlug}
              onPick={setPicking}
              offset={0}
            />
          </section>
        )}
      </div>

      <section className={styles.close}>
        <p className={styles.closeText}>
          Ordering for a chain, or putting your own name on the pouch? We quote
          bulk volumes and private label runs directly.
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

      {picking && (
        <FlavorPicker
          slug={picking.slug}
          name={SHELF_NAMES[picking.slug] ?? picking.name}
          price={picking.price}
          weight={weights[picking.slug] ?? null}
          flavors={flavors[picking.slug] ?? EMPTY}
          lines={linesBySlug[picking.slug] ?? EMPTY_LINES}
          onClose={closePicker}
        />
      )}
    </main>
  );
}
