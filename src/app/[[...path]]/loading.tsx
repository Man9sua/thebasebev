import styles from "./loading.module.css";

/**
 * Route-level skeleton.
 *
 * Every public route is statically generated, so this is never seen on a cold
 * load — it covers client-side navigation, where the next document has to be
 * fetched before anything can render. Without it a link click left the previous
 * page on screen with no acknowledgement.
 *
 * The shapes are deliberately generic: one label, one heading, a paragraph and
 * a card grid. That is the skeleton of most pages on this site, and guessing
 * more precisely per route would mean a layout that jumps when the real content
 * turns out to be shaped differently.
 */
export default function Loading() {
  return (
    <div className="tbb">
      <div className={styles.page} role="status" aria-label="Loading page">
        <div className={`${styles.block} ${styles.label}`} />
        <div className={`${styles.block} ${styles.title}`} />

        <div className={styles.lines}>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className={`${styles.block} ${styles.line}`} />
          ))}
        </div>

        <div className={styles.grid}>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className={`${styles.block} ${styles.card}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
