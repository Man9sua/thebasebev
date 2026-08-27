"use client";

import { useRef } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import { PRODUCTS } from "@/data/products";
import { COMPANY, FOOTER_LINKS, SITE_NAV } from "@/lib/site-config";
import { RegionPicker } from "./RegionPicker";
import { useOverlay } from "./useOverlay";
import styles from "./Overlay.module.css";

/**
 * Full-screen navigation. Every href is an existing route — the menu exposes
 * the current site, it does not promise pages that do not exist.
 */
export function SiteMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useOverlay(open, onClose, panelRef);

  return (
    <div
      ref={panelRef}
      className={`${styles.root} ${open ? styles.open : ""}`}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      aria-hidden={!open}
      tabIndex={-1}
      // Keeps the panel and everything in it out of the tab order and the
      // accessibility tree while it is clipped away.
      inert={!open}
    >
      <div className={styles.body}>
        <nav className={styles.nav}>
          {SITE_NAV.map((item, index) => (
            <span
              key={item.href}
              className={styles.item}
              style={{ transitionDelay: open ? `${120 + index * 55}ms` : "0ms" }}
            >
              <SiteLink
                href={item.href}
                className={styles.navLink}
                onClick={onClose}
              >
                {item.label}
              </SiteLink>
            </span>
          ))}
        </nav>

        {/* The product grid production keeps in a hover mega-menu. Carrying
            every one of those links here is also what keeps the homepage's
            internal-link count where the SEO audit expects it. */}
        <div
          className={`${styles.products} ${styles.item}`}
          style={{ transitionDelay: open ? `${120 + SITE_NAV.length * 55}ms` : "0ms" }}
        >
          <span className="tbb-label">All products</span>
          <ul className={styles.productList}>
            {PRODUCTS.map((product) => (
              <li key={product.slug}>
                <SiteLink
                  href={product.route}
                  className={styles.productLink}
                  onClick={onClose}
                >
                  <span
                    className={styles.productSwatch}
                    style={{ background: product.backgroundColor }}
                    aria-hidden="true"
                  />
                  {product.name}
                </SiteLink>
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`${styles.meta} ${styles.item}`}
          style={{ transitionDelay: open ? `${160 + SITE_NAV.length * 55}ms` : "0ms" }}
        >
          <div className={styles.metaGroup}>
            <span className="tbb-label">Enquiries</span>
            <a className={styles.metaLink} href={COMPANY.phoneHref}>
              {COMPANY.phone}
            </a>
            <span className={styles.metaLink}>
              {COMPANY.city}, {COMPANY.country}
            </span>
          </div>

          <div className={styles.metaGroup}>
            <span className="tbb-label">Contact</span>
            <SiteLink
              className={styles.metaLink}
              href="/contacts"
              onClick={onClose}
            >
              Contact us
            </SiteLink>
          </div>

          <div className={`${styles.metaGroup} ${styles.metaRegion}`}>
            <span className="tbb-label">Region</span>
            <RegionPicker compact />
          </div>

          <div className={styles.metaGroup}>
            <span className="tbb-label">Legal</span>
            {FOOTER_LINKS.legal.map((item) => (
              <SiteLink
                key={item.href}
                className={styles.metaLink}
                href={item.href}
                onClick={onClose}
              >
                {item.label}
              </SiteLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
