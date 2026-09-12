import { SiteLink } from "@/components/site/SiteLink";
import styles from "./Hero.module.css";

/**
 * The hero band.
 *
 * One photograph under the header, the headline over its left, and two links —
 * the composition the homepage design file draws.
 *
 * The second link, "Wholesale & Distribution", sits beside the pill as plain
 * bold text. It is a loose node on the design's canvas rather than a child of
 * the frame, which is why it was missed first time round; the owner asked for
 * it. The design's phone frame has no such link and neither does this at that
 * width — the header's menu carries the same route there, so nothing is lost.
 *
 * The h1 is "Premium Powder Bases for Your Business", which the design sets on
 * the desktop frame. This is SEO surface rather than a design choice, so it is
 * one string in the server HTML and it does not rewrite itself afterwards. Two
 * things follow from that:
 *
 *   - The design's phone frame carries different wording ("Elevate your menu
 *     with our powder bases"). An h1 that changes with the viewport is not an
 *     h1 production can rank, so the desktop line is used at every width.
 *   - `audit:seo-parity` compares this against live production, which still
 *     says "Premium Cream Latte Bases". Expect it to report an h1 mismatch
 *     until production carries the redesign too — the same standing difference
 *     the previous wording had.
 *
 * The ranking phrase, Premium ... Bases, survives both changes.
 *
 * No parallax, no scroll hand-off, no entrance animation: the design is a still
 * frame, and the section it hands off to is now a row of figures rather than a
 * photograph that had to be moved out of the way.
 */
const BACKDROP_WIDE = "/images/home-hero-desktop.webp";
const BACKDROP_NARROW = "/images/home-hero-mobile.webp";

export function Hero() {
  return (
    <section className={styles.hero} data-hero aria-label="THE BASE">
      <div className={styles.band}>
        {/*
         * Decorative: everything the band means is in the copy over it. Two
         * sources rather than one crop, because the design frames the drink to
         * the right of the copy on a desktop and above it on a phone.
         */}
        <picture>
          <source media="(max-width: 767px)" srcSet={BACKDROP_NARROW} />
          <img
            className={styles.photo}
            src={BACKDROP_WIDE}
            alt=""
            fetchPriority="high"
          />
        </picture>

        <span className={`${styles.veil} ${styles.veilLeft}`} aria-hidden />
        <span className={`${styles.veil} ${styles.veilRight}`} aria-hidden />

        <div className={styles.inner}>
          <h1 className={styles.title}>
            Premium Powder Bases for Your Business
          </h1>

          <div className={styles.actions}>
            <SiteLink href="/catalog" className={styles.cta}>
              Shop Now
            </SiteLink>
            <SiteLink href="/distributors" className={styles.aside}>
              Wholesale &amp; Distribution
            </SiteLink>
          </div>
        </div>
      </div>
    </section>
  );
}
