"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import { packBox, productGlass } from "@/data/product-glass";
import productHeroes from "@/data/product-heroes.json";
import { BESTSELLER_SLUGS, getProducts } from "@/data/products";

import styles from "./Bestsellers.module.css";

/**
 * Bestsellers carousel.
 *
 * Composition: the copy has the left column, the rail takes the rest with its
 * controls under it, and the ground is a wash of the slide's own key visual —
 * the same colour its product page stands on, held well back because the cards
 * carry it at full strength.
 *
 * A card is built from the same pieces a product page builds its hero from,
 * rather than from the flat plate the Tilda export shipped; the stylesheet's
 * opening note says what that plate cost and why it went.
 *
 * Slides are stacked and cross-faded rather than remounted: images stay decoded,
 * and switching is pure opacity/transform plus one background-color transition,
 * which is why it reads as a single movement rather than four separate ones.
 */

const PRODUCTS = getProducts(BESTSELLER_SLUGS);
const HEROES = productHeroes as Record<string, { band: string; bandFoot: string }>;
/** Long enough to read a slide, not so long the section feels static. */
const AUTOPLAY_MS = 7000;
/** Slots either side of the centre card, so the rail wraps symmetrically. */
const HALF = Math.floor(PRODUCTS.length / 2);
const SWIPE_THRESHOLD_PX = 44;
const DRAG_INTENT_PX = 10;
const TRACKPAD_IDLE_MS = 180;
const TRACKPAD_LOCK_MS = 420;

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

  const active = PRODUCTS[index];
  const pack = packBox(active.slug);

  const goTo = useCallback((next: number) => {
    setIndex((current) => {
      const resolved = (next + PRODUCTS.length) % PRODUCTS.length;
      if (resolved === current) return current;

      setSwapping(true);
      window.clearTimeout(swapTimer.current);
      swapTimer.current = window.setTimeout(() => setSwapping(false), 260);
      indexRef.current = resolved;
      return resolved;
    });
  }, []);

  useEffect(() => () => window.clearTimeout(swapTimer.current), []);

  // Natural document scrolling owns section visibility, so autoplay follows
  // the section itself instead of an external scene controller.
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

  const completeSwipe = (startX: number, startY: number, endX: number, endY: number) => {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return false;
    }
    goTo(indexRef.current + (deltaX < 0 ? 1 : -1));
    return true;
  };

  const stageRef = useRef<HTMLDivElement>(null);
  const swipe = useRef({ active: false, pointerId: 0, startX: 0, startY: 0 });
  const wheel = useRef({ deltaX: 0, lastAt: 0, lockedUntil: 0 });
  const suppressClick = useRef(false);

  // A horizontal two-finger trackpad gesture has no pointer events. Listen
  // natively so it can be cancelled without React's passive wheel delegation,
  // while a vertical wheel remains ordinary page scroll.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (event: WheelEvent) => {
      const scale =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerWidth
            : 1;
      const deltaX = event.deltaX * scale;
      const deltaY = event.deltaY * scale;

      if (Math.abs(deltaX) < 4 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
      event.preventDefault();

      const now = performance.now();
      if (now - wheel.current.lastAt > TRACKPAD_IDLE_MS) wheel.current.deltaX = 0;
      wheel.current.lastAt = now;
      if (now < wheel.current.lockedUntil) return;

      wheel.current.deltaX += deltaX;
      if (Math.abs(wheel.current.deltaX) < SWIPE_THRESHOLD_PX) return;

      goTo(indexRef.current + (wheel.current.deltaX > 0 ? 1 : -1));
      wheel.current = { deltaX: 0, lastAt: now, lockedUntil: now + TRACKPAD_LOCK_MS };
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [goTo]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    suppressClick.current = false;
    swipe.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = swipe.current;
    if (!gesture.active || gesture.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    if (Math.abs(deltaX) > DRAG_INTENT_PX && Math.abs(deltaX) > Math.abs(deltaY)) {
      suppressClick.current = true;
      event.preventDefault();
    }
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = swipe.current;
    swipe.current = { ...gesture, active: false };
    if (!gesture.active || gesture.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    suppressClick.current =
      completeSwipe(gesture.startX, gesture.startY, event.clientX, event.clientY) ||
      suppressClick.current;
  };

  const onPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    swipe.current = { ...swipe.current, active: false };
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="bestsellers"
      className={styles.section}
      style={{
        ["--band" as string]: HEROES[active.slug]?.band ?? active.backgroundColor,
        ["--band-foot" as string]: HEROES[active.slug]?.bandFoot ?? active.backgroundColor,
        ["--pack-left" as string]: pack.left,
        ["--pack-top" as string]: pack.top,
        ["--pack-width" as string]: pack.width,
        ["--pack-height" as string]: pack.height,
      }}
      aria-roledescription="carousel"
      aria-label="Bestsellers"
      onKeyDown={onKeyDown}
      data-active-product={active.slug}
      data-active-product-index={index}
      data-product-count={PRODUCTS.length}
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

          <p className={`${styles.description} ${styles.swap} ${swapping ? styles.swapOut : ""}`}>
            {active.description}
          </p>

          {/* The price moved off the card and into the copy: on a turned card it
              was unreadable, and the centre one had to carry a row of type that
              held every shot a line shorter than it needed to be. */}
          <p className={`${styles.price} ${styles.swap} ${swapping ? styles.swapOut : ""}`}>
            {active.price ? (
              <>
                <span className="tbb-label">From</span>
                <span className={styles.priceValue}>{active.price}</span>
              </>
            ) : (
              <span className={styles.priceValue}>Price on request</span>
            )}
          </p>

          <SiteLink href={active.route} className={styles.cta}>
            Explore {active.name}
            <Arrow />
          </SiteLink>

          {/* The same claim the three stacked figures made, as one line. It is
              framing for the range rather than a fact about this slide, so it
              sits under the call to action and does not change with it. */}
          <p className={styles.proof}>
            600+ flavours <span aria-hidden="true">·</span> HALAL certified{" "}
            <span aria-hidden="true">·</span> HACCP food safety
          </p>
        </div>

        <div className={styles.showcase}>
          <div
            ref={stageRef}
            className={styles.stage}
            aria-live="polite"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onDragStart={(event) => event.preventDefault()}
            onClickCapture={(event) => {
              if (!suppressClick.current) return;
              suppressClick.current = false;
              event.preventDefault();
              event.stopPropagation();
            }}
            onPointerCancel={onPointerCancel}
          >
            {PRODUCTS.map((product, slide) => {
              // Signed distance from the centre, wrapped so the rail is a loop.
              const forward = (slide - index + PRODUCTS.length) % PRODUCTS.length;
              const slot = forward > HALF ? forward - PRODUCTS.length : forward;
              const depth = Math.abs(slot);
              const isActive = slot === 0;
              const glass = productGlass[product.slug];

              return (
                <div
                  key={product.slug}
                  className={`${styles.slide} ${isActive ? styles.slideActive : ""}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${slide + 1} of ${PRODUCTS.length}: ${product.name} bases`}
                  aria-hidden={!isActive}
                  style={{
                    ["--band" as string]: HEROES[product.slug]?.band ?? product.backgroundColor,
                    ["--band-foot" as string]:
                      HEROES[product.slug]?.bandFoot ?? product.backgroundColor,
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

                  {/*
                  The card, built the way a product page builds its hero: the
                  wordmark behind, the cut-out pouch on the product's own wash,
                  the drink standing in front of it at the box the design
                  measures. It used to be one exported plate per product —
                  1170x1703 with the colour, the mark, both pictures and two
                  certification rosettes all flattened into it. Five of those
                  made this page 8.8 MB, the rosettes were a certifier's artwork
                  nobody here can vouch for, and the flat square could not
                  follow the rest of the site when the design moved on.
                */}
                  <span className={styles.card}>
                    <span className={styles.cardMark} aria-hidden="true" />

                    <span className={styles.cardStage}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className={styles.shot}
                        src={`/images/pack-${product.slug}.webp`}
                        alt={`${product.name} base by THE BASE`}
                        // The coverflow exposes the active card and both
                        // neighbours. Keep those three decoded so a click/swipe
                        // never reveals an empty stage; distant cards stay lazy.
                        loading={depth <= 1 ? "eager" : "lazy"}
                        decoding="async"
                        draggable={false}
                      />

                      {glass?.image && (
                        <span
                          className={styles.cardGlass}
                          style={{
                            ["--glass-left" as string]: glass.left,
                            ["--glass-top" as string]: glass.top,
                            ["--glass-width" as string]: glass.width,
                            ["--glass-height" as string]: glass.height,
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={glass.image}
                            alt=""
                            loading={depth <= 1 ? "eager" : "lazy"}
                            decoding="async"
                            draggable={false}
                          />
                        </span>
                      )}
                    </span>
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
      </div>
    </section>
  );
}
