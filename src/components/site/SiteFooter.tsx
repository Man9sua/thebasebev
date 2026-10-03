import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { BrandMarkStacked } from "@/components/site/BrandMarkStacked";
import { SiteLink } from "@/components/site/SiteLink";
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

  if (label === "WhatsApp") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.3 11.8a8.3 8.3 0 0 1-12.2 7.3L3.7 20l.9-4.3a8.3 8.3 0 1 1 15.7-3.9Z" />
        <path d="M8.4 7.8c-.3-.5-.6-.5-.9-.5s-.5 0-.7.3c-.3.3-1 1-.9 2.3.1 1.4 1 2.7 1.2 2.9.2.2 1.9 3 4.7 4.1 2.3.9 2.8.7 3.3.6.5-.2 1.6-.7 1.8-1.4.2-.7.2-1.3 0-1.4-.2-.2-.5-.3-1.1-.6s-1.2-.6-1.4-.7c-.2-.1-.4-.1-.6.2s-.7.8-.9 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.1 8.1 0 0 1-1.5-1.9c-.2-.3 0-.5.1-.6l.5-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.1Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.5 20v-7h2.4l.4-2.8h-2.8V8.4c0-.8.2-1.4 1.4-1.4h1.5V4.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H9V13h2.5v7" />
    </svg>
  );
}

const COLUMNS = [
  { title: "Products", links: FOOTER_LINKS.products },
  { title: "Company", links: FOOTER_LINKS.company },
  { title: "Resources", links: FOOTER_LINKS.resources },
] as const;

/**
 * Global footer, rebuilt to the redesign.
 *
 * The sentence and the two ways to reach a person lead, at the size someone
 * actually looks for them — the email and the phone used to be the same 15px as
 * every link beside them, which made the footer a wall of equal grey. The three
 * link columns sit to the right of them rather than around them.
 *
 * Along the bottom: the copyright, then Sitemap, Terms, Privacy, the cookie
 * dialog and the social accounts, all on one line. Social had its own "Follow"
 * heading inside the Resources column, which read as a fourth kind of resource.
 *
 * Then the mark, as a watermark: the same lockup the header carries, run to the
 * width of the page in two greys a shade off the ground. It used to close the
 * page in paper and brand red at that scale, which is a billboard rather than a
 * signature — see the `--tbb-logo-*` overrides in the stylesheet.
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
            {/* The mark heads its own column, level with the column headings
                beside it, rather than closing the page on a band of its own. */}
            <div className={styles.wordmarkWrap} aria-hidden="true">
              <BrandMarkStacked className={styles.wordmark} />
            </div>

            <p className={styles.statement}>
              Beverage ingredients for HoReCa, retail and private label. Made in UAE.
            </p>
          </div>

          {/* Direct children of the top grid, not wrapped: the row is four
              columns beside the brand, and a wrapper would take one cell and
              then have to re-divide it. */}
          {COLUMNS.map((column) => (
            <div key={column.title} className={styles.column}>
              <span className={styles.columnTitle}>{column.title}</span>
              {column.links.map((item) => (
                <SiteLink key={item.href} className={styles.link} href={item.href}>
                  {item.label}
                </SiteLink>
              ))}
            </div>
          ))}

          {/*
            The two ways to reach a person, and the accounts, as the row's
            fourth column. They used to hang under the statement on the left,
            which left the right of the band empty from the last link down to
            the legal line.
          */}
          <div className={styles.column}>
            <span className={styles.columnTitle}>Contact</span>
            <a className={styles.contactLink} href={COMPANY.emailHref}>
              {COMPANY.email}
            </a>
            <a className={styles.contactLink} href={COMPANY.phoneHref}>
              {COMPANY.phone}
            </a>
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
              <a
                className={styles.socialLink}
                href={COMPANY.whatsappHref}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="WhatsApp"
              >
                <SocialIcon label="WhatsApp" />
                <span className="tbb-visually-hidden">WhatsApp</span>
              </a>
            </span>
          </div>
        </div>

        <div className={styles.legal}>
          <span className={styles.copyright}>
            © {year} {COMPANY.legalName} · {COMPANY.city}, {COMPANY.country}
          </span>

          <span className={styles.legalLinks}>
            {FOOTER_LINKS.legal.map((item) => (
              <SiteLink key={item.href} className={styles.link} href={item.href}>
                {item.label}
              </SiteLink>
            ))}
            {/* The one way back to a choice already made. A consent banner that
                cannot be reopened is a consent banner that cannot be withdrawn. */}
            <CookieSettingsButton className={styles.link} />
          </span>

        </div>

      </div>
    </footer>
  );
}
