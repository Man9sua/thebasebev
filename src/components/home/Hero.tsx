"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { HERO_SLUGS, getProducts, resolveProductColors } from "@/data/products";
import styles from "./Hero.module.css";

/**
 * Product-first hero.
 *
 * The first viewport is the product: copy left, pack shot dead centre and
 * dominant, metadata right. The background is paper with one soft wash of the
 * product's own colour behind it, so the field works for the product instead of
 * competing with it.
 *
 * Colours come from `resolveProductColors`, never from this component, so the
 * real palette can land in the data without touching any UI.
 *
 * This section carries the page `h1`. Production's homepage h1 is
 * "Premium / Cream Latte / Bases", so the first hero product is cream-latte and
 * that shape survives the redesign.
 */

const PRODUCTS = getProducts(HERO_SLUGS);
/** Slow enough to read a product. This is a hero, not a slideshow. */
const ADVANCE_MS = 9000;

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Hero() {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const swapTimer = useRef<number | undefined>(undefined);

  const active = PRODUCTS[index];
  const colors = resolveProductColors(active);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // Arm the entrance on the frame after mount, so the transition actually runs
  // instead of being collapsed into the first paint.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    // rAF is not serviced in a background tab; this makes sure the hero is
    // never left invisible on a page the user has not looked at yet.
    const fallback = window.setTimeout(() => setReady(true), 400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
    };
  }, []);

  const goTo = useCallback((next: number) => {
    setIndex((current) => {
      const resolved = (next + PRODUCTS.length) % PRODUCTS.length;
      if (resolved === current) return current;
      // Drop the copy out first so the text never visibly rewrites itself.
      setSwapping(true);
      window.clearTimeout(swapTimer.current);
      swapTimer.current = window.setTimeout(() => setSwapping(false), 280);
      return resolved;
    });
  }, []);

  useEffect(() => () => window.clearTimeout(swapTimer.current), []);

  useEffect(() => {
    if (PRODUCTS.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => goTo(indexRef.current + 1), ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [goTo]);

  /**
   * Scroll hand-off into Bestsellers: the product eases back and the copy lifts
   * away as the hero leaves, so the two read as one movement rather than one
   * block ending and another starting.
   *
   * Written straight to `style` in a rAF loop that only runs while the hero is
   * on screen — no state, no render per frame.
   */
  useEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    const copy = copyRef.current;
    if (!hero || !stage || !copy) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let visible = false;

    const tick = () => {
      const rect = hero.getBoundingClientRect();
      // 0 while the hero fills the viewport, 1 once it has fully left.
      const progress = Math.min(1, Math.max(0, -rect.top / window.innerHeight));
      const eased = progress * progress;

      stage.style.transform = `scale(${(1 - eased * 0.12).toFixed(4)}) translate3d(0, ${(
        eased * -40
      ).toFixed(1)}px, 0)`;
      copy.style.transform = `translate3d(0, ${(eased * -60).toFixed(1)}px, 0)`;
      copy.style.opacity = (Math.max(0, 1 - progress * 1.6)).toFixed(3);

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
      stage.style.transform = "";
      copy.style.transform = "";
      copy.style.opacity = "";
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className={`${styles.hero} ${ready ? styles.ready : ""}`}
      data-hero
      aria-label="THE BASE products"
      style={{
        ["--product-bg" as string]: colors.background,
        ["--product-accent" as string]: colors.accent,
      }}
    >
      <span className={styles.wash} aria-hidden="true" />

      <div className={styles.inner}>
        <div ref={copyRef} className={styles.copy}>
          <span
            className={`tbb-label ${styles.category} ${styles.enter}`}
            style={{ ["--enter-delay" as string]: "420ms" }}
          >
            Dry beverage base
          </span>

          <h1
            className={`${styles.title} ${styles.enter}`}
            style={{ ["--enter-delay" as string]: "500ms" }}
          >
            Premium{" "}
            <span
              className={styles.titleProduct}
              style={{ opacity: swapping ? 0 : 1 }}
            >
              {active.name}
            </span>{" "}
            Bases
          </h1>

          <p
            className={`${styles.description} ${styles.enter} ${styles.swap} ${
              swapping ? styles.swapOut : ""
            }`}
            style={{ ["--enter-delay" as string]: "600ms" }}
          >
            {active.description}
          </p>

          <Link
            href={active.route}
            className={`${styles.cta} ${styles.enter}`}
            style={{ ["--enter-delay" as string]: "760ms" }}
          >
            Shop {active.name}
            <ArrowIcon />
          </Link>
        </div>

        <div
          ref={stageRef}
          className={`${styles.stage} ${styles.enterProduct}`}
          aria-live="polite"
        >
          {PRODUCTS.map((product, slide) => (
            <div
              key={product.slug}
              className={`${styles.slide} ${slide === index ? styles.slideActive : ""}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slide + 1} of ${PRODUCTS.length}: ${product.name}`}
              aria-hidden={slide !== index}
            >
              {product.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={styles.shot}
                  src={product.image}
                  alt={`${product.name} base by THE BASE`}
                  // The first product is the largest thing above the fold.
                  loading={slide === 0 ? "eager" : "lazy"}
                  fetchPriority={slide === 0 ? "high" : undefined}
                  decoding="async"
                  draggable={false}
                />
              )}
            </div>
          ))}
        </div>

        <div className={styles.meta}>
          <div
            className={`${styles.metaBlock} ${styles.enter}`}
            style={{ ["--enter-delay" as string]: "660ms" }}
          >
            <span className="tbb-label">From</span>
            <span className={styles.price}>{active.price ?? "On request"}</span>
          </div>

          <div
            className={`${styles.badges} ${styles.enter}`}
            style={{ ["--enter-delay" as string]: "700ms" }}
          >
            <span className="tbb-label">Halal certified</span>
            <span className="tbb-label">HACCP audited</span>
            <span className="tbb-label">Made in Dubai</span>
          </div>

          <div
            className={`${styles.switcher} ${styles.enter}`}
            style={{ ["--enter-delay" as string]: "820ms" }}
          >
            {PRODUCTS.map((product, slide) => (
              <button
                key={product.slug}
                type="button"
                className={`${styles.step} ${slide === index ? styles.stepActive : ""}`}
                onClick={() => goTo(slide)}
                aria-label={`Show ${product.name}`}
                aria-current={slide === index}
              >
                {String(slide + 1).padStart(2, "0")}
                <span className={styles.stepLine} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
