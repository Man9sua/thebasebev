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

export function Bestsellers({
  index,
  isActive,
  onIndexChange,
}: {
  index: number;
  isActive: boolean;
  onIndexChange: (next: number) => void;
}) {
  const [swapping, setSwapping] = useState(false);
  const swapTimer = useRef<number | undefined>(undefined);
  // Autoplay reads the current slide from here, so the interval does not have
  // to be torn down and rebuilt on every change.
  const indexRef = useRef(index);

  useEffect(() => {
    if (indexRef.current !== index) {
      setSwapping(true);
      window.clearTimeout(swapTimer.current);
      swapTimer.current = window.setTimeout(() => setSwapping(false), 260);
    }
    indexRef.current = index;
  }, [index]);

  const active = PRODUCTS[index];

  const goTo = useCallback((next: number) => {
    const resolved = (next + PRODUCTS.length) % PRODUCTS.length;
    if (resolved !== indexRef.current) onIndexChange(resolved);
  }, [onIndexChange]);

  useEffect(() => () => window.clearTimeout(swapTimer.current), []);

  // Advance on its own, but only while the section is actually on screen —
  // Sticky scenes remain geometrically visible under later surfaces, so the
  // shared scene state, not IntersectionObserver, controls autoplay.
  useEffect(() => {
    if (!isActive) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => goTo(indexRef.current + 1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [goTo, isActive]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    }
  };

  const completeSwipe = (startX: number, startY: number, endX: number, endY: number) => {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    if (Math.abs(deltaX) < 44 || Math.abs(deltaX) <= Math.abs(deltaY)) return false;
    goTo(indexRef.current + (deltaX < 0 ? 1 : -1));
    return true;
  };

  const swipe = useRef({ active: false, pointerId: 0, startX: 0, startY: 0 });
  const touch = useRef({ active: false, startX: 0, startY: 0 });
  const suppressClick = useRef(false);
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.pointerType === "touch") return;
    swipe.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = swipe.current;
    swipe.current = { ...gesture, active: false };
    if (!gesture.active || gesture.pointerId !== event.pointerId) return;

    suppressClick.current = completeSwipe(
      gesture.startX,
      gesture.startY,
      event.clientX,
      event.clientY,
    );
  };

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) return;
    const point = event.touches[0];
    touch.current = { active: true, startX: point.clientX, startY: point.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const gesture = touch.current;
    touch.current = { ...gesture, active: false };
    const point = event.changedTouches[0];
    if (!gesture.active || !point) return;
    suppressClick.current = completeSwipe(
      gesture.startX,
      gesture.startY,
      point.clientX,
      point.clientY,
    );
  };

  return (
    <section
      id="bestsellers"
      className={styles.section}
      style={{ ["--field" as string]: active.backgroundColor }}
      aria-roledescription="carousel"
      aria-label="Bestsellers"
      onKeyDown={onKeyDown}
      data-active-product={active.slug}
      data-active-product-index={index}
      data-product-count={PRODUCTS.length}
      data-scene-active={isActive || undefined}
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

          <Link href={active.route} className={styles.cta} prefetch={false}>
            Explore {active.name}
            <Arrow />
          </Link>
        </div>

        <div
          className={styles.stage}
          aria-live="polite"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onDragStart={(event) => event.preventDefault()}
          onClickCapture={(event) => {
            if (!suppressClick.current) return;
            suppressClick.current = false;
            event.preventDefault();
            event.stopPropagation();
          }}
          onPointerCancel={() => {
            swipe.current = { ...swipe.current, active: false };
          }}
          onTouchCancel={() => {
            touch.current = { ...touch.current, active: false };
          }}
        >
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

                {product.price && (
                  <span className={styles.price}>
                    <span className="tbb-label">From</span>
                    <span className={styles.priceValue}>{product.price}</span>
                  </span>
                )}
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
