"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import { BESTSELLER_SLUGS, getProducts } from "@/data/products";
import styles from "./Bestsellers.module.css";

/**
 * Bestsellers, rebuilt to the redesign (9c desktop / 9d mobile).
 *
 * One product at a time on a field of its own colour: the name at display
 * size, the sentence it already carries in the registry, a button into its
 * page and the price it starts at. The pack stands beside the drink it makes,
 * with the two neighbours ghosted behind — the "гармошка" the document draws,
 * which is what says there are more without showing five of everything.
 *
 * It replaces a five-slide carousel that carried its own dots, swipe handling
 * and a scene graph of measured boxes. The images are placed as shares of the
 * frame instead, so there is nothing to measure — but stepping between them is
 * still a move, not a cut.
 *
 * **Everything is mounted, nothing is swapped.** Each product owns a frame
 * holding its own pack and drink, and each owns a pack on the shelf behind.
 * Changing product changes which of them is live; no `src` is ever rewritten.
 * That is what stops the jump: an `img` handed a new `src` loses its intrinsic
 * size for a frame or two, collapses to the box a replaced element falls back
 * to, and snaps open again once the new file decodes.
 *
 * The shelf is dissolved at both edges by a mask rather than by a rectangle of
 * the field colour painted over it. The rectangle was the second half of the
 * same fault: the field is transitioned when the product changes and an
 * overlay built out of it is not, so for the length of every swap it stood on
 * the band as a square of the wrong colour around the product.
 *
 * The order is the registry's `BESTSELLER_SLUGS` — the same five, in the same
 * order, as the slider production runs today.
 */

const PRODUCTS = getProducts(BESTSELLER_SLUGS);

/**
 * Where a product stands relative to the live one, signed and wrapped: -1 and
 * +1 are the neighbours on the shelf, and the sign is what sends a frame out
 * the side it belongs on without anyone having to remember which arrow was
 * pressed.
 */
function offsetFrom(position: number, index: number) {
  const half = Math.floor(PRODUCTS.length / 2);
  let rel = position - index;
  if (rel > half) rel -= PRODUCTS.length;
  if (rel < -half) rel += PRODUCTS.length;
  return rel;
}

function Chevron({ back = false }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d={back ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Bestsellers() {
  const [index, setIndex] = useState(0);
  const panelId = useId();
  const railRef = useRef<HTMLDivElement>(null);

  const product = PRODUCTS[index];
  const step = useCallback(
    (delta: number) => setIndex((current) => (current + delta + PRODUCTS.length) % PRODUCTS.length),
    [],
  );

  /* Left and right move the tab row, which is what a tablist is expected to
     do. The rest of the section is not a keyboard trap. */
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  };

  /* Keep the live tab in view on a phone, where the row scrolls sideways. */
  useEffect(() => {
    const rail = railRef.current;
    const tab = rail?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!rail || !tab) return;
    const left = tab.offsetLeft - (rail.clientWidth - tab.offsetWidth) / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [index]);

  return (
    <section
      id="bestsellers"
      className={styles.section}
      aria-label="Bestsellers"
      /* The field is the product's own colour, mixed well back into paper —
         one value per product from the registry rather than five hand-set
         tints. */
      style={{ ["--tone" as string]: product.backgroundColor }}
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 className={styles.name} id={`${panelId}-name`}>
            {product.hyphenatedName ?? product.name}
          </h2>
          <p className={styles.description}>{product.description}</p>

          <div className={styles.actions}>
            <SiteLink className={styles.cta} href={product.route}>
              Explore {product.name}
            </SiteLink>
            {product.price && (
              <p className={styles.price}>
                <span>from</span>
                <strong>{product.price}</strong>
              </p>
            )}
          </div>
        </div>

        {/*
          The stage. Everything on it is placed as a share of it, so the pack
          and the drink hold their relationship at every width rather than
          being re-measured per breakpoint.
        */}
        <div
          className={styles.stage}
          id={`${panelId}-panel`}
          role="tabpanel"
          aria-labelledby={`${panelId}-name`}
        >
          {/*
            The shelf: all five packs, each parked at its own offset, the two
            beside the live one lit. Stepping slides the whole row along — the
            document's accordion, actually folding.
          */}
          <div className={styles.shelf} aria-hidden="true">
            {PRODUCTS.map((item, position) => {
              const rel = offsetFrom(position, index);
              return (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={item.slug}
                  className={Math.abs(rel) === 1 ? styles.ghostOn : styles.ghost}
                  style={{ ["--rel" as string]: String(rel) }}
                  src={`/images/pack-${item.slug}.webp`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              );
            })}
          </div>

          <span className={styles.groundPack} aria-hidden="true" />
          <span className={styles.groundGlass} aria-hidden="true" />

          {PRODUCTS.map((item, position) => {
            const live = position === index;
            return (
              <div
                key={item.slug}
                className={live ? styles.frameOn : styles.frame}
                style={{ ["--rel" as string]: String(offsetFrom(position, index)) }}
                aria-hidden={!live}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.pack}
                  src={`/images/pack-${item.slug}.webp`}
                  alt={live ? `${item.name} base by THE BASE` : ""}
                  loading="lazy"
                  decoding="async"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.glass}
                  src={`/images/glass-${item.slug}.webp`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </div>
            );
          })}
        </div>

        <div className={styles.foot}>
          <span className={styles.count}>
            {String(index + 1).padStart(2, "0")} / {String(PRODUCTS.length).padStart(2, "0")}
          </span>

          <div
            ref={railRef}
            className={styles.tabs}
            role="tablist"
            aria-label="Bestsellers"
            onKeyDown={onKeyDown}
          >
            {PRODUCTS.map((item, position) => (
              <button
                key={item.slug}
                type="button"
                role="tab"
                className={position === index ? styles.tabActive : styles.tab}
                aria-selected={position === index}
                aria-controls={`${panelId}-panel`}
                tabIndex={position === index ? 0 : -1}
                onClick={() => setIndex(position)}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* The phone gets a progress bar instead of the tab row's underline:
              five labels do not fit, so the row scrolls and the bar is what
              says how far along the five you are. */}
          <div className={styles.progress} aria-hidden="true">
            {PRODUCTS.map((item, position) => (
              <span key={item.slug} className={position === index ? styles.barOn : styles.bar} />
            ))}
          </div>

          <div className={styles.arrows}>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => step(-1)}
              aria-label="Previous product"
            >
              <Chevron back />
            </button>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => step(1)}
              aria-label="Next product"
            >
              <Chevron />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
