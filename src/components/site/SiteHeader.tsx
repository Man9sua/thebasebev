"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { RegionPicker } from "@/components/site/RegionPicker";
import { SiteMenu } from "@/components/site/SiteMenu";
import { SiteSearch } from "@/components/site/SiteSearch";
import styles from "./SiteHeader.module.css";

/**
 * Global header — minimal by design: mark on the left, actions on the right,
 * centre deliberately empty. Navigation lives behind the burger.
 *
 * The bar starts transparent over the hero and turns to paper once past it, and
 * hides on scroll-down / returns on scroll-up.
 */

type TildaCartWindow = Window & {
  tcart?: { products?: unknown[] };
  tcart__openCart?: () => void;
};

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M6 7h12l-1 12H7L6 7Z" strokeLinejoin="round" />
      <path d="M9.5 9V6.5a2.5 2.5 0 0 1 5 0V9" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="m15.5 15.5 4 4" strokeLinecap="round" />
    </svg>
  );
}

export function SiteHeader({
  overHero = false,
  activeScene,
  footerSceneIndex,
}: {
  overHero?: boolean;
  activeScene?: number;
  footerSceneIndex?: number;
}) {
  const [pastHero, setPastHero] = useState(false);
  const [hidden, setHidden] = useState(false);
  const sceneControlled = activeScene !== undefined;
  // Homepage scene state is authoritative when supplied. Legacy pages retain
  // the intersection-based behavior because they do not have scene markers.
  const solid = !overHero || (sceneControlled ? activeScene > 0 : pastHero);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  // Set while a section that declares itself dark sits under the bar.
  const [observedDark, setObservedDark] = useState(false);
  const onDark = sceneControlled
    ? activeScene === footerSceneIndex
    : observedDark;
  const barRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);

  /**
   * Solid state is driven by an IntersectionObserver on the hero rather than by
   * measuring scrollY on every frame. It is cheaper, and it does not depend on
   * `requestAnimationFrame`, which browsers stop servicing in a background tab —
   * that left the bar stuck transparent whenever the page was not in front.
   */
  useEffect(() => {
    if (sceneControlled) return;
    // Only a page that actually renders a hero can be over one.
    const hero = overHero ? document.querySelector("[data-hero]") : null;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(entry.intersectionRatio < 0.14),
      { threshold: [0, 0.14, 0.5, 1] },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [overHero, sceneControlled]);

  // Direction only — plain arithmetic in the scroll handler, no frame loop.
  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > window.innerHeight * 0.86 && y > lastY.current + 4);
      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * Surface adaptation, as on mercury.com: a thin observation band the height
   * of the bar is pinned to the top of the viewport, and any element that
   * declares `data-surface="dark"` flips the bar to its inverted palette while
   * it is inside that band. The footer is the dark surface today; marking a
   * section is all it takes to add another.
   *
   * The band is expressed as a bottom `rootMargin` that collapses the root to
   * the header strip, so this costs one observer and no scroll maths.
   */
  useEffect(() => {
    if (sceneControlled) return;
    const surfaces = Array.from(document.querySelectorAll("[data-surface='dark']"));
    if (!surfaces.length) return;

    const lit = new Set<Element>();
    let observer: IntersectionObserver | null = null;

    const build = () => {
      observer?.disconnect();
      lit.clear();
      const height = barRef.current?.offsetHeight ?? 0;
      const below = Math.max(window.innerHeight - height, 0);

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) lit.add(entry.target);
            else lit.delete(entry.target);
          }
          setObservedDark(lit.size > 0);
        },
        { rootMargin: `0px 0px -${below}px 0px`, threshold: 0 },
      );

      surfaces.forEach((surface) => observer?.observe(surface));
    };

    build();
    window.addEventListener("resize", build);
    return () => {
      window.removeEventListener("resize", build);
      observer?.disconnect();
    };
  }, [sceneControlled]);

  /**
   * The legacy Tilda cart is the real cart. Where its runtime is on the page
   * (every parity route) the icon opens it and mirrors its count; on the
   * redesigned homepage, which does not load that runtime, it takes the user to
   * the catalog where the cart lives. No second cart is invented.
   */
  useEffect(() => {
    const readCart = () => {
      const tilda = window as TildaCartWindow;
      setCartCount(tilda.tcart?.products?.length ?? 0);
    };

    readCart();
    const timer = window.setInterval(readCart, 1500);
    return () => window.clearInterval(timer);
  }, []);

  const openCart = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    const tilda = window as TildaCartWindow;
    if (typeof tilda.tcart__openCart === "function") {
      event.preventDefault();
      tilda.tcart__openCart();
    }
  }, []);

  return (
    <>
      <header
        ref={barRef}
        className={[
          styles.header,
          solid || menuOpen || searchOpen ? styles.solid : "",
          // An open overlay owns the whole screen, so the bar follows it
          // rather than whatever section happens to be underneath.
          onDark && !menuOpen && !searchOpen ? styles.inverted : "",
          hidden && !menuOpen && !searchOpen ? styles.hidden : "",
          menuOpen ? styles.open : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-header-theme={onDark ? "dark" : solid ? "light" : "hero"}
      >
        {/* The original lockup, lifted verbatim out of the Tilda header and
            saved as public/images/base-logo.svg — the same paths the old site
            shipped, not redrawn and not re-typeset. */}
        <Link href="/" className={styles.logo} aria-label="THE BASE — home">
          {/* The Tilda runtime on parity routes re-sets src and adds
              decoding/fetchpriority on every img it finds, this one included.
              The rewrite is cosmetic, but React would still read it as a
              mismatch on a node it owns. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            suppressHydrationWarning
            src="/images/base-logo.svg"
            alt="THE BASE — Beverage Production"
            width={175}
            height={80}
            draggable={false}
          />
        </Link>

        <div className={styles.actions}>
          {/* Ported from production. Display-only there and here — see
              RegionPicker. Moves into the menu on small screens. */}
          <span className={styles.desktopOnly}>
            <RegionPicker />
          </span>

          <Link
            href="/catalog"
            className={styles.action}
            onClick={openCart}
            aria-label={cartCount ? `Cart, ${cartCount} items` : "Cart"}
          >
            <CartIcon />
            {cartCount > 0 && <span className={styles.count}>{cartCount}</span>}
          </Link>

          <button
            type="button"
            className={styles.action}
            onClick={() => {
              setMenuOpen(false);
              setSearchOpen(true);
            }}
            aria-label="Search"
            aria-expanded={searchOpen}
          >
            <SearchIcon />
          </button>

          <button
            type="button"
            className={styles.action}
            onClick={() => {
              setSearchOpen(false);
              setMenuOpen((open) => !open);
            }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className={styles.burgerBox}>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      <SiteMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
