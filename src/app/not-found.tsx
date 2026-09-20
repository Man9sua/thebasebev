import { SiteLink } from "@/components/site/SiteLink";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <SiteLink className={styles.logo} href="/" aria-label="THE BASE home">
        <span className={styles.the}>the</span>
        <span className={styles.base}>BASE</span>
      </SiteLink>
      <section className={styles.content}>
        <p className={styles.code}>Error 404</p>
        <h1>Page not found</h1>
        <p>The page may have moved, or the address may be incorrect.</p>
        <SiteLink className={styles.button} href="/">
          Return to homepage
        </SiteLink>
      </section>
    </main>
  );
}
