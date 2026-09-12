import { SiteLink } from "@/components/site/SiteLink";
import styles from "./Signature.module.css";

/**
 * The two offers: a blend of the buyer's own, and a sample box.
 *
 * The design gives neither button a destination. The signature drink goes to
 * the private-label page, which is the one that answers it, and the sample goes
 * to the contact form, where every sample ask on this site lands. Both routes
 * already exist.
 */
export function Signature() {
  return (
    <section className={styles.section} aria-label="Work with THE BASE">
      <div className={styles.inner}>
        <article className={styles.card}>
          <picture>
            <source
              media="(max-width: 859px)"
              srcSet="/images/home-signature-mobile.webp"
            />
            <img
              className={styles.photo}
              src="/images/home-signature-card.webp"
              alt=""
              loading="lazy"
            />
          </picture>
          <span className={styles.scrim} aria-hidden />

          <h2 className={styles.title}>Want a Unique Flavor for Your Brand?</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.rule} src="/images/icons/section-rule.svg" alt="" />
          <p className={styles.copy}>
            We create custom beverage blends tailored to your brand and seasonal
            trends, helping you stand out.
          </p>

          <SiteLink
            href="/private-labeling"
            className={`${styles.action} tbb-pill tbb-pill-outline-light`}
          >
            Yes, I Want a Signature Drink!
          </SiteLink>
        </article>

        <article className={styles.card}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.photo}
            src="/images/home-sample-card.webp"
            alt=""
            loading="lazy"
          />
          <span className={styles.scrim} aria-hidden />

          <h2 className={styles.title}>Try Before You Buy</h2>
          <p className={styles.copy}>
            Get a sample box delivered and see how our products can elevate your
            menu.
          </p>

          <SiteLink
            href="/contacts"
            className={`${styles.action} tbb-pill tbb-pill-accent`}
          >
            Send Me a Sample!
          </SiteLink>
        </article>
      </div>
    </section>
  );
}
