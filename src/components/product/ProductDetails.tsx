import { Reveal } from "@/components/motion/Reveal";
import type { Product } from "@/data/products";
import { popupAnchorProps } from "@/lib/legacy-popups";
import flavorShots from "@/data/flavor-shots.json";
import { productDetails } from "@/lib/site-pages";
import { ProductFaq } from "./ProductFaq";
import { ProductTabs, type ProductPane } from "./ProductTabs";
import styles from "./ProductDetails.module.css";

/**
 * Everything on a product page below the hero.
 *
 * The export puts five Tilda blocks here — the tab strip, the four figures, the
 * comparative table, the flavour list and the usage note — and every one of
 * them is a "zero block": absolutely positioned atoms on a fixed-height
 * artboard, held back behind Tilda's own scroll-animation script. They are the
 * same construction as the hero this component's neighbour replaced.
 *
 * There is no table and no list in that markup, only coordinates, so
 * `scripts/build-product-details.mjs` reads the coordinates and rebuilds the
 * structure they were drawing: tops cluster into rows, and each cell takes the
 * column it was drawn under. What is rendered here is the page's own content —
 * these pages carry two years of ranking — set as ordinary semantic markup.
 *
 * The four sections are four panes of one tab strip rather than four bands
 * stacked down the page — see `ProductTabs`, which owns which one is showing.
 * Everything that is data inside them — a figure, a flavour, a diagram — stands
 * on a card of the product's own colour, so a pane reads as a page of a
 * specification sheet rather than as a block left over from a page builder.
 *
 * The FAQ below them is not a pane. It was Tilda's one working block on the
 * page and it is the last thing a buyer reads, so it stays where it was, under
 * everything, always open.
 */

const SECTION_IDS = {
  specifications: "specifications",
  calculation: "calculation",
  flavors: "product-flavors",
  usage: "usage",
} as const;

