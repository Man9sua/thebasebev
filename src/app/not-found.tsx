import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <Link className={styles.logo} href="/" aria-label="THE BASE home">
        <span className={styles.the}>the</span>
        <span className={styles.base}>BASE</span>
      </Link>
      <section className={styles.content}>
        <p className={styles.code}>Error 404</p>
        <h1>Page not found</h1>
        <p>The page may have moved, or the address may be incorrect.</p>
        <Link className={styles.button} href="/">
          Return to homepage
        </Link>
      </section>
    </main>
  );
}
