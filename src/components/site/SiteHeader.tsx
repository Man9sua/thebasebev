"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BrandMarkVertical } from "@/components/site/BrandMarkVertical";
import { SiteLink } from "@/components/site/SiteLink";
import { SiteMenu } from "@/components/site/SiteMenu";
import { SiteSearch } from "@/components/site/SiteSearch";
import { ODOO_ACCOUNT_URL } from "@/lib/site-config";
import styles from "./SiteHeader.module.css";

/*
 * An account, not a basket.
 *
 * The bar carried a basket with a count on it, and behind it a native cart and
 * a checkout. The owner's instruction is that this site does not sell — it
 * hands the visitor to the platform that does, per country — so the only thing
 * left for that slot is the way back into an account on that platform. Drawn
 * in the same line as the search beside it rather than taken from a set.
 */
function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5.5 19.5c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" strokeLinecap="round" />
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
  productPage = false,
}: {
  overHero?: boolean;
  productPage?: boolean;
}) {
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [menuSettling, setMenuSettling] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const solid = productPage || !overHero || pastHero;
  const menuSurface = menuOpen || menuClosing;

  useEffect(() => {
    if (!overHero) return;
    const hero = document.querySelector("[data-hero]");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(entry.intersectionRatio < 0.14),
      { threshold: [0, 0.14, 0.5, 1] },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [overHero, pathname]);

  const closeMenu = useCallback(() => {
    setMenuClosing(true);
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!menuClosing) return;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 720;
    const timer = window.setTimeout(() => {
      setMenuClosing(false);
      setMenuSettling(true);
    }, duration);
    return () => window.clearTimeout(timer);
  }, [menuClosing]);

  useEffect(() => {
    if (!menuSettling) return;
    const frame = window.requestAnimationFrame(() => setMenuSettling(false));
    return () => window.cancelAnimationFrame(frame);
  }, [menuSettling]);

  return (
    <>
      <header
        className={[
          styles.header,
          solid || menuSurface || searchOpen ? styles.solid : "",
          menuSurface ? styles.inverted : "",
          menuSurface || menuSettling ? styles.menuSnap : "",
          menuOpen ? styles.open : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-header-theme={menuSurface ? "dark" : solid ? "light" : "hero"}
      >
        <SiteLink href="/" className={styles.logo} aria-label="THE BASE — home">
          <BrandMarkVertical />
        </SiteLink>

        <div className={styles.actions}>
          <SiteLink href="/contacts" className={styles.cta}>
            Get your best deal now
          </SiteLink>
          <a
            href={ODOO_ACCOUNT_URL}
            className={styles.action}
            aria-label="Your account"
            target="_blank"
            rel="noreferrer noopener"
          >
            <AccountIcon />
          </a>

          <button
            type="button"
            className={styles.action}
            onClick={() => {
              setMenuOpen(false);
              setMenuClosing(false);
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
              if (menuOpen) closeMenu();
              else {
                setMenuClosing(false);
                setMenuSettling(false);
                setMenuOpen(true);
              }
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

      <SiteMenu open={menuOpen} onClose={closeMenu} />
      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
