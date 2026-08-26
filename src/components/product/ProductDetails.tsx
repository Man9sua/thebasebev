import { Reveal } from "@/components/motion/Reveal";
import type { Product } from "@/data/products";
import { productDetails } from "@/lib/site-pages";
import { ProductFaq } from "./ProductFaq";
import { ProductTabs, type ProductTab } from "./ProductTabs";
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
 * The FAQ below it was Tilda's one working block on the page; it is replaced
 * for consistency, and gains the `FAQPage` structured data it never had.
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

  const { specs, calculation, flavors, usage, faq } = detail;

  // Only the sections this product actually has. Every one of the sixteen has
  // all four today, but a page that lost one should lose its tab with it rather
  // than keep an anchor pointing at nothing.
  const tabs: ProductTab[] = [
    { id: SECTION_IDS.specifications, label: "Specifications", present: specs.length > 0 },
    { id: SECTION_IDS.calculation, label: "Calculation", present: Boolean(calculation) },
    { id: SECTION_IDS.flavors, label: "Flavors", present: Boolean(flavors) },
    { id: SECTION_IDS.usage, label: "Usage", present: Boolean(usage) },
  ]
    .filter((tab) => tab.present)
    .map(({ id, label }) => ({ id, label }));

  // Flavour lists run from two names to twenty-one. Two columns only once there
  // are enough to fill them — Tea has three, and split in two the third one
  // sits alone in the middle of the page looking like a mistake.
  const flavorColumns = (flavors?.items.length ?? 0) > 6 ? 2 : 1;
  // How tall each column is, and so the index the second one starts at.
  const flavorRows = Math.ceil((flavors?.items.length ?? 0) / flavorColumns);

  // The page's own column, not the one it is compared against. Every product
  // happens to put it last, but the label is what actually says so.
  const ours = calculation
    ? calculation.columns.reduce(
        (best, column, index) => (/the base/i.test(column) ? index : best),
        calculation.columns.length - 1,
      )
    : -1;

  return (
    <div className={styles.root} style={{ ["--tile" as string]: product.backgroundColor }}>
      {tabs.length > 1 && <ProductTabs tabs={tabs} />}

      {specs.length > 0 && (
        <section id={SECTION_IDS.specifications} className={styles.section}>
          <div className={styles.inner}>
            <h2 className="tbb-visually-hidden">{product.name} specifications</h2>
            <dl className={styles.specs}>
              {specs.map((spec, index) => (
                <Reveal key={spec.label} as="div" className={styles.spec} delay={index * 80}>
                  {spec.icon && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img className={styles.specIcon} src={spec.icon} alt="" width={44} height={44} />
                  )}
                  <dt className={`tbb-label ${styles.specLabel}`}>{spec.label}</dt>
                  <dd className={styles.specValue}>{spec.value}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>
      )}

      {calculation && (
        <section id={SECTION_IDS.calculation} className={`${styles.section} ${styles.tinted}`}>
          <div className={styles.inner}>
            <Reveal as="h2" className={styles.title}>
              {calculation.title}
            </Reveal>

            {/* The table is wider than a phone and is allowed to scroll inside
                its own box, so the page body never scrolls sideways. */}
            <Reveal className={styles.tableWrap} delay={80}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {calculation.columns.map((column, index) => (
                      <th
                        key={column}
                        scope="col"
                        data-ours={index === ours ? "true" : undefined}
                      >
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
            </Reveal>
          </div>
        </section>
      )}

      {flavors && (
        <section id={SECTION_IDS.flavors} className={styles.section}>
          <div className={`${styles.inner} ${styles.flavorLayout}`}>
            <div>
              <Reveal as="h2" className={styles.title}>
                Flavors
              </Reveal>

              {/*
                Two columns filled downwards, the way the block was laid out, so
                the list still reads in its own order. Each name arrives from the
                side its column is on — left column from the left, right column
                from the right — with its rule drawing out ahead of it, and the
                stagger runs by row so the two sides close on the middle
                together.
              */}
              <ul
                className={styles.flavors}
                style={{
                  ["--rows" as string]: flavorRows,
                  ["--columns" as string]: flavorColumns,
                }}
              >
                {flavors.items.map((flavour, index) => {
                  const left = index < flavorRows;
                  const stagger = (index % flavorRows) * 60;

                  return (
                    <Reveal
                      key={flavour}
                      as="li"
                      className={`${styles.flavor} ${left ? styles.fromLeft : styles.fromRight}`}
                      from={left ? "left" : "right"}
                      distance={40}
                      delay={stagger}
                      // The rule is drawn by the stylesheet, so the row's place
                      // in the stagger has to reach it as a value it can read.
                      style={{ ["--row-delay" as string]: `${stagger}ms` }}
                    >
                      <span className={styles.flavorRule} aria-hidden="true" />
                      <span className={styles.flavorName}>{flavour}</span>
                    </Reveal>
                  );
                })}
              </ul>
            </div>

            <Reveal className={styles.custom} delay={120} distance={20}>
              <h3 className={styles.customTitle}>Custom Flavors</h3>
              {flavors.note && <p className={styles.customNote}>{flavors.note}</p>}
              {flavors.cta && (
                <a className={styles.customCta} href={flavors.cta.href}>
                  {flavors.cta.label}
                </a>
              )}
            </Reveal>
          </div>
        </section>
      )}

      {usage && (
        <section id={SECTION_IDS.usage} className={`${styles.section} ${styles.tinted}`}>
          <div className={styles.inner}>
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
              <Reveal delay={140} className={styles.usageFigure}>
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
        </section>
      )}

      {faq.length > 0 && (
        <section id="faq" className={styles.section}>
          <div className={styles.inner}>
            <Reveal as="h2" className={styles.title}>
              Frequently Asked Questions
            </Reveal>
            <ProductFaq entries={faq} />
          </div>

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
