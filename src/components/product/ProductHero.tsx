import { Reveal } from "@/components/motion/Reveal";
import type { Product } from "@/data/products";
import { packBox, productGlass } from "@/data/product-glass";
import productHeroes from "@/data/product-heroes.json";
import { productMargins } from "@/data/product-margins";
import { productShadows } from "@/data/product-shadows";
import { productWashes } from "@/data/product-washes";
import { isDark } from "@/lib/contrast";
import { popupAnchorProps } from "@/lib/legacy-popups";
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

/*
 * The certification seals, as the owner's own artwork.
 *
 * They used to be drawn here: no certifier's mark shipped with the project and
 * reproducing one from a screenshot is not ours to do. Both now come from the
 * design's own exports — `XXL_height 1.svg` is the HALAL mark and `Mask group
 * .svg` the HACCP one, and each carries a raster inside rather than paths, so
 * the picture is lifted out and kept as a picture.
 *
 * The proportions are the file's: HALAL is 840 x 773, which is 1.087, against
 * the 108.02 x 99.40 box the design draws it in; HACCP is square in both. So
 * only the width is set and the height follows the artwork.
 */
const SEALS = {
  halal: { src: "/images/seal-halal.webp", alt: "Halal certified" },
  haccp: { src: "/images/seal-haccp.webp", alt: "HACCP certified — food safety" },
} as const;

function Seal({ box, mark }: { box: "small" | "wide"; mark: keyof typeof SEALS }) {
  const seal = SEALS[mark];
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      className={`${styles.seal} ${box === "wide" ? styles.sealWide : styles.sealSmall}`}
      src={seal.src}
      alt={seal.alt}
      loading="lazy"
    />
  );
}

export function ProductHero({ product }: { product: Product }) {
  const detail = productDetails[product.slug];
  const banner = heroes[product.slug];
  const margin = productMargins[product.slug];
  const glass = productGlass[product.slug];
  // The five products with no banner stand on the wash their own frame carries.
  const wash = banner ? undefined : productWashes[product.slug];
  // The registry's description is the fallback for the three pages whose own
  // copy does not open by naming the product, which is how the extractor
  // recognises it.
  const paragraphs = detail?.description.length ? detail.description : [product.description];

  // A banner sets the wash, and where there is none the frame's own fill does.
  // Ink is measured off whichever it is rather than assumed — Tea's wash is
  // near-black, Jam's is burgundy, and Vending's outer stop is darker still.
  const onDark = isDark(banner?.band ?? wash?.to ?? "#ffffff");
  // The design's h1 is the product's name, and that is what the page now leads
  // with. The sentence it used to lead with is production's own h1 and what
  // these pages rank on, so it is kept directly under as an h2 rather than
  // dropped — except on Raf Coffee, where production's h1 is the name already.
  const title = product.hyphenatedName ?? product.name;
  const headline = detail?.h1 ?? product.headline;
  const showHeadline = headline !== product.name;
  const pack = packBox(product.slug);

  return (
    <section
      className={`${styles.hero} ${onDark ? styles.onDark : ""} ${banner || wash ? "" : styles.plain}`}
      style={{
        ["--tile" as string]: product.backgroundColor,
        ...(productShadows[product.slug]
          ? { ["--shade" as string]: productShadows[product.slug] }
          : {}),
        ["--pack-left" as string]: pack.left,
        ["--pack-top" as string]: pack.top,
        ["--pack-width" as string]: pack.width,
        ["--pack-height" as string]: pack.height,
        ...(banner
          ? {
              ["--band" as string]: banner.band,
              ["--band-foot" as string]: banner.bandFoot,
            }
          : wash
            ? {
                ["--wash-from" as string]: wash.from,
                ["--wash-to" as string]: wash.to,
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

        First of it, the brand mark at display size, standing behind everything
        the way it does on every one of the client's key visuals. "BASE" is the owner's
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
          decoding="async"
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
            <img src={glass.image} alt="" decoding="async" />
          </div>
        )}
      </div>

      <div className={styles.seals}>
        <Seal box="small" mark="haccp" />
        <Seal box="wide" mark="halal" />
      </div>

      {/* The design frame, which from here down is the copy's own measure —
          see the note over `--u` in the stylesheet. */}
      <div className={styles.frame}>
        <div className={styles.copy}>
          <Reveal delay={60} distance={20}>
            {/* Always a name now, so always the display scale the design draws
                it at — there is no long line left for the size to follow. */}
            <h1 id="product-title" className={styles.title}>
              {title}
            </h1>
          </Reveal>

          {/*
            Not decoration: this is the wording production ranks on, moved a
            level down rather than deleted. `audit:seo-parity` knows about the
            move and still fails if the phrase stops appearing on the page.
          */}
          {showHeadline && (
            <Reveal as="h2" className={styles.headline} delay={90} distance={16}>
              {headline}
            </Reveal>
          )}

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

            The dialog attributes are Tilda's own, written here rather than
            waited for — see `popupAnchorProps`.
          */}
          <Reveal className={styles.actions} delay={250} distance={16}>
            <a href="#sample" className={styles.primary} {...popupAnchorProps("#sample")}>
              Request a sample
            </a>
            <a href="#form" className={styles.secondary} {...popupAnchorProps("#form")}>
              Request pricing
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
