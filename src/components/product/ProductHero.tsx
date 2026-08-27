import { Reveal } from "@/components/motion/Reveal";
import type { Product } from "@/data/products";
import { productGlass } from "@/data/product-glass";
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
 * never saw the name or a way to order. `site-pages.ts` drops that block; this
 * renders the same copy as ordinary markup.
 *
 * Laid out to the owner's Figma frame, measured layer by layer — the numbers
 * and the frame they are read against are in the stylesheet. The pouch stands
 * on the left over the brand mark with the two certification seals under it,
 * and the words are a column on the right that closes on the margin figures and
 * the two calls to action. Nothing else is in that frame, which is why the page
 * no longer carries a breadcrumb or a price here; `/catalog` still holds both.
 *
 * The panel behind the pouch is the wash of that product's own key visual,
 * sampled at the head and at the foot by `scripts/build-product-heroes.mjs`, so
 * the pack stands on its own artwork's colour rather than on a flat tint. Five
 * products have no key visual yet and fall back to a wash mixed from their
 * registry colour.
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
function Seal({
  tint,
  title,
  caption,
  glyph,
}: {
  tint: string;
  title: string;
  caption: string;
  glyph?: string;
}) {
  return (
    <svg
      className={styles.seal}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`${title} ${caption}`}
    >
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
  const glass = productGlass[product.slug];
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
          ? {
              ["--band" as string]: banner.band,
              ["--band-foot" as string]: banner.bandFoot,
            }
          : {}),
      }}
      aria-labelledby="product-title"
    >
      {/*
        The product's half of the page hangs off the section rather than off the
        measured frame, so that on a monitor wider than the frame the mark still
        runs off the side of the page the way the design draws it, instead of
        starting somewhere out in the middle. Below the frame's own width the two
        are the same edge and nothing moves.
      */}
      {/*
        The brand mark at display size, standing behind everything the way it
        does on every one of the client's key visuals. "BASE" is the owner's
        own vector rather than type — it is a condensed face this project does
        not carry, and drawing it with the page's own would be a different
        word in a different voice. It is painted through a mask rather than
        placed as a picture so the wash can still be chosen per product: white
        over a key visual, a grey ghost over the pale fallback.
      */}
      <span className={styles.mark} aria-hidden="true">
        <span className={styles.markThe}>the</span>
        <span className={styles.markWord} />
      </span>

      {/*
        The cut-out pack shot, not the key visual, and the reason is in the
        artwork: every one of the eleven banners runs the pouch off the right
        of its own frame. Measured, not assumed — the last column of every
        source is pack, at every height below the pouch's shoulder. The design
        stands the product on the left, where that cut would land in the
        middle of the page and read as a sliced pack.

        The drink the design stands in front of it is not part of this: it is
        a layer of its own there and a layer of its own here — see below.
      */}
      <div className={styles.stage}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.pack}
          src={`/images/pack-${product.slug}.webp`}
          alt={`${product.name} base by THE BASE, ${detail?.weight ?? "500g"} pouch`}
          fetchPriority="high"
        />

        {/*
          The drink, in front of the pouch. It is a layer of its own in the
          design with a box of its own, given here as a share of the pack's
          group rather than of the frame — that is the one reading that holds
          on a phone too, where the group shrinks and the frame is gone.
          Decoration beside the pack shot, hence no alt.
        */}
        {glass?.image && (
          <div
            className={styles.glass}
            style={{
              ["--glass-left" as string]: glass.left,
              ["--glass-top" as string]: glass.top,
              ["--glass-width" as string]: glass.width,
              ["--glass-height" as string]: glass.height,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={glass.image} alt="" />
          </div>
        )}
      </div>

      <div className={styles.seals}>
        <Seal tint="#1c4f8b" title="HACCP" caption="CERTIFIED" />
        <Seal tint="#0f7a3d" title="HALAL" caption="CERTIFIED" glyph="حلال" />
      </div>

      {/* The design frame, which from here down is the copy's own measure —
          see the note over `--u` in the stylesheet. */}
      <div className={styles.frame}>
        <div className={styles.copy}>
          <Reveal delay={60} distance={20}>
            {/*
              Fifteen of the sixteen `h1`s are a full SEO sentence — "Iced Tea
              Base for Refreshing, Crisp, Ready-to-Mix Beverages" — and only Raf
              Coffee's and Matcha's are a name. So the size follows the line
              rather than being fixed: a name gets the display scale the design
              draws it at, a sentence gets a smaller one, because at display
              scale it is four lines of shouting. The wording itself is never
              touched; it is what these pages rank on and `audit:seo-parity`
              compares it character for character.
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

          {/*
            Only for the products whose figures the owner has actually given —
            see `product-margins.ts`. The block is the design's closing
            argument, and it is the one thing on the page that must never be
            filled in by inference.
          */}
          {margin && (
            <Reveal className={styles.margin} delay={210} distance={16}>
              <h2 className={styles.marginTitle}>Approximately Profit Margin</h2>
              <div className={styles.marginCard}>
                <div className={styles.marginSide}>
                  <p className={styles.marginLabel}>{margin.legacyLabel}</p>
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
            </Reveal>
          )}

          {/*
            Both hrefs are popup hooks the export still owns — `#sample` is the
            free-sample form, `#form` the partner enquiry — and they are the two
            the original buttons pointed at. The first was `#order` here, which
            no page has a hook for, so the page's primary call to action did
            nothing at all. Both labels are the design's, including on the
            eleven products that do have a price: the frame shows no price, so
            the second button asks for one rather than offering to take an order
            against a figure the page never gave.
          */}
          <Reveal className={styles.actions} delay={250} distance={16}>
            <a href="#sample" className={styles.primary}>
              Request a sample
            </a>
            <a href="#form" className={styles.secondary}>
              Request pricing
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
