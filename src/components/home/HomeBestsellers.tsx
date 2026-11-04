"use client";

import { useCallback, useMemo, useState } from "react";
import { useCart, useSampleCart } from "@/components/cart/useCart";
import { ShopPackImage } from "@/components/shop/ShopPackImage";
import { FlavourPicker, ShopScope, unitLabel, type ShopKind } from "@/components/shop/ShopPage";
import { SiteLink } from "@/components/site/SiteLink";
import { useCountryCode } from "@/components/site/useCountryCode";
import { BESTSELLER_SLUGS } from "@/data/products";
import { SHOP_PRODUCTS, getShopProduct, shopKindForCountry, type ShopProduct } from "@/data/shop";
import { combineShopBaskets } from "@/lib/shop-basket";
import styles from "./HomeBestsellers.module.css";

const PRODUCTS = BESTSELLER_SLUGS.map((slug) => getShopProduct(slug)).filter(
  (product): product is ShopProduct => Boolean(product),
);

/**
 * The homepage bestsellers, to the owner's reference: six shop cards in a
 * grid, each with its price and an "Add" that opens the shop's own flavour
 * picker, so a café can fill its cart (or, outside the UAE, its sample box)
 * without leaving the homepage. It replaced the five-slide bestseller
 * carousel.
 */
export function HomeBestsellers() {
  const country = useCountryCode();
  const kind = shopKindForCountry(country);
  const cart = useCart();
  const sampleCart = useSampleCart();
  const [pickerKind, setPickerKind] = useState<ShopKind>("products");
  const [picking, setPicking] = useState<ShopProduct | null>(null);
  const close = useCallback(() => setPicking(null), []);

  const basket = useMemo(() => combineShopBaskets(country, cart.items, sampleCart.items), [country, cart.items, sampleCart.items]);
  const counts = useMemo(() => {
    const bySlug = new Map<string, number>();
    for (const item of basket) bySlug.set(item.slug, (bySlug.get(item.slug) ?? 0) + item.quantity);
    return bySlug;
  }, [basket]);
  const pickerCart = country !== "AE" || pickerKind === "samples" ? sampleCart : cart;

  return (
    <section id="bestsellers" className={styles.section} aria-labelledby="bestsellers-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <h2 id="bestsellers-title" className={styles.title}>
            Bestsellers
          </h2>
          <SiteLink href="/catalog" className={styles.all}>
            All {SHOP_PRODUCTS.length} categories
          </SiteLink>
        </div>

        <div className={styles.grid}>
          {PRODUCTS.map((product) => {
            const count = counts.get(product.slug) ?? 0;
            return (
              <article key={product.slug} className={styles.card} data-bestseller={product.slug}>
                <SiteLink
                  href={product.route}
                  className={styles.tile}
                  style={{ backgroundColor: product.backgroundColor }}
                  aria-label={`View ${product.name}`}
                  tabIndex={-1}
                >
                  <ShopPackImage product={product} sizes="(max-width: 719px) 46vw, (max-width: 1100px) 30vw, 300px" />
                </SiteLink>
                <div className={styles.copy}>
                  <h3 className={styles.name}>
                    <SiteLink href={product.route}>{product.name}</SiteLink>
                  </h3>
                  <span className={styles.meta}>
                    {product.format.replace(/ pouch$/, "")} · {product.flavors.length} flavours
                  </span>
                </div>
                <div className={styles.foot}>
                  <span className={styles.price}>{unitLabel(product, kind)}</span>
                  <button
                    type="button"
                    className={count > 0 ? styles.addOn : styles.add}
                    aria-haspopup="dialog"
                    disabled={!cart.ready || !sampleCart.ready}
                    aria-label={count > 0 ? `${product.name}: ${count} added, edit` : `Add ${product.name}`}
                    onClick={() => {
                      setPickerKind(kind);
                      setPicking(product);
                    }}
                  >
                    {count > 0 ? `Added · ${count}` : "Add"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {picking && (
        <ShopScope>
          <FlavourPicker
            product={picking}
            kind={country === "AE" ? pickerKind : "samples"}
            items={pickerCart.items}
            totalLines={basket.length}
            allowSamples={country === "AE"}
            onKindChange={setPickerKind}
            onClose={close}
          />
        </ShopScope>
      )}
    </section>
  );
}
