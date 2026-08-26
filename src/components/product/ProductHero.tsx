import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import type { Product } from "@/data/products";
import productHeroes from "@/data/product-heroes.json";
import { isDark } from "@/lib/contrast";
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
 * The picture is the client's own key visual for the product, cut down to the
 * part of it that carries no type — see `scripts/build-product-heroes.mjs`. The
 * band behind the copy is the colour sampled from the banner at the cut, so the
 * two are one surface rather than a photograph pasted onto a page. Eleven
 * products have a banner; the rest fall back to the pack shot on a wash of
 * their own colour.
 *
 * The copy is the page's own, lifted out of the export by
 * `scripts/build-product-details.mjs` rather than rewritten — these pages carry
 * two years of ranking and the wording is what they rank on. The `h1` in
 * particular is reproduced verbatim, because `audit:seo-parity` compares it
 * against the live site character for character.
 */

const heroes = productHeroes as Record<string, { image: string; band: string }>;

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProductHero({ product }: { product: Product }) {
  const detail = productDetails[product.slug];
  const banner = heroes[product.slug];
  // The registry's description is the fallback for the three pages whose own
  // copy does not open by naming the product, which is how the extractor
  // recognises it.
  const paragraphs = detail?.description.length ? detail.description : [product.description];

  // A banner sets the band; without one the page mixes the product colour down
  // to a wash, which is always light. Ink is measured either way rather than
  // assumed — Tea's band is near-black and Jam's is burgundy.
  const band = banner?.band;
  const onDark = band ? isDark(band) : false;

  return (
    <section
      className={`${styles.hero} ${onDark ? styles.onDark : ""}`}
      style={{
        ["--tile" as string]: product.backgroundColor,
        ...(band ? { ["--band" as string]: band } : {}),
      }}
      aria-labelledby="product-title"
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          <Reveal as="p" className={styles.breadcrumb} distance={12}>
            <Link href="/catalog">Catalog</Link>
            <span aria-hidden="true">/</span>
            <span>{product.name}</span>
          </Reveal>

          <Reveal delay={60} distance={20}>
            <h1 id="product-title" className={styles.title}>
              {detail?.h1 ?? product.headline}
            </h1>
          </Reveal>

          {detail?.tagline && (
            <Reveal as="p" className={styles.tagline} delay={120} distance={16}>
              {detail.tagline}
              {detail.weight && <span className={styles.weight}>{detail.weight}</span>}
            </Reveal>
          )}

          <Reveal className={styles.body} delay={170} distance={16}>
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal className={styles.buy} delay={230} distance={16}>
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

            {/*
              Both hrefs are popup hooks the export still owns — `#form` is the
              partner enquiry, `#sample` the free-sample form — and they are the
              two the original buttons pointed at. The first was `#order` here,
              which no page has a hook for, so the page's primary call to action
              did nothing at all.
            */}
            <div className={styles.actions}>
              <a href="#form" className={styles.primary}>
                Place order
                <Arrow />
              </a>
              <a href="#sample" className={styles.secondary}>
                Request a sample
              </a>
            </div>
          </Reveal>

          {detail?.features.length ? (
            <Reveal as="dl" className={styles.features} delay={290} distance={16}>
              {detail.features.map((feature) => (
                <div key={feature.label} className={styles.feature}>
                  <dt className={styles.featureLabel}>{feature.label}</dt>
                  <dd className={styles.featureValue}>{feature.value}</dd>
                </div>
              ))}
            </Reveal>
          ) : null}
        </div>
      </div>

      <div className={styles.media} aria-hidden={banner ? "true" : undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={banner ? styles.banner : styles.pack}
          src={banner?.image ?? `/images/pack-${product.slug}.webp`}
          // The banner is decoration beside copy that already says all of this;
          // the pack shot on its own is the product, so it is described.
          alt={banner ? "" : `${product.name} base by THE BASE, ${detail?.weight ?? "500g"} pouch`}
          fetchPriority="high"
        />
      </div>
    </section>
  );
}
