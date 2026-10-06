import styles from "./AboutQuality.module.css";

/**
 * About Us, block 2: production and quality control.
 *
 * The figure sits on the real warehouse photo (the Base boxes, the branded
 * tape); the four checks follow the order of production.
 */

const CHECKS = [
  { title: "Raw materials", text: "Every incoming ingredient is inspected." },
  { title: "Manufacturing", text: "The process is controlled on the line." },
  {
    title: "Finished product",
    text: "Checked against the approved reference sample.",
  },
  { title: "Packing", text: "Inspected again when boxed for shipping." },
] as const;

export function AboutQuality() {
  return (
    <section className={styles.section} aria-labelledby="about-quality-title">
      <div className={styles.grid}>
        <figure className={styles.media}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.photo}
            src="/images/about/warehouse-1400.webp"
            srcSet="/images/about/warehouse-960.webp 960w, /images/about/warehouse-1400.webp 1400w, /images/about/warehouse-2048.webp 2048w"
            sizes="(max-width: 1023px) max(calc(100vw - 40px), 454px), 1014px"
            width={1400}
            height={1050}
            alt="The Base warehouse in the UAE"
            loading="lazy"
            decoding="async"
          />
          <figcaption className={styles.stat}>
            <span className={styles.statValue}>1,800 tons</span>
            <span className={styles.statLabel}>Annual production</span>
          </figcaption>
        </figure>

        <div className={styles.copy}>
          <h2 id="about-quality-title" className={styles.title}>
            Four quality checks
          </h2>
          <p className={styles.lead}>
            Every batch passes four checks by our in-house quality team before
            it leaves the factory.
          </p>
          <ol className={styles.checks}>
            {CHECKS.map((check) => (
              <li key={check.title} className={styles.check}>
                <span className={styles.checkTitle}>{check.title}</span>
                <span className={styles.checkText}>{check.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
