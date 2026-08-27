import { Reveal } from "@/components/motion/Reveal";
import { SiteLink } from "@/components/site/SiteLink";
import type { Product } from "@/data/products";
import productHeroes from "@/data/product-heroes.json";
import { productMargins } from "@/data/product-margins";
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
 * The composition is the owner's design file: the product stands on the left
 * over the brand mark, the two certification seals sit under it, and the words
 * are a column on the right that ends on the margin figures and the two calls
 * to action. The panel behind the pouch is the wash of that product's own key
 * visual, sampled at the head and at the foot by
 * `scripts/build-product-heroes.mjs`, so the pack stands on its own artwork's
 * colour rather than on a flat tint. Five products have no key visual yet and
 * fall back to a wash mixed from their registry colour.
 *
 * The copy is the page's own, lifted out of the export by
 * `scripts/build-product-details.mjs` rather than rewritten — these pages carry
 * two years of ranking and the wording is what they rank on. The `h1` in
 * particular is reproduced verbatim, because `audit:seo-parity` compares it
 * against the live site character for character.
 */

const heroes = productHeroes as Record<string, { image: string; band: string; bandFoot: string }>;

/**
 * The two certifications the site claims everywhere — the homepage hero, the
 * About figures, the Bestsellers spec list — set here as the seals the design
 * puts under the pack.
 *
 * Drawn rather than fetched: no certifier's artwork ships with this project,
 * and reproducing a certification body's own mark from a screenshot is not
 * ours to do. These are the site's own badges carrying the site's own claim,
 * which is the same claim the three components above already make in words.
 */
function Seal({ tint, title, caption, glyph }: { tint: string; title: string; caption: string; glyph?: string }) {
  return (
    <svg className={styles.seal} viewBox="0 0 100 100" role="img" aria-label={`${title} ${caption}`}>
      <circle cx="50" cy="50" r="49" fill="var(--tbb-paper)" />
      <circle cx="50" cy="50" r="47" fill="none" stroke={tint} strokeWidth="3.5" />
      <circle
        cx="50"
        cy="50"
        r="41"
        fill="none"
        stroke={tint}
        strokeWidth="1.2"
        strokeDasharray="3 3.4"
      />
      {glyph && (
        <text className={styles.sealGlyph} x="50" y="42" fill={tint}>
          {glyph}
        </text>
      )}
      <text className={styles.sealTitle} x="50" y={glyph ? 62 : 52} fill={tint}>
        {title}
      </text>
      <text className={styles.sealCaption} x="50" y={glyph ? 74 : 66} fill={tint}>
        {caption}
      </text>
    </svg>
  );
}

