import { Reveal } from "@/components/motion/Reveal";
import { SiteLink } from "@/components/site/SiteLink";
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
 * The composition follows the client's own design for this page: the product
 * stands on the left against the brand watermark, and the words are a column of
 * their own on the right. That is also how the supplied key visuals are built,
 * which is why the picture here is a crop of one rather than a new photograph —
 * see `scripts/build-product-heroes.mjs`. The panel behind it continues the
 * banner's own wash, sampled at the head and at the foot, so there is no edge
 * where the picture stops and the page starts. Eleven products have a banner;
 * the rest fall back to the pack shot on a wash of their own colour.
 *
 * The copy is the page's own, lifted out of the export by
 * `scripts/build-product-details.mjs` rather than rewritten — these pages carry
 * two years of ranking and the wording is what they rank on. The `h1` in
 * particular is reproduced verbatim, because `audit:seo-parity` compares it
 * against the live site character for character.
 */

const heroes = productHeroes as Record<string, { image: string; band: string; bandFoot: string }>;

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

      {/*
        Pinned to the right edge of the page, and it has to be that edge.
        Every one of the eleven key visuals runs the pouch off the right of its
        own frame — measured, not assumed: the last column of all eleven crops
        is product at every height below the pouch's shoulder. So wherever that
        edge lands is where the pouch is cut. Against the edge of the page it
        reads as the picture carrying on past the screen; anywhere else on the
        page it reads as a pack sliced down the middle, which is what it looked
        like when the picture sat between the copy and the gutter.
      */}
      <div className={styles.media}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={banner ? styles.banner : styles.pack}
          src={banner?.image ?? `/images/pack-${product.slug}.webp`}
          // The banner is decoration beside copy that already says all of this;
          // the pack shot on its own is the product, so it is described.
          alt={banner ? "" : `${product.name} base by THE BASE, ${detail?.weight ?? "500g"} pouch`}
          aria-hidden={banner ? "true" : undefined}
          fetchPriority="high"
        />
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
                <Arrow />
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
