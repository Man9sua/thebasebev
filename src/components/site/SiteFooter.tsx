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
      <svg className={styles.whatsappIcon} viewBox="0 0 32 32" aria-hidden="true">
        <path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z" />
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
            © {year} {COMPANY.legalName} {COMPANY.city}, {COMPANY.country}
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
