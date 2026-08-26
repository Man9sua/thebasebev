"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { isLoadingGateOpen, whenLoadingGateOpens } from "@/components/site/loading-gate";
import styles from "./Hero.module.css";

/**
 * Photographic hero.
 *
 * One photograph running the height of the frame from its right edge, with the
 * copy held on the left against a veil that fades the image out under the type.
 *
 * The copy is about the company, not about one product. A hero built on a
 * single base put the homepage's biggest words behind a product the visitor had
 * no reason to have picked yet, and spent the only above-the-fold link on that
 * one page. It now says what THE BASE makes and sends the visitor to the range.
 *
 * The h1 still reads "Premium … Bases" — that is the wording production ranks
 * on, so it is SEO surface rather than a design choice, and it must be
 * identical in the server HTML and must not rewrite itself afterwards. Only the
 * middle of the phrase changed, from a product name to what the company sells.
 */

/**
 * Decorative, so it carries an empty alt and its wrapper is hidden from the
 * accessibility tree. Everything the section means is in the copy beside it.
 *
 * Cropped from the brand key visual: the original has the slogan and the
 * lockup printed into it, and the page already carries both — the header logo
 * and the h1 — so the crop keeps the photograph and drops the artwork.
 */
const BACKDROP = "/images/hero-taste-begins.jpg";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Hero() {
  const [motionArmed, setMotionArmed] = useState(false);
  const [ready, setReady] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  /**
   * Arm the entrance when the loading screen starts pulling away, so the
   * headline rises into a frame the visitor is actually watching instead of
   * having already played behind a curtain.
   *
   * With no loading screen — no JS gate, a repeat view, reduced motion — the
   * stable server render remains visible and no entrance is armed.
   * `whenLoadingGateOpens` carries its own timeout, so an armed hero is never
   * left invisible waiting on a screen that failed to finish.
   */
  useEffect(() => {
    // The server/default render is visible. We only arm hidden start styles
    // when the inline script has already confirmed that a loading curtain is
    // covering the page; if that gate never existed, there is nothing to wait
    // for and no content can get stranded off-screen.
    if (isLoadingGateOpen()) return;

    const frame = requestAnimationFrame(() => setMotionArmed(true));
    const stopWaiting = whenLoadingGateOpens(() => setReady(true));
    return () => {
      cancelAnimationFrame(frame);
      stopWaiting();
    };
  }, []);

  /**
   * Scroll hand-off into Bestsellers: the copy lifts away while the photograph
   * drifts the other way, so the two sections read as one movement rather than
   * one block ending and another starting.
   *
   * Written straight to `style` in a rAF loop that only runs while the hero is
   * on screen — no state, no render per frame.
   */
  useEffect(() => {
    const hero = heroRef.current;
    const copy = copyRef.current;
    const media = mediaRef.current;
    if (!hero || !copy || !media) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let visible = false;

    const tick = () => {
      const rect = hero.getBoundingClientRect();
      // 0 while the hero fills the viewport, 1 once it has fully left.
      const progress = Math.min(1, Math.max(0, -rect.top / window.innerHeight));
      const eased = progress * progress;

      copy.style.transform = `translate3d(0, ${(eased * -70).toFixed(1)}px, 0)`;
      copy.style.opacity = Math.max(0, 1 - progress * 1.6).toFixed(3);
      media.style.transform = `scale(${(1 + eased * 0.06).toFixed(4)}) translate3d(0, ${(
        eased * 34
      ).toFixed(1)}px, 0)`;

      frame = visible ? requestAnimationFrame(tick) : 0;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !frame) frame = requestAnimationFrame(tick);
      },
      { threshold: [0, 0.01, 0.5, 1] },
    );

    observer.observe(hero);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      copy.style.transform = "";
      copy.style.opacity = "";
      media.style.transform = "";
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className={`${styles.hero} ${motionArmed ? styles.motionArmed : ""} ${ready ? styles.ready : ""}`}
      data-hero
      aria-label="THE BASE"
    >
      <div ref={mediaRef} className={styles.media} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.photo} src={BACKDROP} alt="" fetchPriority="high" />
      </div>

      {/* Fades the photograph out from the left so the copy sits on paper
          rather than on glassware. Without it the headline fights the image at
          every scroll position and loses somewhere. */}
      <span className={styles.veil} aria-hidden="true" />

      <div ref={copyRef} className={styles.inner}>
        <div className={styles.copy}>
          <span
            className={`tbb-label ${styles.tagline} ${styles.enter}`}
            style={{ ["--enter-delay" as string]: "180ms" }}
          >
            Where taste begins
          </span>

          {/* One word to a row, each rising out of its own mask. The DOM still
              serves "Premium Cream Latte Bases" as one string, which is the
              wording production ranks on and the string the smoke test reads. */}
          <h1 className={styles.title}>
            <span className={styles.line}>
              <span
                className={`${styles.lineInner} ${styles.titleAffix}`}
                style={{ ["--enter-delay" as string]: "300ms" }}
              >
                Premium
              </span>
            </span>{" "}
            <span className={styles.line}>
              <span
                className={`${styles.lineInner} ${styles.titleLead}`}
                style={{ ["--enter-delay" as string]: "400ms" }}
              >
                Cream Latte
              </span>
            </span>{" "}
            <span className={styles.line}>
              <span
                className={`${styles.lineInner} ${styles.titleLead}`}
                style={{ ["--enter-delay" as string]: "520ms" }}
              >
                Bases
              </span>
            </span>
          </h1>

          <p
            className={`${styles.description} ${styles.enter}`}
            style={{ ["--enter-delay" as string]: "640ms" }}
          >
            THE BASE makes dry beverage bases in Dubai — over 600 flavours for
            cafés, franchises and private label, built from a single scoop so the
            drink tastes the same in every outlet.
          </p>

          <Link
            href="/catalog"
            className={`${styles.cta} ${styles.enter}`}
            style={{ ["--enter-delay" as string]: "730ms" }}
            prefetch={false}
          >
            Explore the catalog
            <ArrowIcon />
          </Link>

          <p
            className={`${styles.badges} ${styles.enter}`}
            style={{ ["--enter-delay" as string]: "820ms" }}
          >
            <span className="tbb-label">600+ flavours</span>
            <span className="tbb-label">Halal certified</span>
            <span className="tbb-label">HACCP audited</span>
            <span className="tbb-label">Made in Dubai</span>
          </p>
        </div>
      </div>
    </section>
  );
}
