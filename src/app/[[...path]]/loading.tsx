import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className="tbb" data-route-loading-fallback>
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
