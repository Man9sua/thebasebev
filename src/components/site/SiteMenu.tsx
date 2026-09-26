"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import { PRODUCTS } from "@/data/products";
import { COMPANY, FOOTER_LINKS, SITE_NAV, SITE_NAV_SECONDARY } from "@/lib/site-config";
import { useOverlay } from "./useOverlay";
import overlay from "./Overlay.module.css";
import styles from "./SiteMenu.module.css";

/**
 * Full-screen navigation, rebuilt to the menu redesign document.
 *
 * What changed from the seven-item list it replaces:
 *
 * - **Ink, not paper.** The panel is the redesign's dark screen, and the bar
 *   above it inverts with it — see the `menuOpen` branch in `SiteHeader.tsx`.
 * - **One screen instead of two.** Four items in Black caps, the range beside
 *   them in two columns, contacts along the foot. Nothing below the fold at
 *   1440 × 900, which is where the products and the phone number used to live.
 * - **Two levels instead of one.** Private label, Resources and Contacts were
 *   three of seven equal 76px headings; they are a quieter row along the foot
 *   now, so the four that matter read as four. The `Enquiries / Contact / Legal`
 *   triptych that used to fill the bottom is one line: the number, WhatsApp, the
 *   region, Terms and Privacy.
 * - **The current page is red**, rather than the whole list dimming on hover.
 * - **The products lose their colour dots.** Eighteen swatches beside eighteen
 *   words is a legend for a chart that is not there.
 *
 * One thing the document asks for and this does not carry: the outlined
 * `Shop ↗` button, external, in a new tab, on the grounds that "магазин
 * работает на другой платформе". On this site it does not — `/catalog`, the
 * cart and the Stripe checkout are all here — so a button promising to leave
 * for another platform would be telling the visitor something untrue. The
 * rename it comes with is carried (`SITE_NAV`); the button waits for a URL.
 *
 * Every href is an existing route: the menu exposes the current site, it does
 * not promise pages that do not exist.
 */

/** Where the products stop being a list and become a `<details>`. */
const WIDE = "(min-width: 64rem)";

export function SiteMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useOverlay(open, onClose, panelRef);

  /**
   * The range is a disclosure on a phone and a plain list on a desktop, and
   * `<details open>` is a DOM attribute rather than something CSS can reach —
   * hiding the summary is not enough, because the browser still collapses the
   * slot. So the attribute is driven from the media query instead.
   *
   * It starts open, which is what the server renders and what the desktop
   * keeps. The narrow case closes it in an effect, and the panel is clipped
   * shut until someone opens the menu, so the correction is never on screen.
   */
  const [productsOpen, setProductsOpen] = useState(true);

  useEffect(() => {
    const query = window.matchMedia(WIDE);
    const apply = () => setProductsOpen(query.matches);

    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  const navLink = (href: string) =>
    `${styles.navLink} ${pathname === href ? styles.current : ""}`;

  return (
    <div
      ref={panelRef}
      className={`${overlay.root} ${overlay.ink} ${open ? overlay.open : ""}`}
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
                  aria-current={pathname === item.href ? "page" : undefined}
                  onClick={onClose}
                >
                  {item.label}
                </SiteLink>
              ))}
            </nav>

            {/* The range production keeps in a hover mega-menu. Carrying every
                one of those links here is also what keeps the internal-link
                count where `smoke:browser` expects it. */}
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
                All <span aria-hidden="true">→</span>
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
            {/* The bar drops its call to action below 1100px, so on a phone the
                foot of the menu is the only place it can be. */}
            <SiteLink href="/contacts" className={styles.footCta} onClick={onClose}>
              Get a quote
            </SiteLink>

            <div className={styles.footLinks}>
              {SITE_NAV_SECONDARY.map((item) => (
                <SiteLink
                  key={item.href}
                  href={item.href}
                  className={`${styles.secondaryLink} ${
                    pathname === item.href ? styles.current : ""
                  }`}
                  aria-current={pathname === item.href ? "page" : undefined}
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
              <span className={styles.footRegion}>UAE · EN</span>
              {/* Where the light version of the document puts them, and the one
                  thing the dark version's foot was missing: Terms and Privacy
                  are reachable from the menu as well as from every footer. */}
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
