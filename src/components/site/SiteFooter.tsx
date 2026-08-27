import Link from "next/link";
import { COMPANY, FOOTER_LINKS, SOCIAL_LINKS } from "@/lib/site-config";
import styles from "./SiteFooter.module.css";

function SocialIcon({ label }: { label: string }) {
  if (label === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle
          cx="17.5"
          cy="6.7"
          r="0.8"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    );
  }

  if (label === "LinkedIn") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="6.1" cy="6.2" r="1.3" fill="currentColor" stroke="none" />
        <path d="M5 9.2v9.5M10 18.7v-9.5m0 4.2c.7-2.8 6.8-3.8 6.8 1.6v3.7" />
      </svg>
    );
  }

  if (label === "YouTube") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 7.3c-.2-1-1-1.8-2-2-1.7-.5-10.3-.5-12 0-1 .2-1.8 1-2 2-.5 1.8-.5 7.6 0 9.4.2 1 1 1.8 2 2 1.7.5 10.3.5 12 0 1-.2 1.8-1 2-2 .5-1.8.5-7.6 0-9.4Z" />
        <path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.5 20v-7h2.4l.4-2.8h-2.8V8.4c0-.8.2-1.4 1.4-1.4h1.5V4.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H9V13h2.5v7" />
    </svg>
  );
}

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
              <Link key={item.href} className={styles.link} href={item.href} prefetch={false}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className={styles.column}>
            <span className={`tbb-label ${styles.columnTitle}`}>Company</span>
            {FOOTER_LINKS.company.map((item) => (
              <Link key={item.href} className={styles.link} href={item.href} prefetch={false}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className={styles.column}>
            <span className={`tbb-label ${styles.columnTitle}`}>Resources</span>
            {FOOTER_LINKS.resources.map((item) => (
              <Link key={item.href} className={styles.link} href={item.href} prefetch={false}>
                {item.label}
              </Link>
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
                  className={styles.socialLink}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={item.label}
                >
                  <SocialIcon label={item.label} />
                  <span className="tbb-visually-hidden">{item.label}</span>
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
              <Link key={item.href} className={styles.link} href={item.href} prefetch={false}>
                {item.label}
              </Link>
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
