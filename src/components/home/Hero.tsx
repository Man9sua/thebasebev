"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { whenLoadingGateOpens } from "@/components/site/loading-gate";
import { HERO_SLUGS, getProducts } from "@/data/products";
import styles from "./Hero.module.css";

/**
 * Photographic hero.
 *
 * One full-bleed photograph with the copy held on the left against a veil that
 * fades the image out under the type. It replaces the marquee of product cards
 * that stood here before: the rail argued the range, this argues the product.
 *
 * The photograph is syrup rather than a factory or a person — it is what THE
 * BASE actually makes, it carries the brand red without printing it, and being
 * abstract it never competes with the headline for the eye.
 *
 * The h1 is deliberately fixed on Cream Latte. Production's homepage h1 is
 * "Premium / Cream Latte / Bases", so the wording is SEO surface, not a design
 * choice: it must be identical in the server HTML and must not rewrite itself
 * afterwards. `HERO_SLUGS[0]` is the single source for which product that is.
 */

const FEATURED = getProducts(HERO_SLUGS)[0];

/**
 * Decorative, so it carries an empty alt and its wrapper is hidden from the
 * accessibility tree. Everything the section means is in the copy beside it.
 */
const BACKDROP = "/images/tild3239-6265-4237-b866-373233306262__photo-1772986564376-.jpg";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Hero() {
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
   * gate is already open and this runs on the frame after mount.
   * `whenLoadingGateOpens` carries its own timeout, so the hero is never left
   * invisible waiting on a screen that failed to finish.
   */
  useEffect(() => whenLoadingGateOpens(() => setReady(true)), []);

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
      className={`${styles.hero} ${ready ? styles.ready : ""}`}
      data-hero
      aria-label="THE BASE products"
    >
      {/*
        The entrance is armed from JavaScript, so without it every staged
        element would sit at its `opacity: 0` start state forever. This is the
        one case where the hero has to be legible with no script at all.
      */}
      <noscript>
        <style
          dangerouslySetInnerHTML={{
            __html: `.${styles.enter},.${styles.lineInner},.${styles.media}{opacity:1!important;transform:none!important}`,
          }}
        />
      </noscript>

      <div ref={mediaRef} className={styles.media} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.photo} src={BACKDROP} alt="" fetchPriority="high" />
      </div>

      {/* Fades the photograph out from the left so the copy sits on paper
          rather than on syrup. Without it the headline fights the image at
          every scroll position and loses somewhere. */}
      <span className={styles.veil} aria-hidden="true" />

      <div ref={copyRef} className={styles.inner}>
        <div className={styles.copy}>
          <span
            className={`tbb-label ${styles.tagline} ${styles.enter}`}
            style={{ ["--enter-delay" as string]: "180ms" }}
          >
            Dry beverage base
          </span>

          {/* Two rows: "Premium" and "Bases" frame the product name, which
              takes the row below on its own. The reorder is visual — the DOM
              keeps serving "Premium Cream Latte Bases" as one string. */}
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
                className={`${styles.lineInner} ${styles.titleProduct}`}
                style={{ ["--enter-delay" as string]: "400ms" }}
              >
                {FEATURED.name}
              </span>
            </span>{" "}
            <span className={styles.line}>
              <span
                className={`${styles.lineInner} ${styles.titleAffix}`}
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
            {FEATURED.description}
          </p>

          <Link
            href={FEATURED.route}
            className={`${styles.cta} ${styles.enter}`}
            style={{ ["--enter-delay" as string]: "730ms" }}
          >
            Shop {FEATURED.name}
            <ArrowIcon />
          </Link>

          <p
            className={`${styles.badges} ${styles.enter}`}
            style={{ ["--enter-delay" as string]: "820ms" }}
          >
            <span className="tbb-label">From {FEATURED.price ?? "On request"}</span>
            <span className="tbb-label">Halal certified</span>
            <span className="tbb-label">HACCP audited</span>
            <span className="tbb-label">Made in Dubai</span>
          </p>
        </div>
      </div>
    </section>
  );
}
