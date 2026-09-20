"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useCart } from "@/components/cart/useCart";
import { BrandLogo } from "@/components/site/BrandLogo";
import { SiteLink } from "@/components/site/SiteLink";
import { SiteMenu } from "@/components/site/SiteMenu";
import { SiteSearch } from "@/components/site/SiteSearch";
import styles from "./SiteHeader.module.css";

/**
 * Global header — minimal by design: mark on the left, actions on the right,
 * centre deliberately empty. Navigation lives behind the burger.
 *
 * The bar starts transparent over the hero and turns to paper once past it, and
 * from then on it stays exactly where it is. It used to slide away on
 * scroll-down and come back on scroll-up, which meant the one element on the
 * page that is supposed to be a fixed point was the one that moved most.
 */

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

/** `rgb()` / `rgba()` as computed by the browser, to three channels. */
function parseColor(value: string) {
  const parts = value.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return null;
  const [red, green, blue] = parts.map(Number);
  const alpha = parts.length > 3 ? Number(parts[3]) : 1;
  return alpha < 0.5 ? null : { red, green, blue };
}

/** Rec. 709 luma, which is all the bar needs to pick ink or paper. */
function isDarkColor({ red, green, blue }: { red: number; green: number; blue: number }) {
  return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255 < 0.5;
}

/**
 * What an element actually paints, if anything.
 *
 * `background-color` is the usual answer, but several surfaces here are
 * gradients — the distributors hero, the Blog's own head — and a gradient
 * leaves `background-color` transparent. Computed styles normalise gradient
 * stops to `rgb()`, so the first stop is readable straight out of the image
 * string, and the first stop is the end of the gradient the bar sits on.
 */
function paintedColor(style: CSSStyleDeclaration) {
  const background = parseColor(style.backgroundColor);
  if (background) return background;

  const image = style.backgroundImage;
  if (image && image.includes("gradient")) {
    const stop = image.match(/rgba?\([^)]*\)/);
    if (stop) return parseColor(stop[0]);
  }

  return null;
}

/**
 * The colour of the page directly under the bar.
 *
 * Read off the document rather than declared per section: every route on this
 * site is some mix of React surfaces and injected export markup, and asking
 * each of them to announce its own paper would mean maintaining that list for
 * ever. A point just below the bar, then up the ancestor chain to the first
 * element that actually paints something — that is what the eye does too.
 *
 * Only a band the width of the page counts. A button, a chip or a card under
 * the sampling point is an object sitting on the surface, not the surface: the
 * first version of this took the black "Request a sample" pill on the homepage
 * and turned the whole bar black for the height of one button.
 */
function surfaceUnderBar(barHeight: number, header: HTMLElement | null) {
  const x = Math.round(window.innerWidth / 2);
  const y = barHeight + 2;
  const fullWidth = window.innerWidth * 0.9;
  let node = document
    .elementsFromPoint(x, y)
    .find((element) => element !== header && !header?.contains(element)) ?? null;

  while (node) {
    if (node.getBoundingClientRect().width >= fullWidth) {
      const color = paintedColor(getComputedStyle(node));
      if (color) return color;
    }
    node = node.parentElement;
  }

  return null;
}

export function SiteHeader({ overHero = false }: { overHero?: boolean }) {
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState(false);
  // Derived, not stored: away from the hero the bar is always solid.
  const solid = !overHero || pastHero;
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cart = useCart();
  const cartCount = cart.items.reduce((count, item) => count + item.quantity, 0);
  const cartHref = cart.ready && cartCount > 0 ? "/checkout" : "/catalog";
  const cartLabel = cartCount
    ? `Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`
    : "Cart";
  // Set while a section that declares itself dark sits under the bar.
  const [onDark, setOnDark] = useState(false);
  // The sampled colour of whatever is under the bar, and whether it is dark.
  const [surface, setSurface] = useState<string | null>(null);
  const [surfaceDark, setSurfaceDark] = useState(false);
  const barRef = useRef<HTMLElement>(null);

  /**
   * Solid state is driven by an IntersectionObserver on the hero rather than by
   * measuring scrollY on every frame. It is cheaper, and it does not depend on
   * `requestAnimationFrame`, which browsers stop servicing in a background tab —
   * that left the bar stuck transparent whenever the page was not in front.
   */
  useEffect(() => {
    // Only a page that actually renders a hero can be over one.
    const hero = overHero ? document.querySelector("[data-hero]") : null;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(entry.intersectionRatio < 0.14),
      { threshold: [0, 0.14, 0.5, 1] },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [overHero, pathname]);

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
          setOnDark(lit.size > 0);
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
  }, [pathname]);

  /**
   * Chameleon: the bar takes the colour of the page it is currently over.
   *
   * The plate used to be white on every route, which is right on the paper
   * pages and wrong everywhere else — a white slab laid across the top of a
   * beige article or a grey band. Sampling costs one `elementFromPoint` and a
   * short walk up the tree per animation frame, throttled to one sample per
   * frame, and the plate's own 620ms colour transition does the rest.
   *
   * Skipped while an overlay is open: the menu and the search own the whole
   * screen, so the bar follows them rather than the page underneath.
   */
  useEffect(() => {
    if (menuOpen || searchOpen) return;

    let frame = 0;

    const sample = () => {
      frame = 0;
      const color = surfaceUnderBar(barRef.current?.offsetHeight ?? 0, barRef.current);
      if (!color) return;
      setSurface(`rgb(${color.red}, ${color.green}, ${color.blue})`);
      setSurfaceDark(isDarkColor(color));
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(sample);
    };

    sample();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [menuOpen, pathname, searchOpen]);

  // A section may declare itself dark even when its top strip is not; the
  // sampled colour catches everything that does not.
  const dark = onDark || surfaceDark;

  // Cart state is native and shared across every route. Empty means catalogue;
  // a populated cart means the dedicated review/checkout page.
  return (
    <>
      <header
        ref={barRef}
        className={[
          styles.header,
          solid || menuOpen || searchOpen ? styles.solid : "",
          // An open overlay owns the whole screen, so the bar follows it
          // rather than whatever section happens to be underneath.
          dark && !menuOpen && !searchOpen ? styles.inverted : "",
          menuOpen ? styles.open : "",
        ]
          .filter(Boolean)
          .join(" ")}
        // Null until the first sample, so the server and the first client
        // render agree and hydration stays quiet.
        style={
          surface && !menuOpen && !searchOpen
            ? ({ "--tbb-header-surface": surface } as CSSProperties)
            : undefined
        }
        data-header-theme={dark ? "dark" : solid ? "light" : "hero"}
      >
        {/* Original Tilda paths, inlined so the small `the` mark can inherit
            the animated header colour without recolouring the red block. */}
        <SiteLink href="/" className={styles.logo} aria-label="THE BASE — home">
          {/* The Tilda runtime on parity routes re-sets src and adds
              decoding/fetchpriority on every img it finds, this one included.
              The rewrite is cosmetic, but React would still read it as a
              mismatch on a node it owns. */}
          <BrandLogo />
        </SiteLink>

        <div className={styles.actions}>
          {/* The design's own call to action — see `.cta`. It is the one thing
              the file's header carries that this bar did not. */}
          <SiteLink href="/contacts" className={styles.cta}>
            Get your best deal now
          </SiteLink>

          <SiteLink
            href={cartHref}
            className={styles.action}
            aria-label={cartLabel}
          >
            <CartIcon />
            {cartCount > 0 && <span className={styles.count}>{cartCount}</span>}
          </SiteLink>

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
