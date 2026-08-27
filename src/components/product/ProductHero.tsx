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
 * The words are a column on the left and the product is on the right, running
 * off the edge of the page — the composition the client's own key visuals are
 * built in, which is why the picture is a crop of one rather than a new
 * photograph; see `scripts/build-product-heroes.mjs`. The panel behind it
 * continues that banner's own wash, sampled at the head and at the foot, so
 * there is no edge where the picture stops and the page starts. Eleven products
 * have a banner; the rest have only the cut-out pack shot, which every product
 * falls back to on a phone — see the note over the picture below.
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
        Two pictures, and the reason is in the artwork: every one of the eleven
        key visuals runs the pouch off the right of its own frame. Measured, not
        assumed — the crop's last column is pack at every height below the
        pouch's shoulder, and the source banner cuts it in the same place.
        There is no whole pouch in that photography.

        On a wide screen that edge is put against the edge of the page, where a
        cut reads as the picture carrying on past the screen. A phone has no
        such room: the frame is barely wider than the pouch, so the cut lands in
        plain sight and the pack simply looks chopped. There the page shows the
        cut-out pack shot instead, which is whole — at the cost of the drink
        beside it, which only the banner has.

        `<picture>` rather than two elements, so only the one that is used is
        ever fetched.
      */}
      <picture className={styles.media}>
        {banner && <source media="(min-width: 900px)" srcSet={banner.image} />}
        <img
          className={banner ? styles.banner : styles.pack}
          src={`/images/pack-${product.slug}.webp`}
          // Described rather than hidden: the fallback this element carries is
          // the pack on its own, which is the product and not decoration.
          alt={`${product.name} base by THE BASE, ${detail?.weight ?? "500g"} pouch`}
          fetchPriority="high"
        />
      </picture>

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
