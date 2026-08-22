"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="12" cy="9" r="3.2" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" strokeLinecap="round" />
    </svg>
  );
}

export function SiteHeader({ overHero = false }: { overHero?: boolean }) {
  const [solid, setSolid] = useState(!overHero);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let frame = 0;

    const read = () => {
      const y = window.scrollY;
      // Over the hero the bar only turns solid once the video is behind it.
      const threshold = overHero ? window.innerHeight * 0.86 : 8;
      setSolid(y > threshold);
      // Never hide while an overlay is open, or near the very top.
      setHidden(y > threshold && y > lastY.current + 4);
      lastY.current = y;
      frame = 0;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [overHero]);

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
        className={[
          styles.header,
          solid || menuOpen || searchOpen ? styles.solid : "",
          hidden && !menuOpen && !searchOpen ? styles.hidden : "",
          menuOpen ? styles.open : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Link href="/" className={styles.logo} aria-label="THE BASE — home">
          <span className={styles.logoMark}>the</span>
          BASE
        </Link>

        <div className={styles.actions}>
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

          <Link
            href="/cabinet"
            className={`${styles.action} ${styles.desktopOnly}`}
            aria-label="Account"
          >
            <AccountIcon />
          </Link>

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
