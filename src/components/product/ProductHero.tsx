import Link from "next/link";
import type { Product } from "@/data/products";
import { productDetails } from "@/lib/site-pages";
import styles from "./ProductHero.module.css";

/**
 * The top of a product page.
 *
 * It replaces the exported hero, which was a Tilda "zero block" — every line an
 * absolutely positioned element whose coordinates are written by a script that
 * does not finish here. The block held its full 949px and painted nothing, so
 * every product page opened with a blank coloured rectangle and the visitor
 * never saw the name, the price or a way to order. `site-pages.ts` drops that
 * block; this renders the same copy as ordinary markup.
 *
 * The copy is the page's own, lifted out of the export by
 * `scripts/build-product-details.mjs` rather than rewritten — these pages carry
 * two years of ranking and the wording is what they rank on. The `h1` in
 * particular is reproduced verbatim, because `audit:seo-parity` compares it
 * against the live site character for character.
 *
 * Both buttons point into the shared lead forms that the export still provides
 * from the retained shell records, so ordering works exactly as it did.
 */

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProductHero({ product }: { product: Product }) {
  const detail = productDetails[product.slug];
  // The registry's description is the fallback for the three pages whose own
  // copy does not open by naming the product, which is how the extractor
  // recognises it.
  const paragraphs = detail?.description.length ? detail.description : [product.description];
  // The normalised cut-out rather than the composed marketing tile: the tile
  // is a square of solid colour and would sit on this wash as a rectangle,
  // where the cut-out stands on it. Same artwork either way — see
  // `scripts/build-pack-shots.mjs`.
  const pack = `/images/pack-${product.slug}.webp`;

  return (
    <section
      className={styles.hero}
      style={{ ["--tile" as string]: product.backgroundColor }}
      aria-labelledby="product-title"
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.breadcrumb}>
            <Link href="/catalog">Catalog</Link>
            <span aria-hidden="true">/</span>
            <span>{product.name}</span>
          </p>

          <h1 id="product-title" className={styles.title}>
            {detail?.h1 ?? product.headline}
          </h1>

          {detail?.tagline && (
            <p className={styles.tagline}>
              {detail.tagline}
              {detail.weight && <span className={styles.weight}>{detail.weight}</span>}
            </p>
          )}

          <div className={styles.body}>
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}
          </div>

          <p className={styles.price}>
            {product.price ? (
              <>
                <span className="tbb-label">From</span>
                <span className={styles.priceValue}>{product.price}</span>
              </>
            ) : (
              <span className={styles.priceValue}>Price on request</span>
            )}
          </p>

          <div className={styles.actions}>
            <a href="#order" className={styles.primary}>
              Place order
              <Arrow />
            </a>
            <a href="#sample" className={styles.secondary}>
              Request a sample
            </a>
          </div>

          {detail?.features.length ? (
            <dl className={styles.features}>
              {detail.features.map((feature) => (
                <div key={feature.label} className={styles.feature}>
                  <dt className={styles.featureLabel}>{feature.label}</dt>
                  <dd className={styles.featureValue}>{feature.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className={styles.stage}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.pack}
            src={pack}
            alt={`${product.name} base by THE BASE, ${detail?.weight ?? "500g"} pouch`}
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
}