export function ProductHero({ product }: { product: Product }) {
  const detail = productDetails[product.slug];
  const banner = heroes[product.slug];
  const margin = productMargins[product.slug];
  // The registry's description is the fallback for the three pages whose own
  // copy does not open by naming the product, which is how the extractor
  // recognises it.
  const paragraphs = detail?.description.length ? detail.description : [product.description];

  // A banner sets the wash; without one the page mixes the product colour down
  // to a tint, which is always light. Ink is measured either way rather than
  // assumed — Tea's wash is near-black and Jam's is burgundy.
  const onDark = banner ? isDark(banner.band) : false;
  const heading = detail?.h1 ?? product.headline;

  return (
    <section
      className={`${styles.hero} ${onDark ? styles.onDark : ""} ${banner ? "" : styles.plain}`}
      style={{
        ["--tile" as string]: product.backgroundColor,
        ...(banner
          ? { ["--band" as string]: banner.band, ["--band-foot" as string]: banner.bandFoot }
          : {}),
      }}
      aria-labelledby="product-title"
    >
      {/*
        The brand mark at display size, standing behind everything the way it
        does on every one of the client's key visuals. It is set rather than
        drawn so it stays sharp at any width and costs no request.
      */}
      <span className={styles.mark} aria-hidden="true">
        <span className={styles.markThe}>the</span>
        <span>BASE</span>
      </span>

      {/* The product's half of the page: the picture, and the seals under it. */}
      <div className={styles.stage}>
        {/*
          The cut-out pack shot, not the key visual, and the reason is in the
          artwork: every one of the eleven banners runs the pouch off the right
          of its own frame. Measured, not assumed — the last column of every
          source is pack, at every height below the pouch's shoulder. While the
          picture stood in a right-hand column that cut could be put against the
          page's own edge, where it read as the picture carrying on past the
          screen. The design stands the product on the left, where the same cut
          lands in the middle of the page and reads as a sliced pack.

          So the wide screen now shows what the phone always did: the pouch on
          its own, whole, standing on the banner's wash. What it costs is the
          drink beside it, which exists only inside those frames. Restoring it
          needs artwork the client has not supplied — a key visual with the
          whole pouch inside the frame, or the glass as its own cut-out.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.pack}
          src={`/images/pack-${product.slug}.webp`}
          alt={`${product.name} base by THE BASE, ${detail?.weight ?? "500g"} pouch`}
          fetchPriority="high"
        />

        <div className={styles.seals}>
          <Seal tint="#1c4f8b" title="HACCP" caption="CERTIFIED" />
          <Seal tint="#0f7a3d" title="HALAL" caption="CERTIFIED" glyph="حلال" />
        </div>
      </div>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <Reveal as="p" className={styles.breadcrumb} distance={12}>
            <SiteLink href="/catalog">Catalog</SiteLink>
            <span aria-hidden="true">/</span>
            <span>{product.name}</span>
          </Reveal>

          <Reveal delay={60} distance={20}>
            {/*
              Fifteen of the sixteen `h1`s are a full SEO sentence — "Iced Tea
              Base for Refreshing, Crisp, Ready-to-Mix Beverages" — and only Raf
              Coffee's is a name. So the size follows the line rather than being
              fixed: a name gets the display scale the design draws it at, a
              sentence gets heading scale, because at display scale it is four
              lines of shouting. The wording itself is never touched; it is what
              these pages rank on and `audit:seo-parity` compares it character
              for character.
            */}
            <h1
              id="product-title"
              className={styles.title}
              data-short={heading.length <= 24 ? "true" : undefined}
            >
              {heading}
            </h1>
          </Reveal>

          {detail?.tagline && (
            <Reveal as="p" className={styles.tagline} delay={120} distance={16}>
              {detail.tagline}
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
                  {detail?.weight && <span className={styles.weight}>{detail.weight}</span>}
                </>
              ) : (
                <span className={styles.priceValue}>Price on request</span>
              )}
            </p>

            {/*
              Only for the products whose figures the owner has actually given —
              see `product-margins.ts`. The block is the design's closing
              argument, and it is the one thing on the page that must never be
              filled in by inference.
            */}
            {margin && (
              <div className={styles.margin}>
                <h2 className={styles.marginTitle}>Approximately Profit Margin</h2>
                <div className={styles.marginCard}>
                  <div className={styles.marginSide}>
                    <p className={styles.marginLabel}>with {margin.comparedWith}</p>
                    <p className={styles.marginValue}>{margin.legacy}</p>
                  </div>
                  <span className={styles.marginVs} aria-hidden="true">
                    vs
                  </span>
                  <div className={styles.marginSide}>
                    <p className={styles.marginLabel}>with THE BASE</p>
                    <p className={styles.marginValue}>{margin.base}</p>
                  </div>
                </div>
              </div>
            )}

            {/*
              Both hrefs are popup hooks the export still owns — `#sample` is the
              free-sample form, `#form` the partner enquiry — and they are the
              two the original buttons pointed at. The first was `#order` here,
              which no page has a hook for, so the page's primary call to action
              did nothing at all. The sample leads now, as it does in the design:
              this is a wholesale page, and a buyer asks for the pouch before
              they ask for the sheet.
            */}
            <div className={styles.actions}>
              <a href="#sample" className={styles.primary}>
                Request a sample
              </a>
              <a href="#form" className={styles.secondary}>
                {product.price ? "Place order" : "Request pricing"}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
