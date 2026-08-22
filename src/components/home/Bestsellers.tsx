"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BESTSELLER_SLUGS, getProducts } from "@/data/products";
import { onColor } from "@/lib/contrast";
import styles from "./Bestsellers.module.css";

/**
 * Bestsellers carousel.
 *
 * Composition: copy on the left, the product dead centre, a colour field on the
 * right. The field takes its colour from `product.backgroundColor`, and so does
 * the pack shot's own background — they are sampled from the same artwork — so
 * the shot melts into the field instead of sitting on it as a rectangle.
 *
 * Slides are stacked and cross-faded rather than remounted: images stay decoded,
 * and switching is pure opacity/transform plus one background-color transition,
 * which is why it reads as a single movement rather than four separate ones.
 *
 * This section carries the page's `h1`. Production's homepage h1 is the active
 * hero slide's product ("Premium / Cream Latte / Bases"), and keeping that shape
 * here is what preserves it through the redesign.
 */

const PRODUCTS = getProducts(BESTSELLER_SLUGS);
/** Long enough to read a slide, not so long the section feels static. */
const AUTOPLAY_MS = 7000;

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path
        d={back ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Bestsellers() {
  const [index, setIndex] = useState(0);
  const [swapping, setSwapping] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const swapTimer = useRef<number | undefined>(undefined);
  // Autoplay reads the current slide from here, so the interval does not have
  // to be torn down and rebuilt on every change.
  const indexRef = useRef(index);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const active = PRODUCTS[index];

  const goTo = useCallback((next: number) => {
    setIndex((current) => {
      const resolved = (next + PRODUCTS.length) % PRODUCTS.length;
      if (resolved === current) return current;

      // Drop the copy out first, then swap it under cover of the fade, so the
      // text never visibly rewrites itself mid-transition.
      setSwapping(true);
      window.clearTimeout(swapTimer.current);
      swapTimer.current = window.setTimeout(() => setSwapping(false), 260);
      return resolved;
    });
  }, []);

  useEffect(() => () => window.clearTimeout(swapTimer.current), []);

  // Advance on its own, but only while the section is actually on screen —
  // a carousel cycling out of view is wasted work and wasted battery.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: number | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearInterval(timer);
        if (entry.isIntersecting) {
          timer = window.setInterval(() => goTo(indexRef.current + 1), AUTOPLAY_MS);
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(section);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, [goTo]);


  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="bestsellers"
      className={styles.section}
      style={{
        ["--field" as string]: active.backgroundColor,
        // Controls sit on the colour field, and the field can be #f1d1b4 or
        // #42080d depending on the slide, so their ink is derived per product.
        ["--on-field" as string]: onColor(active.backgroundColor),
      }}
      aria-roledescription="carousel"
      aria-label="Bestsellers"
      onKeyDown={onKeyDown}
    >
      <span className={styles.field} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={`tbb-label ${styles.eyebrow}`}>Bestsellers</span>

          {/* Production renders this as `Premium<br>{product}<br>Bases`. The
              explicit spaces keep the extracted text identical — the parts are
              block-level, so they are never visible. */}
          <h1 className={styles.heading}>
            Premium{" "}
            <span
              className={`${styles.headingProduct} ${styles.swap} ${
                swapping ? styles.swapOut : ""
              }`}
            >
              {active.name}
            </span>{" "}
            Bases
          </h1>

          <p
            className={`${styles.description} ${styles.swap} ${
              swapping ? styles.swapOut : ""
            }`}
          >
            {active.description}
          </p>

          <div className={styles.specs}>
            <span className={styles.spec}>
              <span className={styles.specValue}>600+</span>
              <span className="tbb-label">Flavours</span>
            </span>
            <span className={styles.spec}>
              <span className={styles.specValue}>HALAL</span>
              <span className="tbb-label">Certified</span>
            </span>
            <span className={styles.spec}>
              <span className={styles.specValue}>HACCP</span>
              <span className="tbb-label">Food safety</span>
            </span>
          </div>

          <Link href={active.route} className={styles.cta}>
            Explore {active.name}
            <Arrow />
          </Link>
        </div>

        <div className={styles.stage} aria-live="polite">
          {PRODUCTS.map((product, slide) => (
            <div
              key={product.slug}
              className={`${styles.slide} ${slide === index ? styles.slideActive : ""}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slide + 1} of ${PRODUCTS.length}: ${product.name} bases`}
              aria-hidden={slide !== index}
              style={{ ["--field" as string]: product.backgroundColor }}
            >
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={styles.shot}
                  src={product.image}
                  alt={`${product.name} base by THE BASE`}
                  // Only the first slide is above the fold on load.
                  loading={slide === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              ) : (
                <span className={styles.shotFallback} aria-hidden="true">
                  {product.name}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className={styles.controls}>
          <div className={styles.arrows}>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => goTo(index - 1)}
              aria-label="Previous product"
            >
              <Arrow back />
            </button>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => goTo(index + 1)}
              aria-label="Next product"
            >
              <Arrow />
            </button>
          </div>

          <div className={styles.dots}>
            {PRODUCTS.map((product, slide) => (
              <button
                key={product.slug}
                type="button"
                className={`${styles.dot} ${slide === index ? styles.dotActive : ""}`}
                onClick={() => goTo(slide)}
                aria-label={`Show ${product.name}`}
                aria-current={slide === index}
              >
                <span className={styles.dotLabel}>{product.name}</span>
                <span className={styles.dotLine} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
