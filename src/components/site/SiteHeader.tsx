"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BrandMarkVertical } from "@/components/site/BrandMarkVertical";
import { CountrySelect } from "@/components/site/CountrySelect";
import { SiteLink } from "@/components/site/SiteLink";
import { SiteMenu } from "@/components/site/SiteMenu";
import { SiteSearch } from "@/components/site/SiteSearch";
import { useCart, useSampleCart } from "@/components/cart/useCart";
import { useCountryCode } from "./useCountryCode";
import { shopKindForCountry } from "@/data/shop";
import { ODOO_ACCOUNT_URL, SHOP_URL } from "@/lib/site-config";
import styles from "./SiteHeader.module.css";

/** Existing Odoo accounts remain available beside the native shopping basket. */
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

function CartIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M4 8h16l-1.4 12H5.4L4 8ZM8 8V6a4 4 0 0 1 8 0v2" strokeLinejoin="round" /></svg>;
}

export function SiteHeader({
  overHero = false,
  productPage = false,
  noHeroScrim = false,
  darkHero = false,
}: {
  overHero?: boolean;
  productPage?: boolean;
  noHeroScrim?: boolean;
  darkHero?: boolean;
}) {
  const pathname = usePathname();
  const country = useCountryCode();
  const cart = useCart();
  const sampleCart = useSampleCart();
  const samples = shopKindForCountry(country) === "samples";
  const basket = samples ? sampleCart : cart;
  const basketCount = basket.items.reduce((sum, item) => sum + item.quantity, 0);
  const onShop = /\/(?:[a-z]{2}\/)?catalog\/?$/i.test(pathname);
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [menuSettling, setMenuSettling] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const solid = productPage || !overHero || pastHero;
  const menuSurface = menuOpen;

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
          noHeroScrim ? styles.noHeroScrim : "",
          darkHero ? styles.darkHero : "",
          solid || menuSurface || searchOpen ? styles.solid : "",
          menuSurface ? styles.inverted : "",
          menuSurface || menuClosing || menuSettling ? styles.menuSnap : "",
          menuOpen ? styles.open : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-header-theme={menuSurface ? "dark" : solid ? "light" : "hero"}
      >
        <SiteLink href="/" className={styles.logo} aria-label="the Base — home">
          <BrandMarkVertical />
        </SiteLink>

        <div className={styles.actions}>
          <SiteLink href="/contacts" className={styles.cta}>
            Get your best deal now
          </SiteLink>
          <SiteLink
            href={`${SHOP_URL}?cart=open`}
            className={styles.action}
            data-cart-control
            aria-label={`${samples ? "Sample box" : "Cart"}, ${basketCount} ${basketCount === 1 ? "item" : "items"}`}
            aria-haspopup={onShop ? "dialog" : undefined}
            onClick={(event) => {
              if (onShop && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
                event.preventDefault();
                setSearchOpen(false);
                setMenuOpen(false);
                window.dispatchEvent(new Event("thebase:open-cart"));
              }
            }}
          >
            <CartIcon />
            {basketCount > 0 && <span className={styles.cartCount}>{basketCount}</span>}
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

          <CountrySelect triggerClassName={styles.action} overlayOpen={menuOpen || searchOpen} />

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

      <SiteMenu open={menuOpen} closing={menuClosing} onClose={closeMenu} />
      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
