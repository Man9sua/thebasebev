import { SiteLink } from "@/components/site/SiteLink";
import { ZOOM_BOOKING_URL } from "@/components/site/ZoomCallBlock";
import styles from "./ThankYouPage.module.css";

export function ThankYouPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.head} aria-labelledby="thanks-title">
          <span className={styles.label}>Request received</span>

          <h1 id="thanks-title" className={styles.title}>
            Thank you
          </h1>

          <p className={styles.lead}>
            Your request is with our team. We reply within one business day by email or WhatsApp.
          </p>

          <div className={styles.actions}>
            <a
              className={`${styles.button} ${styles.buttonInk}`}
              href={ZOOM_BOOKING_URL}
              target="_blank"
              rel="noreferrer noopener"
            >
              Book a Zoom call
            </a>
            <SiteLink href="/catalog" className={`${styles.button} ${styles.buttonOutline}`}>
              Browse the catalogue
            </SiteLink>
          </div>
        </section>

        <div className={styles.foot}>
          <span className={styles.footLabel}>Need it sooner?</span>
          <a className={styles.footLink} href="mailto:info@thebasebev.com">
            info@thebasebev.com
          </a>
          <a className={styles.footLink} href="tel:+971509890429">
            +971 50 989 0429
          </a>
          <SiteLink href="/" className={`${styles.footLink} ${styles.home}`}>
            Back to home
          </SiteLink>
        </div>
      </div>
    </main>
  );
}
