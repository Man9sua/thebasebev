import type { CSSProperties, ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import type { Product } from "@/data/products";
import { productGlass } from "@/data/product-glass";
import productHeroes from "@/data/product-heroes.json";
import { productDesktop, WASH_SHAPE } from "@/data/product-desktop";
import { productMargins } from "@/data/product-margins";
import { productMobile, WASH_SHAPE as PHONE_WASH_SHAPE } from "@/data/product-mobile";
import { productScene } from "@/data/product-scene";
import { productShadows } from "@/data/product-shadows";
import { productWashes } from "@/data/product-washes";
import { isDark, luminance } from "@/lib/contrast";
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
 * Laid out to the owner's two Figma frames, measured layer by layer — the
 * numbers and the frames they are read against are in the stylesheet, and the
 * per-product half of them is in `data/product-desktop.ts` and
 * `data/product-mobile.ts`. The pouch stands on the left over the brand mark
 * with the two certification seals at its foot, the words are a column on the
 * right closing on the margin figures and the two calls to action, and a panel
 * of the product's own colour carries the four things the pack is bought for.
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
 * .svg` the HACCP one — and each carries a raster inside rather than paths, so
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

/*
 * The marks on the four discs.
 *
 * The design draws one per feature and they are vector layers rather than
 * exported artwork — a path inside a `.fig` is an encoded blob this project
 * cannot turn back into an SVG — so these are the same ideas drawn in the
 * site's own line. Matched on the label because the four are not the same four
 * on every product: twenty-one distinct headings across the sixteen pages, of
 * which these cover all but a handful, and the rest take the last one.
 */
const MARKS = {
  pack: (
    <path
      d="M4 8.5 12 4.5l8 4v7L12 19.5 4 15.5v-7Zm0 0 8 4m0 0 8-4m-8 4v7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  chill: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M12 3.5v17M4.6 7.75l14.8 8.5M19.4 7.75l-14.8 8.5" />
      <path d="M3.5 3.5l17 17" />
    </g>
  ),
  quick: (
    <path
      d="M13.2 3.5 5.5 13.6h5.1l-.8 6.9 7.7-10.1h-5.1l.8-6.9Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  shelf: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7v5.4l3.6 2.2" />
    </g>
  ),
  quality: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M12 3.4 19 6.3v5.2c0 4-2.9 7.5-7 9.1-4.1-1.6-7-5.1-7-9.1V6.3l7-2.9Z" />
      <path d="m8.9 11.9 2.2 2.3 4-4.4" strokeLinecap="round" />
    </g>
  ),
} as const;

/** The mark for a heading, by what the heading is about. */
function featureMark(label: string): ReactNode {
  const text = label.toLowerCase();
  if (/pack|space|leak|portion|dosage/.test(text)) return MARKS.pack;
  if (/refriger|freez|ice cream|cold|chill/.test(text)) return MARKS.chill;
  if (/quick|fast|easy|hassle|ready|convenien|prepare/.test(text)) return MARKS.quick;
  if (/shelf|month|storage|store/.test(text)) return MARKS.shelf;
  return MARKS.quality;
}

/** A hex as its three channels, or null for anything else. */
function channels(colour: string | undefined): number[] | null {
  if (!colour || !/^#[0-9a-f]{6}$/i.test(colour)) return null;
  return [1, 3, 5].map((at) => Number.parseInt(colour.slice(at, at + 2), 16));
}

/** Two colours far enough apart to be told from one another on one band. */
function apart(one: string | undefined, two: string | undefined): boolean {
  const a = channels(one);
  const b = channels(two);
  if (!a || !b) return true;
  return Math.max(...a.map((value, at) => Math.abs(value - b[at]))) > 12;
}

/** The same colour with the light taken out of it. */
function darken(colour: string | undefined, keep = 0.82): string | undefined {
  const rgb = channels(colour);
  if (!rgb) return undefined;
  return `#${rgb.map((value) => Math.round(value * keep).toString(16).padStart(2, "0")).join("")}`;
}

