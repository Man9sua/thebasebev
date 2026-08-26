"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BESTSELLER_SLUGS, getProducts } from "@/data/products";
import { resizedImage } from "@/lib/images";

import styles from "./Bestsellers.module.css";

/**
 * Bestsellers carousel.
 *
 * Composition: copy on the left, the product dead centre, controls on the
 * right, all of it on a wash of the slide's own `backgroundColor`. The wash is
 * uniform across the section on purpose — see the note in the stylesheet.
 *
 * Slides are stacked and cross-faded rather than remounted: images stay decoded,
 * and switching is pure opacity/transform plus one background-color transition,
 * which is why it reads as a single movement rather than four separate ones.
 */

const PRODUCTS = getProducts(BESTSELLER_SLUGS);
/** Long enough to read a slide, not so long the section feels static. */
const AUTOPLAY_MS = 7000;
/** Slots either side of the centre card, so the rail wraps symmetrically. */
const HALF = Math.floor(PRODUCTS.length / 2);

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
      style={{ ["--field" as string]: active.backgroundColor }}
      aria-roledescription="carousel"
      aria-label="Bestsellers"
      onKeyDown={onKeyDown}
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={`tbb-label ${styles.eyebrow}`}>Bestsellers</span>

          {/* The affixes are wrapped so the stylesheet can place them: bare text
              nodes cannot be given an order. The spaces between the three parts
              stay, so the heading still reads as one string — "Premium <product>
              Bases" — rather than three fragments glued together. */}
          <h2 className={styles.heading}>
            <span className={styles.headingAffix}>Premium</span>{" "}
            <span
              className={`${styles.headingProduct} ${styles.swap} ${
                swapping ? styles.swapOut : ""
              }`}
            >
              {/* Soft-hyphenated where the name is one long word, so it breaks
                  inside the column instead of running out over the artwork. The
                  hyphen is invisible unless the break is taken, and every other
                  use of the name — the dots, the CTA, the slide labels — keeps
                  the plain string. */}
              {active.hyphenatedName ?? active.name}
            </span>{" "}
            <span className={styles.headingAffix}>Bases</span>
          </h2>

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
          {PRODUCTS.map((product, slide) => {
            // Signed distance from the centre, wrapped so the rail is a loop.
            const forward = (slide - index + PRODUCTS.length) % PRODUCTS.length;
            const slot = forward > HALF ? forward - PRODUCTS.length : forward;
            const depth = Math.abs(slot);
            const isActive = slot === 0;

            return (
              <div
                key={product.slug}
                className={`${styles.slide} ${isActive ? styles.slideActive : ""}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${slide + 1} of ${PRODUCTS.length}: ${product.name} bases`}
                aria-hidden={!isActive}
                style={{
                  ["--field" as string]: product.backgroundColor,
                  // Nearer the centre sits nearer the front, and every shot
                  // stays on screen — the whole range is the point of a
                  // coverflow, so nothing is faded out entirely.
                  zIndex: PRODUCTS.length - depth,
                  opacity: 1 - depth * 0.3,
                  transform: `translate3d(${slot * 30}%, 0, 0) scale(${
                    1 - depth * 0.2
                  }) rotateY(${slot * -20}deg)`,
                }}
              >
                {!isActive && (
                  /* Mouse affordance only: it duplicates a control the product
                     list already exposes, so it stays out of the tab order and
                     out of the accessibility tree rather than announcing a
                     second way to do the same thing. */
                  <button
                    type="button"
                    className={styles.pull}
                    onClick={() => goTo(slide)}
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                )}

                {/* The slide's `aria-label` already names the product, so this
                    is the same name a second time and stays out of the
                    accessibility tree. */}
                <span className={styles.name} aria-hidden="true">
                  {product.name}
                </span>

                <span className={styles.media}>
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className={styles.shot}
                      // The plate is 1170x1703 and this draws it about 450 wide;
                      // five of them made the homepage an 8.8 MB page.
                      src={resizedImage(product.image) ?? product.image}
                      alt={`${product.name} base by THE BASE`}
                      // Only the first slide is above the fold on load.
                      loading={slide === 0 ? "eager" : "lazy"}
                      decoding="async"
                      draggable={false}
                    />
                  ) : (
                    <span className={styles.shotFallback} aria-hidden="true">
                      {product.name}
                    </span>
                  )}
                </span>

                {/* Rendered on every slide, shown only on the centre one — the
                    row has to be there either way or the pack shots would sit
                    at different heights across the rail. */}
                <span className={styles.price}>
                  {product.price ? (
                    <>
                      <span className="tbb-label">From</span>
                      <span className={styles.priceValue}>{product.price}</span>
                    </>
                  ) : (
                    <span className={styles.priceValue}>Price on request</span>
                  )}
                </span>
              </div>
            );
          })}
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
