"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import { PRODUCTS } from "@/data/products";
import { publicPath } from "@/lib/site-paths";
import {
  COMPANY,
  FOOTER_LINKS,
  SHOP_URL,
  SITE_NAV,
  SITE_NAV_SECONDARY,
} from "@/lib/site-config";
import { useOverlay } from "./useOverlay";
import overlay from "./Overlay.module.css";
import styles from "./SiteMenu.module.css";

const WIDE = "(min-width: 64rem)";

export function SiteMenu({
  open,
  closing,
  onClose,
}: {
  open: boolean;
  closing: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useOverlay(open, onClose, panelRef);


  const [productsOpen, setProductsOpen] = useState(true);

  useEffect(() => {
    const query = window.matchMedia(WIDE);
    const apply = () => setProductsOpen(query.matches);

    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  const navLink = (href: string) =>
    `${styles.navLink} ${pathname === publicPath(href) ? styles.current : ""}`;

  return (
    <div
      ref={panelRef}
      className={`${overlay.root} ${overlay.ink} ${open ? overlay.open : ""} ${closing ? overlay.closing : ""}`}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      aria-hidden={!open}
      tabIndex={-1}
      inert={!open}
    >
      <div className={overlay.body}>
        <div className={styles.layout}>
          <div className={styles.main}>
            <nav className={`${styles.nav} ${overlay.item}`} aria-label="Main">
              {SITE_NAV.map((item, index) => (
                <SiteLink
                  key={item.href}
                  href={item.href}
                  className={navLink(item.href)}
                  style={{ transitionDelay: open ? `${120 + index * 55}ms` : "0ms" }}
                  aria-current={pathname === publicPath(item.href) ? "page" : undefined}
                  onClick={onClose}
                >
                  {item.label}
                </SiteLink>
              ))}
            </nav>


            <details
              className={`${styles.products} ${overlay.item}`}
              style={{ transitionDelay: open ? `${160 + SITE_NAV.length * 55}ms` : "0ms" }}
              open={productsOpen}
              onToggle={(event) => setProductsOpen(event.currentTarget.open)}
            >
              <summary className={styles.productsHead}>
                <span className={styles.productsLabel}>Products</span>
                <span className={styles.productsMark} aria-hidden="true">
                  +
                </span>
              </summary>

              <SiteLink href="/catalog" className={styles.productsAll} onClick={onClose}>
                All
              </SiteLink>

              <ul className={styles.productList}>
                {PRODUCTS.map((product) => (
                  <li key={product.slug}>
                    <SiteLink
                      href={product.route}
                      className={styles.productLink}
                      onClick={onClose}
                    >
                      {product.name}
                    </SiteLink>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          <div
            className={`${styles.foot} ${overlay.item}`}
            style={{ transitionDelay: open ? `${200 + SITE_NAV.length * 55}ms` : "0ms" }}
          >

            <SiteLink href="/contacts" className={styles.footCta} onClick={onClose}>
              Get a quote
            </SiteLink>


            <a
              className={styles.footShop}
              href={SHOP_URL}
              target="_blank"
              rel="noreferrer noopener"
            >
              Shop <span aria-hidden="true">↗</span>
            </a>

            <div className={styles.footLinks}>
              {SITE_NAV_SECONDARY.map((item) => (
                <SiteLink
                  key={item.href}
                  href={item.href}
                  className={`${styles.secondaryLink} ${
                    pathname === publicPath(item.href) ? styles.current : ""
                  }`}
                  aria-current={pathname === publicPath(item.href) ? "page" : undefined}
                  onClick={onClose}
                >
                  {item.label}
                </SiteLink>
              ))}
            </div>

            <div className={styles.footMeta}>
              <a className={styles.footPhone} href={COMPANY.phoneHref}>
                {COMPANY.phone}
              </a>
              <a
                className={styles.footWhatsapp}
                href={COMPANY.whatsappHref}
                target="_blank"
                rel="noreferrer noopener"
              >
                WhatsApp
              </a>
              <span className={styles.footRegion}>UAE EN</span>

              {FOOTER_LINKS.legal.map((item) => (
                <SiteLink
                  key={item.href}
                  href={item.href}
                  className={styles.footLegal}
                  onClick={onClose}
                >
                  {item.label}
                </SiteLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
