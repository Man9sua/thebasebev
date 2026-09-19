import type { CSSProperties } from "react";
import { Partner } from "@/components/home/Partner";
import { productDesktop } from "@/data/product-desktop";
import { productMargins } from "@/data/product-margins";
import { productMobile } from "@/data/product-mobile";
import type { Product } from "@/data/products";
import { isDark } from "@/lib/contrast";
import { popupAnchorProps } from "@/lib/legacy-popups";
import { productDetails } from "@/lib/site-pages";
import { ProductFaq } from "./ProductFaq";
import styles from "./ProductDetails.module.css";

function Tick() {
  return (
    <svg viewBox="0 0 20 20" fill="none" role="img" aria-label="Included" className={styles.mark}>
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
    <svg viewBox="0 0 20 20" fill="none" role="img" aria-label="Not included" className={styles.mark}>
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

function Arrow() {
  return <span aria-hidden="true">{"\u2192"}</span>;
}

export function ProductDetails({ product }: { product: Product }) {
  const detail = productDetails[product.slug];
  if (!detail) return null;

  const { specs, calculation, flavors, usage, faq } = detail;
  const margin = productMargins[product.slug];
  const desktopTheme = productDesktop[product.slug]?.panel ?? product.backgroundColor;
  const mobileTheme = productMobile[product.slug]?.panel ?? desktopTheme;
  const vars = {
    ["--product-panel" as string]: desktopTheme,
    ["--product-panel-mobile" as string]: mobileTheme,
    ["--product-panel-ink" as string]: isDark(desktopTheme) ? "#ffffff" : "#151515",
    ["--product-panel-ink-mobile" as string]: isDark(mobileTheme) ? "#ffffff" : "#151515",
  } as CSSProperties;

  const ours = calculation
    ? calculation.columns.reduce(
        (best, column, index) => (/the base/i.test(column) ? index : best),
        calculation.columns.length - 1,
      )
    : -1;

  return (
    <div className={styles.root} style={vars}>
      {specs.length > 0 && (
        <section className={styles.metricsSection} aria-labelledby="product-operating-figures">
          <h2 className="tbb-visually-hidden" id="product-operating-figures">
            {product.name} operating figures
          </h2>
          <div className={styles.metrics}>
            {specs.map((spec) => {
              const label = spec.label === "Prep Time" ? "Preparation Time" : spec.label;
              const price = /packaging/i.test(spec.label)
                ? (product.price ?? "Price on request")
                : null;

              return (
                <div key={spec.label} className={styles.metric}>
                  {spec.icon && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className={styles.metricIcon} src={spec.icon} alt="" width={48} height={48} />
                  )}
                  <h3 className={styles.metricTitle}>{label}</h3>
                  <p className={styles.metricValue}>{spec.value}</p>
                  {price && (
                    <p className={styles.metricPrice} aria-label={`Current price ${price}`}>
                      {price}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {calculation && (
        <section className={styles.section} aria-labelledby="product-calculation-title">
          <div className={styles.sectionHeading}>
            <h2 id="product-calculation-title" className={styles.title}>
              {calculation.title}
            </h2>
            <p className={styles.eyebrow}>
              Actual Recipe <strong>VS</strong> Based on THE BASE
            </p>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableWrap} tabIndex={0} aria-label={`${product.name} comparative calculation`}>
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
                  {calculation.rows.map((row, rowIndex) => (
                    <tr key={`${String(row[0])}-${rowIndex}`}>
                      <th scope="row">{String(row[0] ?? "")}</th>
                      {row.slice(1).map((value, index) => (
                        <td
                          key={`${calculation.columns[index + 1]}-${rowIndex}`}
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

            {margin && (
              <dl className={styles.marginSummary}>
                <div>
                  <dt>{margin.legacyLabel}</dt>
                  <dd>{margin.legacy}</dd>
                </div>
                <span aria-hidden="true">VS</span>
                <div data-ours="true">
                  <dt>with THE BASE</dt>
                  <dd>{margin.base}</dd>
                </div>
              </dl>
            )}
          </div>
        </section>
      )}

      {flavors && (
        <section className={`${styles.section} ${styles.flavorSection}`} aria-labelledby="product-flavors-title">
          <div className={styles.flavorCard}>
            <h2 className={styles.title} id="product-flavors-title">
              Flavors
            </h2>
            <ul className={styles.flavors}>
              {flavors.items.map((flavor) => (
                <li key={flavor}>{flavor}</li>
              ))}
            </ul>
          </div>

          <div className={styles.customCard}>
            <h2 className={styles.customTitle}>Custom Flavors</h2>
            {flavors.note && <p className={styles.customNote}>{flavors.note}</p>}
            {flavors.cta && (
              <a className={styles.customCta} href={flavors.cta.href} {...popupAnchorProps(flavors.cta.href)}>
                <span>Get Started Today</span>
                <Arrow />
              </a>
            )}
          </div>
        </section>
      )}

      {usage && (
        <section className={`${styles.section} ${styles.usageCard}`} aria-labelledby="product-usage-title">
          <h2 className={styles.title} id="product-usage-title">
            Usage
          </h2>
          <div className={styles.usageCopy}>
            {usage.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          {usage.image && (
            <div className={styles.usageFigure}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={usage.image} alt={`How to prepare ${product.name}`} loading="lazy" decoding="async" />
            </div>
          )}
        </section>
      )}

      <Partner productName={product.name} />

      {faq.length > 0 && (
        <section id="faq" className={styles.faq} aria-labelledby="product-faq-title">
          <div className={styles.faqInner}>
            <h2 className={styles.title} id="product-faq-title">
              Frequently Asked Questions
            </h2>
            <ProductFaq entries={faq} />
          </div>
        </section>
      )}
    </div>
  );
}
