import { SiteLink } from "@/components/site/SiteLink";
import styles from "./Signature.module.css";

/**
 * The two offers: a blend of the buyer's own, and a sample box.
 *
 * The design words both cards differently on its phone frame — shorter, and the
 * titles set upper case: "NEED BRAND FLAVOR?" against "Want a Unique Flavor for
 * Your Brand?", "JUST TRY" against "Try Before You Buy". Each card carries both
 * and CSS shows one, the same as the hero's button label. These are a card's
 * lines rather than the page's heading, so wording that follows the width is
 * the design's call to make; the h1 is the one place that cannot move.
 *
 * The design gives neither button a destination. The signature drink goes to
 * the private-label page, which is the one that answers it, and the sample goes
 * to the contact form, where every sample ask on this site lands. Both routes
 * already exist.
 */
function Swap({ wide, narrow }: { wide: string; narrow: string }) {
  return (
    <>
      <span className="tbb-wide-only">{wide}</span>
      <span className="tbb-narrow-only">{narrow}</span>
    </>
  );
}
export function Signature() {
  return (
    <section className={styles.section} aria-label="Work with THE BASE">
      <div className={styles.inner}>
        <article className={`${styles.card} ${styles.cardBrand}`}>
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

          <h2 className={styles.title}>
            <Swap
              wide="Want a Unique Flavor for Your Brand?"
              narrow="NEED BRAND FLAVOR?"
            />
          </h2>
          <p className={styles.copy}>
            <Swap
              wide="We create custom beverage blends tailored to your brand and seasonal trends, helping you stand out."
              narrow="We design exclusive beverages tailored to your brand and seasonal trends"
            />
          </p>

          <SiteLink
            href="/private-labeling"
            className={`${styles.action} tbb-pill tbb-pill-outline-light`}
          >
            <Swap
              wide="Yes, I Want a Signature Drink!"
              narrow="Yes, I need brand taste"
            />
          </SiteLink>
        </article>

        <article className={`${styles.card} ${styles.cardSample}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.photo}
            src="/images/home-sample-card.webp"
            alt=""
            loading="lazy"
          />

          <h2 className={styles.title}>
            <Swap wide="Try Before You Buy" narrow="JUST TRY" />
          </h2>
          <p className={styles.copy}>
            <Swap
              wide="Get a sample box delivered and see how our products can elevate your menu."
              narrow="We will deliver our samplebox"
            />
          </p>

          <SiteLink
            href="/contacts"
            className={`${styles.action} tbb-pill tbb-pill-accent`}
          >
            <Swap wide="Send Me a Sample!" narrow="Yes, I want try before" />
          </SiteLink>
        </article>
      </div>
    </section>
  );
}
