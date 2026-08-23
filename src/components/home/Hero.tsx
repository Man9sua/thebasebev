"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  HERO_MARQUEE_SLUGS,
  HERO_SLUGS,
  getProducts,
  resolveProductColors,
} from "@/data/products";
import styles from "./Hero.module.css";

/**
 * Marquee hero.
 *
 * Centred copy over an endlessly scrolling rail of the pre-composed product
 * cards. The rail is the range argument — a buyer sees eleven finished products
 * in the first viewport instead of one — while the copy stays a single, static,
 * server-rendered block.
 *
 * The h1 is deliberately fixed on Cream Latte. Production's homepage h1 is
 * "Premium / Cream Latte / Bases", so the wording is SEO surface, not a design
 * choice: it must be identical in the server HTML and must not rewrite itself
 * afterwards. `HERO_SLUGS[0]` is the single source for which product that is.
 *
 * Motion is CSS only — one keyframed transform on the rail plus the staged
 * entrance below. No animation library: nothing here needs per-frame JS, and
 * the Worker bundle stays as small as the rest of the site.
 */

const FEATURED = getProducts(HERO_SLUGS)[0];
const FEATURED_COLORS = resolveProductColors(FEATURED);

/**
 * The rail, resolved once at module scope.
 *
 * Nothing in it depends on render state, so the colours, the alternating tilt
 * and the loading hints are computed here instead of per tile per render.
 */
const TILES = getProducts(HERO_MARQUEE_SLUGS).map((product, position) => ({
  slug: product.slug,
  route: product.route,
  name: product.name,
  image: product.image,
  // Alternating tilt, straightened on hover — the same trick the pack shots use
  // elsewhere: the rail reads as objects laid on a surface, not a filmstrip.
  style: {
    ["--tilt" as string]: position % 2 === 0 ? "-2.5deg" : "3.5deg",
    // Matches the card's own field, so a rounded corner never shows paper.
    ["--tile-bg" as string]: resolveProductColors(product).background,
  } as CSSProperties,
  // Only the first few cards are above the fold on the first paint; the rest
  // scroll in.
  eager: position < 3,
  priority: position === 0,
}));

type Tile = (typeof TILES)[number];

/**
 * The rail is rendered twice back to back and translated by exactly half its
 * width, which is what makes the loop seamless. The second pass is presentation
 * only, so `HeroTile` renders it without an anchor, without alt text and
 * without a tab stop — the same products are not announced or linked twice.
 */
const PASSES = [
  { key: "lead", clone: false },
  { key: "loop", clone: true },
] as const;

function HeroTile({ tile, clone }: { tile: Tile; clone: boolean }) {
  const art = tile.image && (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={styles.tileImage}
      src={tile.image}
      alt={clone ? "" : `${tile.name} base by THE BASE`}
      loading={!clone && tile.eager ? "eager" : "lazy"}
      fetchPriority={!clone && tile.priority ? "high" : undefined}
      decoding="async"
      draggable={false}
    />
  );

  if (clone) {
    return (
      <div className={styles.tile} data-hero-tile style={tile.style} aria-hidden="true">
        {art}
      </div>
    );
  }

  return (
    <Link
      href={tile.route}
      className={styles.tile}
      data-hero-tile
      style={tile.style}
      // Eleven links sit above the fold, each pointing at a legacy parity page
      // that is expensive to render. Left on, Next prefetches all eleven the
      // moment the rail scrolls into view. The Worker already returns
      // intermittent Cloudflare 1102 (CPU limit) under concurrent renders of
      // those pages — measured on staging both with and without this rail — so
      // adding eleven speculative renders to the homepage is bandwidth and CPU
      // spent on a showcase most visitors will not click through. Fetch on
      // click instead.
      prefetch={false}
    >
      {art}
    </Link>
  );
}

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
  const railRef = useRef<HTMLDivElement>(null);

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

  /**
   * Scroll hand-off into Bestsellers: the copy lifts away and the rail settles
   * back as the hero leaves, so the two read as one movement rather than one
   * block ending and another starting.
   *
   * Written straight to `style` in a rAF loop that only runs while the hero is
   * on screen — no state, no render per frame. The rail's own marquee transform
   * lives on the inner track, so nothing here fights it.
   */
  useEffect(() => {
    const hero = heroRef.current;
    const copy = copyRef.current;
    const rail = railRef.current;
    if (!hero || !copy || !rail) return;
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
      rail.style.transform = `scale(${(1 - eased * 0.06).toFixed(4)}) translate3d(0, ${(
        eased * 26
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
      rail.style.transform = "";
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className={`${styles.hero} ${ready ? styles.ready : ""}`}
      data-hero
      aria-label="THE BASE products"
      // The featured product's accent, not its background: the field around the
      // rail stays paper, so only the h1 line and the CTA take a product colour.
      style={{ ["--product-accent" as string]: FEATURED_COLORS.accent }}
    >
      <span className={styles.wash} aria-hidden="true" />

      <div ref={copyRef} className={styles.inner}>
        <div className={styles.copy}>
          <span
            className={`tbb-label ${styles.tagline} ${styles.enter}`}
            style={{ ["--enter-delay" as string]: "380ms" }}
          >
            Dry beverage base
          </span>

          <h1 className={styles.title}>
            <span
              className={`${styles.titleWord} ${styles.enter}`}
              style={{ ["--enter-delay" as string]: "460ms" }}
            >
              Premium
            </span>{" "}
            <span
              className={`${styles.titleProduct} ${styles.enter}`}
              style={{ ["--enter-delay" as string]: "560ms" }}
            >
              {FEATURED.name}
            </span>{" "}
            <span
              className={`${styles.titleWord} ${styles.enter}`}
              style={{ ["--enter-delay" as string]: "660ms" }}
            >
              Bases
            </span>
          </h1>

          <p
            className={`${styles.description} ${styles.enter}`}
            style={{ ["--enter-delay" as string]: "740ms" }}
          >
            {FEATURED.description}
          </p>

          <Link
            href={FEATURED.route}
            className={`${styles.cta} ${styles.enter}`}
            style={{ ["--enter-delay" as string]: "820ms" }}
          >
            Shop {FEATURED.name}
            <ArrowIcon />
          </Link>

          <p
            className={`${styles.badges} ${styles.enter}`}
            style={{ ["--enter-delay" as string]: "900ms" }}
          >
            <span className="tbb-label">From {FEATURED.price ?? "On request"}</span>
            <span className="tbb-label">Halal certified</span>
            <span className="tbb-label">HACCP audited</span>
            <span className="tbb-label">Made in Dubai</span>
          </p>
        </div>
      </div>

      <div
        ref={railRef}
        className={`${styles.marquee} ${styles.enterMarquee}`}
        aria-label="THE BASE product range"
      >
        <div className={styles.track}>
          {PASSES.map((pass) =>
            TILES.map((tile) => (
              <HeroTile key={`${pass.key}-${tile.slug}`} tile={tile} clone={pass.clone} />
            )),
          )}
        </div>
      </div>
    </section>
  );
}
