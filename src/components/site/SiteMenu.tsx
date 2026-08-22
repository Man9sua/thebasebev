"use client";

import Link from "next/link";
import { useRef } from "react";
import { COMPANY, FOOTER_LINKS, SITE_NAV } from "@/lib/site-config";
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
      {...(open ? {} : { inert: "" as unknown as boolean })}
    >
      <div className={styles.body}>
        <nav className={styles.nav}>
          {SITE_NAV.map((item, index) => (
            <span
              key={item.href}
              className={styles.item}
              style={{ transitionDelay: open ? `${120 + index * 55}ms` : "0ms" }}
            >
              <Link href={item.href} className={styles.navLink} onClick={onClose}>
                {item.label}
              </Link>
            </span>
          ))}
        </nav>

        <div
          className={`${styles.meta} ${styles.item}`}
          style={{ transitionDelay: open ? `${120 + SITE_NAV.length * 55}ms` : "0ms" }}
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
            <span className="tbb-label">Account</span>
            <Link className={styles.metaLink} href="/cabinet" onClick={onClose}>
              Cabinet
            </Link>
            <Link className={styles.metaLink} href="/contacts" onClick={onClose}>
              Contact us
            </Link>
          </div>

          <div className={styles.metaGroup}>
            <span className="tbb-label">Legal</span>
            {FOOTER_LINKS.legal.map((item) => (
              <Link
                key={item.href}
                className={styles.metaLink}
                href={item.href}
                onClick={onClose}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