export function ProductHero({ product }: { product: Product }) {
  const detail = productDetails[product.slug];
  const banner = heroes[product.slug];
  const margin = productMargins[product.slug];
  const glass = productGlass[product.slug];
  const card = productDesktop[product.slug];
  // Garnish, Sugar Free and Tea are collages rather than a pouch and a drink,
  // and stand on their own list of layers — see `data/product-scene.ts`.
  const scene = productScene[product.slug];
  // The three products with no wash in the design file stand on the fill their
  // own frame carries, or on their key visual's ramp.
  const wash = productWashes[product.slug];
  // The registry's description is the fallback for the three pages whose own
  // copy does not open by naming the product, which is how the extractor
  // recognises it.
  const paragraphs = detail?.description.length ? detail.description : [product.description];
  // Reversed: the export lists these ending on the packaging line and the
  // design opens on it, and the four run the opposite way on every one of the
  // sixteen pages — Long Shelf Life is the first here and the last there. Read
  // in the design's order the row is a story, from what the pack saves in the
  // store to how long it keeps.
  const features = (detail?.features ?? []).slice(0, 4).reverse();

  // The wash the desktop actually paints, in the order of what the product has:
  // the design file's own radial, then the frame fill, then the key visual.
  const washFrom = card?.washIn ?? wash?.from ?? banner?.band;
  const washTo = card?.washOut ?? wash?.to ?? banner?.bandFoot;
  // Ink is measured off the wash rather than assumed — Tea's is near-black,
  // Jam's is burgundy, and Vending's outer stop is darker still.
  const onDark = isDark(washTo ?? "#ffffff");
  // The three with no radial of their own also have the palest washes, and a
  // white mark on those is nothing at all — but not Tea, whose fallback ramp is
  // near-black and already takes the light ink above.
  const plain = !card?.washIn && !onDark;
  // Garnish, Sugar Free and Topping stand on a wash a shade off white, and the
  // file's own rendering of those three has the mark as barely a ghost. At the
  // weight the rest of the range carries it, white on that is a slab across the
  // artwork rather than a watermark behind it.
  const paleWash = luminance(washTo ?? "#ffffff") > 0.72;
  /*
   * The panel the four selling points stand on.
   *
   * On the phone they are tiles inside the copy's own panel, so they take the
   * colour the file gives them and are seen against it. On the desktop the
   * same colour is a band lying on the wash — and on seven of the sixteen the
   * file names it the wash's own outer colour, so there is nothing to see.
   * Those take a shade of the wash instead, which is what the file itself
   * arrives at on Iced Tea and the five others where it leaves the panel
   * unnamed.
   */
  const shade = darken(washTo) ?? product.backgroundColor;
  const tile = card?.panel ?? shade;
  const strip = apart(card?.panel, washTo) ? (card?.panel ?? shade) : shade;
  const stripDark = isDark(strip);

  // The design's h1 is the product's name, and that is what the page now leads
  // with. The sentence it used to lead with is production's own h1 and what
  // these pages rank on, so it is kept directly under as an h2 rather than
  // dropped — except on Raf Coffee, where production's h1 is the name already.
  const title = product.hyphenatedName ?? product.name;
  const headline = detail?.h1 ?? product.headline;
  const showHeadline = headline !== product.name;

  /*
   * The phone's own card — a different wash, a panel under the copy and its own
   * box for the drink. See `data/product-mobile.ts`; the stylesheet reads these
   * only below its media query, so nothing here reaches the desktop.
   *
   * Garnish and Sugar Free have no wash in that file because their cards are
   * collages rather than a pouch on a ramp, so they fall back to the flat fill
   * their desktop frame carries.
   */
  const phone = productMobile[product.slug];
  const phoneWash = phone?.washIn
    ? { from: phone.washIn, to: phone.washOut ?? phone.washIn }
    : wash;
  // Ink on the phone is measured off the panel rather than off the wash: the
  // wash carries no words there, and Chocolate's panel is dark where its own
  // desktop band is darker still.
  const phoneDark = phone ? isDark(phone.panel) : false;

  const vars: CSSProperties & Record<string, string | number> = {
    "--tile": product.backgroundColor,
    "--tile-panel": tile,
    "--strip": strip,
    "--panel-ink": stripDark ? "var(--tbb-white)" : "var(--tbb-ink)",
    "--panel-ink-soft": stripDark ? "rgba(255, 255, 255, 0.76)" : "var(--tbb-ink-soft)",
    // Named for the desktop rather than set as `--pack-*` directly: an inline
    // style outranks every rule in the stylesheet, and the phone has a pouch
    // layer of its own to put there.
    "--d-pack-left": card?.pouch.left ?? 106.85,
    "--d-pack-top": card?.pouch.top ?? 137.38,
    "--d-pack-width": card?.pouch.width ?? 385.73,
    "--d-pack-height": card?.pouch.height ?? 561.57,
    "--wash-shape": card?.washShape ?? WASH_SHAPE,
  };
  if (productShadows[product.slug]) vars["--shade"] = productShadows[product.slug];
  // A collage's ground is a photograph rather than a wash, so the weight the
  // mark needs there is the design's own rather than one of the two the
  // stylesheet reads off the wash.
  if (card?.mark !== undefined) vars["--mark-desk"] = card.mark;
  if (card?.markClip) vars["--mark-clip"] = card.markClip;
  if (washFrom) vars["--wash-from"] = washFrom;
  if (washTo) vars["--wash-to"] = washTo;
  if (card?.edge) vars["--edge"] = card.edge;
  if (banner) {
    vars["--band"] = banner.band;
    vars["--band-foot"] = banner.bandFoot;
  }
  if (phone) {
    vars["--m-panel"] = phone.panel;
    if (phone.panelTop) vars["--m-panel-top"] = phone.panelTop;
    if (phone.mark !== undefined) vars["--mark-phone"] = phone.mark;
    vars["--m-wash-shape"] = phone.washShape ?? PHONE_WASH_SHAPE;
    if (phoneWash) {
      vars["--m-wash-from"] = phoneWash.from;
      vars["--m-wash-to"] = phoneWash.to;
    }
    if (phone.shade) vars["--m-shade"] = phone.shade;
    if (phone.glass) {
      vars["--m-glass-left"] = phone.glass.left;
      vars["--m-glass-top"] = phone.glass.top + 108;
      vars["--m-glass-width"] = phone.glass.width;
      vars["--m-glass-height"] = phone.glass.height;
    }
  }

  return (
    <section
      className={[
        styles.hero,
        onDark ? styles.onDark : "",
        plain ? styles.plain : "",
        paleWash ? styles.paleWash : "",
        phoneDark ? styles.panelDark : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={vars}
      aria-labelledby="product-title"
    >
      {/*
        The product's half of the page hangs off the section rather than off the
        measured frame, so that on a monitor wider than the frame the mark still
        runs off the side of the page the way the design draws it, instead of
        starting somewhere out in the middle. Below the frame's own width the two
        are the same edge and nothing moves.

        First of it, the brand mark at display size, standing behind everything
        the way it does on every one of the client's key visuals. "BASE" is the
        owner's own vector rather than type — it is a condensed face this project
        does not carry, and drawing it with the page's own would be a different
        word in a different voice. It is painted through a mask rather than
        placed as a picture so the fill can still be chosen per product: the
        file's own white ramp over a key visual, a grey ghost over the pale
        fallback.
      */}
      <span className={styles.mark} aria-hidden="true">
        <span className={styles.markThe} />
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
      {scene &&
        (["desktop", "phone"] as const).map((mode) =>
          scene[mode].map((layer, index) => {
            const style = {
              ["--a" as string]: layer.m[0],
              ["--b" as string]: layer.m[1],
              ["--c" as string]: layer.m[2],
              ["--d" as string]: layer.m[3],
              ["--e" as string]: layer.m[4],
              ["--f" as string]: layer.m[5],
              ...(layer.blur ? { ["--blur" as string]: `${layer.blur}` } : {}),
              ...(layer.opacity ? { opacity: layer.opacity } : {}),
              ...(layer.round ? { borderRadius: "50%" } : {}),
            } as CSSProperties;
            const className = `${styles.sceneLayer} ${
              mode === "phone" ? styles.scenePhone : styles.sceneWide
            }${layer.back ? ` ${styles.sceneBack}` : ""}`;
            const key = `${mode}-${index}`;
            /* The rectangle the design masks this layer through. Sugar Free's
               collage is masked, and it is the mask that stops its sachets at
               the copy's edge rather than across the margin card. The box is
               the card's own, so the layer inside it is pulled back to the
               card's corner and placed from there as usual. */
            const clip = layer.mask && {
              ["--mx" as string]: layer.mask[0],
              ["--my" as string]: layer.mask[1],
              ["--mw" as string]: layer.mask[2],
              ["--mh" as string]: layer.mask[3],
            } as CSSProperties;
            /* A fill rather than a picture: the ramps the file lays over a
               photograph's edges, without which it sits on the card as a
               rectangle instead of sinking into it. */
            const drawn = layer.src ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={key}
                className={className}
                src={layer.src}
                alt=""
                /* Both compositions are in the markup and one is hidden, so the
                   set that is not showing is never fetched: a lazy image with no
                   box on the page has nothing to intersect. */
                loading="lazy"
                decoding="async"
                style={style}
              />
            ) : (
              <span
                key={key}
                className={className}
                aria-hidden="true"
                style={{ ...style, background: layer.paint }}
              />
            );
            return clip ? (
              <span
                key={key}
                /* The breakpoint class rides the clip as well: a box six hundred
                   wide, hidden or not, has no business on a 360 page. */
                className={`${styles.sceneClip} ${
                  mode === "phone" ? styles.scenePhone : styles.sceneWide
                }`}
                aria-hidden="true"
                style={clip}
              >
                {drawn}
              </span>
            ) : (
              drawn
            );
          }),
        )}

      <div className={styles.stage} hidden={Boolean(scene)}>
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
          design with a box of its own, given here as a share of the standing
          pouch rather than of the frame — that is the one reading that holds
          on a phone too, where the frame is gone. Decoration beside the pack
          shot, hence no alt.
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

        {/*
          The four things the pack is bought for, on a panel of the product's
          own colour — a strip across the foot of the hero on the desktop, two
          tiles by two inside the copy's panel on a phone. The same four are
          also a pane of the specification tabs below; this is the design's
          summary of them and it closes the hero, which is where the file puts
          it on both frames.
        */}
        {features.length > 0 && (
          <Reveal className={styles.features} delay={300} distance={16}>
            {features.map((feature) => (
              <div key={feature.label} className={styles.feature}>
                <span className={styles.featureMark} aria-hidden="true">
                  <svg viewBox="0 0 24 24" role="presentation">
                    {featureMark(feature.label)}
                  </svg>
                </span>
                <p className={styles.featureLabel}>{feature.label}:</p>
                <p className={styles.featureValue}>{feature.value}</p>
              </div>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}
