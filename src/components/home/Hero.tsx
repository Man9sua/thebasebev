import { SiteLink } from "@/components/site/SiteLink";
import styles from "./Hero.module.css";

/**
 * The first screen, rebuilt to the hero redesign document (8a / 8b).
 *
 * One photograph of THE BASE's own showroom, full bleed, with a white veil
 * drawn across the left two thirds so the heading sits on paper rather than on
 * furniture. WHERE TASTE BEGINS is on the wall in the photograph; it used to be
 * an eyebrow pill above the heading as well, which is the same line twice.
 *
 * What the document and the site review change, and why:
 *
 * - **Two eyebrows become none.** The pill and a letter-spaced "P R E M I U M"
 *   both sat above the h1. The review's note is that the tracking broke the
 *   word into letters and stopped it being read at all; it is part of the
 *   heading now, which is also the wording the page ranks on.
 * - **Two buttons, not one.** The hero offered "Explore the shop" and nothing
 *   for a trade visitor — the only B2B action on the screen was in the bar.
 *   "Request samples" leads in brand red; the shop keeps an outlined second.
 * - **The badge strip goes.** 600+ FLAVOURS · HALAL · HACCP · MADE IN DUBAI
 *   wrapped to two lines with MADE IN DUBAI orphaned, and was set in a grey
 *   under 4.5:1 against the veil. The same four facts are made three more times
 *   further down the page, which is the review's other note about them.
 *
 * The parallax the old hero ran on scroll is gone with it: the document draws a
 * still screen, and the movement was the one thing on the page competing with
 * the heading for attention.
 *
 * The h1 still reads "Premium Beverage Bases" — production's ranking phrase,
 * SEO surface rather than a design choice, identical in the server HTML.
 */
export function Hero() {
  return (
    <section className={styles.hero} data-hero aria-label="THE BASE">
      <div className={styles.media} aria-hidden="true">
        {/*
          Two crops of one photograph — see `build-home-hero.mjs`. The desktop
          frame is the room wide; the phone's band is the stair and the wall.
          `<picture>` rather than `next/image` because the choice is art
          direction, not resolution: one is not a scaled copy of the other.
        */}
        <picture>
          <source
            media="(max-width: 47.9375rem)"
            srcSet="/images/home-hero-room-mobile.webp 780w, /images/home-hero-room-mobile-2x.webp 1170w"
            sizes="100vw"
          />
          <img
            className={styles.photo}
            src="/images/home-hero-room.webp"
            srcSet="/images/home-hero-room.webp 1600w, /images/home-hero-room-2x.webp 2880w"
            sizes="100vw"
            alt=""
            width={1600}
            height={1000}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>

      {/* Carries the photograph into the paper the copy stands on: dense to 40%
          of the width, gone by 66%, which is where the lettering on the wall
          begins. The second is the band under the bar. */}
      <span className={styles.veil} aria-hidden="true" />
      <span className={styles.veilTop} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          {/*
            One word to a row, and the DOM serves the three as one string: a
            `<br>` contributes nothing to `textContent`, so the heading would
            reach `audit:seo-parity` and the smoke as "PremiumBeverageBases" —
            not the phrase production ranks on. Blocks with real spaces between
            them read the same to the eye and correctly to everything else.
          */}
          <h1 className={styles.title}>
            <span className={styles.line}>Premium</span>{" "}
            <span className={styles.line}>Beverage</span>{" "}
            <span className={styles.line}>Bases</span>
          </h1>

          <p className={styles.description}>
            THE BASE crafts dry beverage bases in the UAE for cafés, bars, franchises and
            private label. One full-cycle partner behind the bar, from the recipe to the
            cup.
          </p>

          <div className={styles.actions}>
            <SiteLink href="/contacts" className={styles.primary}>
              Request samples
            </SiteLink>
            <SiteLink href="/catalog" className={styles.ghost}>
              Explore the shop
            </SiteLink>
          </div>
        </div>
      </div>
    </section>
  );
}
