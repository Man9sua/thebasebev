import { SiteLink } from "@/components/site/SiteLink";
import { COMPANY, FOOTER_LINKS, SOCIAL_LINKS } from "@/lib/site-config";
import styles from "./SiteFooter.module.css";

/**
 * Global footer.
 *
 * Information top-left, then the wordmark as the closing statement: BASE sized
 * off viewport width so it spans the full footer at any breakpoint, and clipped
 * at the baseline rather than fitted, so it reads as a crop instead of a logo
 * that happens to be large.
 *
 * Contacts and social accounts are the real ones from the existing site.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer data-surface="dark" className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <span className="tbb-label">The Base Beverage</span>
            <p className={styles.statement}>
              Dry beverage bases and instant premixes, manufactured in Dubai for
              HoReCa, retail and private label.
            </p>

            <div className={styles.contact}>
              <a className={styles.link} href={COMPANY.emailHref}>
                {COMPANY.email}
              </a>
              <a className={styles.link} href={COMPANY.phoneHref}>
                {COMPANY.phone}
              </a>
              <span className={styles.link} style={{ pointerEvents: "none" }}>
                {COMPANY.city}, {COMPANY.country}
              </span>
            </div>
          </div>

          <div className={styles.column}>
            <span className={`tbb-label ${styles.columnTitle}`}>Products</span>
            {FOOTER_LINKS.products.map((item) => (
              <SiteLink key={item.href} className={styles.link} href={item.href}>
                {item.label}
              </SiteLink>
            ))}
          </div>

          <div className={styles.column}>
            <span className={`tbb-label ${styles.columnTitle}`}>Company</span>
            {FOOTER_LINKS.company.map((item) => (
              <SiteLink key={item.href} className={styles.link} href={item.href}>
                {item.label}
              </SiteLink>
            ))}
          </div>

          <div className={styles.column}>
            <span className={`tbb-label ${styles.columnTitle}`}>Resources</span>
            {FOOTER_LINKS.resources.map((item) => (
              <SiteLink key={item.href} className={styles.link} href={item.href}>
                {item.label}
              </SiteLink>
            ))}

            <span
              className={`tbb-label ${styles.columnTitle}`}
              style={{ marginTop: "1.25rem" }}
            >
              Follow
            </span>
            <span className={styles.social}>
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.href}
                  className={styles.link}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {item.label}
                </a>
              ))}
            </span>
          </div>
        </div>

        <div className={styles.legal}>
          <span>
            © {year} {COMPANY.legalName}. All rights reserved.
          </span>
          <span className={styles.legalLinks}>
            {FOOTER_LINKS.legal.map((item) => (
              <SiteLink key={item.href} className={styles.link} href={item.href}>
                {item.label}
              </SiteLink>
            ))}
          </span>
        </div>

        <div className={styles.wordmarkWrap} aria-hidden="true">
          <p className={styles.wordmark}>BASE</p>
        </div>
      </div>
    </footer>
  );
}