function Tick() {
  return (
    <svg viewBox="0 0 20 20" fill="none" role="img" aria-label="Needed" className={styles.mark}>
      <circle cx="10" cy="10" r="9" fill="currentColor" />
      <path
        d="m5.8 10.2 2.6 2.8 5.8-6.4"
        stroke="var(--tbb-white)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Cross() {
  return (
    <svg viewBox="0 0 20 20" fill="none" role="img" aria-label="Not needed" className={styles.mark}>
      <circle cx="10" cy="10" r="9" fill="currentColor" />
      <path
        d="m7 7 6 6M13 7l-6 6"
        stroke="var(--tbb-white)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Cell({ value }: { value: string | boolean | null }) {
  if (typeof value === "boolean") {
    return <span className={value ? styles.yes : styles.no}>{value ? <Tick /> : <Cross />}</span>;
  }
  return <>{value ?? ""}</>;
}

export function ProductDetails({ product }: { product: Product }) {
  const detail = productDetails[product.slug];
  if (!detail) return null;

  const { specs, features, calculation, flavors, usage, faq } = detail;

  /*
   * The flavour shots this product has, keyed by the flavour's own name — see
   * `scripts/build-flavor-shots.mjs`. Neither the design file nor the Tilda
   * export ever carried a picture per flavour, on any of the sixteen, so the
   * photographs arrive here product by product and the section shows whatever
   * has arrived: the ones with a shot as a grid, the rest as the names they
   * already were.
   */
  const shots = (flavorShots as Record<string, Record<string, string>>)[product.slug] ?? {};

  // The page's own column, not the one it is compared against. Every product
  // happens to put it last, but the label is what actually says so.
  const ours = calculation
    ? calculation.columns.reduce(
        (best, column, index) => (/the base/i.test(column) ? index : best),
        calculation.columns.length - 1,
      )
    : -1;

  // Only the panes this product actually has. Every one of the sixteen has all
  // four today, but a page that lost one should lose its tab with it rather
  // than keep a tab that opens nothing.
  const panes: ProductPane[] = [];

  if (specs.length > 0 || features.length > 0) {
    panes.push({
      id: SECTION_IDS.specifications,
      label: "Specifications",
      content: (
        <div className={styles.pane}>
          <h2 className="tbb-visually-hidden">{product.name} specifications</h2>

          {/* The four figures, on one card divided by hairlines rather than
              four columns of their own. They are one reading — a dose, a pack,
              a yield, a cup — and a single surface is what says so. */}
          {specs.length > 0 && (
            <Reveal as="dl" className={styles.specs}>
              {specs.map((spec) => (
                <div key={spec.label} className={styles.spec}>
                  {spec.icon && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      className={styles.specIcon}
                      src={spec.icon}
                      alt=""
                      width={44}
                      height={44}
                      decoding="async"
                    />
                  )}
                  <dt className={`tbb-label ${styles.specLabel}`}>{spec.label}</dt>
                  <dd className={styles.specValue}>{spec.value}</dd>
                </div>
              ))}
            </Reveal>
          )}

          {/* The selling points used to sit in the hero, under the buttons,
              where they competed with the one thing the hero is for. */}
          {features.length > 0 && (
            <dl className={styles.features}>
              {features.map((feature, index) => (
                <Reveal
                  key={feature.label}
                  as="div"
                  className={styles.feature}
                  delay={index * 70}
                  distance={18}
                >
                  <dt className={styles.featureLabel}>{feature.label}</dt>
                  <dd className={styles.featureValue}>{feature.value}</dd>
                </Reveal>
              ))}
            </dl>
          )}
        </div>
      ),
    });
  }

  if (calculation) {
    panes.push({
      id: SECTION_IDS.calculation,
      label: "Calculation",
      content: (
        <div className={styles.pane}>
          <Reveal as="h2" className={styles.title}>
            {calculation.title}
          </Reveal>

          {/* The table is wider than a phone and is allowed to scroll inside
              its own card, so the page body never scrolls sideways. */}
          <Reveal className={styles.card} delay={80}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {calculation.columns.map((column, index) => (
                      <th key={column} scope="col" data-ours={index === ours ? "true" : undefined}>
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calculation.rows.map((row) => (
                    <tr key={String(row[0])}>
                      <th scope="row">{String(row[0] ?? "")}</th>
                      {row.slice(1).map((value, index) => (
                        <td
                          key={calculation.columns[index + 1]}
                          data-ours={index + 1 === ours ? "true" : undefined}
                        >
                          <Cell value={value} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      ),
    });
  }

  if (flavors) {
    // Photographed first, then the rest by name. Split rather than interleaved:
    // a grid with gaps in it reads as a grid that failed to load.
    const shot = flavors.items.filter((flavour) => shots[flavour]);
    const named = flavors.items.filter((flavour) => !shots[flavour]);

    panes.push({
      id: SECTION_IDS.flavors,
      label: "Flavors",
      content: (
        <div className={styles.pane}>
          <Reveal as="h2" className={styles.title}>
            Flavors
          </Reveal>

          <div className={styles.flavorLayout}>
            <div>
              {shot.length > 0 && (
                <ul className={styles.shots}>
                  {shot.map((flavour, index) => (
                    <Reveal
                      key={flavour}
                      as="li"
                      className={styles.shot}
                      delay={Math.min(index, 12) * 45}
                      distance={16}
                    >
                      <span className={styles.shotFrame}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={shots[flavour]} alt={`${flavour} ${product.name}`} loading="lazy" />
                      </span>
                      <span className={styles.shotName}>{flavour}</span>
                    </Reveal>
                  ))}
                </ul>
              )}

              {/* Named things of the same kind, so they are set as one field of
                  chips that wraps to whatever width there is. The lists run from
                  two names to twenty-one and a column count fixed for either end
                  reads as a mistake at the other. */}
              {named.length > 0 && (
                <ul className={`${styles.flavors} ${shot.length > 0 ? styles.flavorsAfterShots : ""}`}>
                  {named.map((flavour, index) => (
                    <Reveal
                      key={flavour}
                      as="li"
                      className={styles.flavor}
                      delay={Math.min(index, 12) * 45}
                      distance={16}
                    >
                      {flavour}
                    </Reveal>
                  ))}
                </ul>
              )}
            </div>

            <Reveal className={styles.custom} delay={120} distance={20}>
              <h3 className={styles.customTitle}>Custom Flavors</h3>
              {flavors.note && <p className={styles.customNote}>{flavors.note}</p>}
              {/* `#flavor` is one of the export's popups, so the link carries
                  the dialog attributes Tilda's runtime would write onto it
                  anyway — see `popupAnchorProps`. */}
              {flavors.cta && (
                <a
                  className={styles.customCta}
                  href={flavors.cta.href}
                  {...popupAnchorProps(flavors.cta.href)}
                >
                  {flavors.cta.label}
                </a>
              )}
            </Reveal>
          </div>
        </div>
      ),
    });
  }

  if (usage) {
    panes.push({
      id: SECTION_IDS.usage,
      label: "Usage",
      content: (
        <div className={styles.pane}>
          <Reveal as="h2" className={styles.title}>
            Usage
          </Reveal>
          <Reveal className={styles.usageLines} delay={80}>
            {usage.lines.map((line) => (
              <p key={line} className={styles.usageLine}>
                {line}
              </p>
            ))}
          </Reveal>
          {usage.image && (
            /* The diagram is drawn a thousand pixels wide and its labels do not
               reflow, so below that width it keeps a legible size and scrolls
               inside its own card, the same as the table. */
            <Reveal delay={140} className={`${styles.card} ${styles.usageFigure}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.usageImage}
                src={usage.image}
                alt={`How to prepare ${product.name}`}
                loading="lazy"
                decoding="async"
              />
            </Reveal>
          )}
        </div>
      ),
    });
  }

  return (
    <div className={styles.root} style={{ ["--tile" as string]: product.backgroundColor }}>
      {panes.length > 0 && <ProductTabs panes={panes} />}

      {faq.length > 0 && (
        <section id="faq" className={`${styles.pane} ${styles.faq}`}>
          <Reveal as="h2" className={styles.title}>
            Frequently Asked Questions
          </Reveal>
          <ProductFaq entries={faq} />

          {/*
            No `FAQPage` graph here on purpose. It is the obvious thing to add
            with the questions already in hand, and it was added and taken back
            out: `audit:seo-parity` compares this page's JSON-LD types against
            the live site's, and a type production does not have fails all
            sixteen product pages. Search engines retired FAQ rich results for
            most sites, so it would have cost a green parity check and bought
            close to nothing. If it is ever wanted, it belongs on production
            first and here second.
          */}
        </section>
      )}
    </div>
  );
}
