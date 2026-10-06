import type { CSSProperties, ReactNode } from "react";
import { SampleRequestModal } from "@/components/forms/SampleRequestModal";
import { SiteLink } from "@/components/site/SiteLink";
import { faqPage } from "@/lib/structured-data";
import { NutritionTabs, type NutritionSet } from "./NutritionTabs";
import styles from "./ProductPage.module.css";

/**
 * Building blocks of the redesigned product pages. Each product composes its
 * page from these in `pages/<Product>.tsx`; anything a single mock does
 * differently is passed in as a class or a CSS variable from that page's own
 * module, so the shared defaults stay the matcha baseline.
 */

export const cx = (...names: Array<string | false | null | undefined>) => names.filter(Boolean).join(" ");

type WithClass = { className?: string; style?: CSSProperties };

/** `/images/products/<slug>/<name>-<w>.webp` at every width that was generated. */
export function productImage(slug: string, name: string, widths: number[]) {
  const base = `/images/products/${slug}/${name}`;
  const sorted = [...widths].sort((a, b) => a - b);
  return {
    src: `${base}-${sorted[sorted.length - 1]}.webp`,
    srcSet: sorted.map((w) => `${base}-${w}.webp ${w}w`).join(", "),
  };
}

/** Desktop copy and the mock's shorter phone copy, from one DOM. */
export function Responsive({ desktop, mobile }: { desktop: ReactNode; mobile?: ReactNode }) {
  if (mobile === undefined) return <>{desktop}</>;
  return (
    <>
      <span className={styles.desktopOnly}>{desktop}</span>
      <span className={styles.mobileOnly}>{mobile}</span>
    </>
  );
}

/* ---------------- actions ---------------- */

/** The free-sample form: the shared native modal and lead pipeline. */
export function SampleButton({ productName, className }: { productName: string; className?: string }) {
  return <SampleRequestModal className={cx(styles.button, styles.red, className)} productName={productName} />;
}

export function DistributorLink({ className, children = "Find your distributor" }: { className?: string; children?: ReactNode }) {
  return (
    <SiteLink href="/find-your-distributor" className={cx(styles.button, styles.outline, className)}>
      {children}
    </SiteLink>
  );
}

/** Open the R&D brief, rather than the legacy custom-flavour popup. */
export function FlavourEnquiryLink({ className, children = "Talk to R&D →" }: { className?: string; children?: ReactNode }) {
  return (
    <SiteLink href="/rnd#rnd-form" className={className ?? styles.textLink}>
      {children}
    </SiteLink>
  );
}

/* ---------------- structure ---------------- */

export function Section({
  title,
  side,
  children,
  className,
  style,
  label,
}: WithClass & { title: ReactNode; side?: ReactNode; children?: ReactNode; label: string }) {
  return (
    <section className={cx(styles.section, className)} style={style} aria-label={label}>
      {side ? (
        <div className={styles.sectionHead}>
          <h2 className={styles.title}>{title}</h2>
          <p className={cx(styles.side, styles.desktopOnly)}>{side}</p>
        </div>
      ) : (
        <h2 className={styles.title}>{title}</h2>
      )}
      {children}
    </section>
  );
}

/** "Catalogue / <product>", over the hero title. `BreadcrumbList` mirrors it. */
export function Breadcrumbs({ current, className }: { current: ReactNode; className?: string }) {
  return (
    <nav className={cx(styles.crumbs, className)} aria-label="Breadcrumb">
      <SiteLink href="/catalog">Catalogue</SiteLink>
      <span aria-hidden="true"> / </span>
      <span aria-current="page">{current}</span>
    </nav>
  );
}

export function Hero({
  productName,
  title,
  lead,
  image,
  className,
  style,
  mediaClassName,
}: WithClass & {
  productName: string;
  title: ReactNode;
  lead: { desktop: ReactNode; mobile?: ReactNode };
  image: ReactNode;
  mediaClassName?: string;
}) {
  return (
    <section className={cx(styles.hero, className)} style={style} aria-labelledby="product-title">
      <div className={styles.heroCopy}>
        <Breadcrumbs current={productName} />
        <h1 id="product-title" className={styles.heroTitle}>
          {title}
        </h1>
        <p className={styles.heroLead}>
          <Responsive {...lead} />
        </p>
        <div className={styles.heroActions}>
          <SampleButton productName={productName} />
          <DistributorLink />
        </div>
      </div>
      <div className={cx(styles.heroMedia, mediaClassName)}>{image}</div>
    </section>
  );
}

/* ---------------- 02 stats ---------------- */

export type Stat = { value: ReactNode; label: ReactNode };

export function Stats({ items, columns = 3, className }: { items: Stat[]; columns?: number; className?: string }) {
  return (
    <div className={cx(styles.stats, className)} style={{ "--cols": columns } as CSSProperties}>
      {items.map((item, i) => (
        <div key={i} className={styles.stat}>
          <span className={styles.statValue}>{item.value}</span>
          <span className={styles.statLabel}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- 03 menu ---------------- */

export type Tile = { src: string; srcSet?: string; alt: string };

export function Tiles({ items, columns = 5, sizes, className }: { items: Tile[]; columns?: number; sizes?: string; className?: string }) {
  return (
    <div className={cx(styles.tiles, className)} style={{ "--cols": columns } as CSSProperties}>
      {items.map((tile, i) => (
        <div key={i} className={styles.tile}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tile.src}
            srcSet={tile.srcSet}
            sizes={sizes ?? `(max-width: 1023px) 150px, calc((min(100vw, 1440px) - 192px) / ${columns})`}
            alt={tile.alt}
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}

/**
 * The marketing-kit band. Rendered only when a real file is configured — the
 * mocks draw it, but a "Download" that leads nowhere is worse than none.
 */
export function Kit({ href, title = "Marketing kit", text, className }: { href?: string; title?: ReactNode; text: ReactNode; className?: string }) {
  if (!href) return null;
  return (
    <div className={cx(styles.kit, className)}>
      <div className={styles.kitCopy}>
        <span className={styles.kitTitle}>{title}</span>
        <span className={styles.kitText}>{text}</span>
      </div>
      <a href={href} className={cx(styles.button, styles.red)} download>
        <Responsive desktop="Download kit" mobile="Download marketing kit" />
      </a>
    </div>
  );
}

/* ---------------- 04 prepare ---------------- */

export type Step = { label: ReactNode; value: ReactNode; dark?: boolean };

export function Steps({ items, columns, className }: { items: Step[]; columns?: number; className?: string }) {
  return (
    <div className={cx(styles.steps, className)} style={{ "--cols": columns ?? items.length } as CSSProperties}>
      {items.map((step, i) => (
        <div key={i} className={cx(styles.step, step.dark && styles.stepDark)}>
          <span className={styles.stepLabel}>{step.label}</span>
          <span className={styles.stepValue}>{step.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- 05 flavours ---------------- */

export type Flavour = { name: ReactNode; color: string; ink?: string };

export function Flavours({
  items,
  columns = 4,
  own = true,
  className,
}: {
  items: Flavour[];
  columns?: number;
  /** The "Your own flavour / Talk to R&D" card at the end of the grid. */
  own?: boolean;
  className?: string;
}) {
  return (
    <>
      <div className={cx(styles.flavours, className)} style={{ "--cols": columns } as CSSProperties}>
        {items.map((flavour, i) => (
          <div key={i} className={styles.flavour} style={{ background: flavour.color, color: flavour.ink }}>
            <span className={styles.flavourName}>{flavour.name}</span>
          </div>
        ))}
        {own && (
          <div className={cx(styles.ownFlavour, styles.desktopOnly)}>
            <span className={styles.ownFlavourTitle}>Your own flavour</span>
            <FlavourEnquiryLink />
          </div>
        )}
      </div>
      {own && (
        <FlavourEnquiryLink className={cx(styles.textLink, styles.mobileOnly)}>
          Your own flavour: talk to R&amp;D →
        </FlavourEnquiryLink>
      )}
    </>
  );
}

/* ---------------- 06 inside the pack ---------------- */

export type { NutritionSet };

export function Info({
  title,
  text,
  mobile,
  background,
  titleColor,
  textColor,
}: {
  title: ReactNode;
  text: ReactNode;
  /** The phone's one-line version, e.g. "<b>Allergens:</b> contains milk protein." */
  mobile?: ReactNode;
  background: string;
  titleColor: string;
  textColor: string;
}) {
  return (
    <div className={styles.info} style={{ background }}>
      <span className={cx(styles.infoTitle, mobile !== undefined && styles.desktopOnly)} style={{ color: titleColor }}>
        {title}
      </span>
      <span className={cx(styles.infoText, mobile !== undefined && styles.desktopOnly)} style={{ color: textColor }}>
        {text}
      </span>
      {mobile !== undefined && (
        <span className={cx(styles.infoMobile, styles.mobileOnly)} style={{ color: textColor }}>
          {mobile}
        </span>
      )}
    </div>
  );
}

export function Shelf({
  value,
  text,
  mobileText,
  certifications,
  specHref,
  className,
}: {
  value: ReactNode;
  text: ReactNode;
  mobileText?: ReactNode;
  certifications?: ReactNode;
  /** Shown only when the PDF exists. */
  specHref?: string;
  className?: string;
}) {
  return (
    <div className={cx(styles.shelf, className)}>
      <span className={styles.shelfValue}>{value}</span>
      <span className={styles.shelfText}>
        <Responsive desktop={text} mobile={mobileText} />
      </span>
      {certifications && <span className={cx(styles.shelfCerts, styles.desktopOnly)}>{certifications}</span>}
      {specHref && (
        <a href={specHref} className={cx(styles.textLink, styles.desktopOnly)}>
          Download specification (PDF) →
        </a>
      )}
    </div>
  );
}

export function Inside({
  sets,
  side,
  className,
  title = "Inside the pack",
  tableTitle,
  fullMobile,
}: {
  sets: NutritionSet[];
  side: ReactNode;
  className?: string;
  title?: ReactNode;
  tableTitle?: string;
  fullMobile?: boolean;
}) {
  return (
    <NutritionTabs title={title} sets={sets} side={side} className={className} tableTitle={tableTitle} fullMobile={fullMobile} />
  );
}

/* ---------------- 07 FAQ ---------------- */

export type Question = { q: ReactNode; a: ReactNode };

export function Faq({
  productName,
  items,
  line = "Ready to try it in your café?",
  mobileLimit = 5,
  distributor = true,
  sample = true,
  className,
  title = "Questions",
  initiallyOpen = true,
  mobileDistributor = false,
}: {
  productName: string;
  items: Question[];
  line?: ReactNode;
  /** The phone shows the first few questions only. */
  mobileLimit?: number;
  distributor?: boolean;
  /** False drops both sample buttons, for a page that sells nothing to sample. */
  sample?: boolean;
  className?: string;
  title?: ReactNode;
  initiallyOpen?: boolean;
  mobileDistributor?: boolean;
}) {
  return (
    <section className={cx(styles.faq, className)} aria-labelledby="product-faq-title">
      {/* FAQPage, when every question and answer is plain text — the same
          words the page shows, so the markup never claims what is not there. */}
      {items.every((item) => typeof item.q === "string" && typeof item.a === "string") && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: faqPage(items as { q: string; a: string }[]) }}
        />
      )}
      <div className={styles.faqAside}>
        <h2 id="product-faq-title" className={styles.title}>
          {title}
        </h2>
        {line && <p className={cx(styles.side, styles.desktopOnly)}>{line}</p>}
        {(sample || distributor) && (
          <div className={cx(styles.faqActions, styles.desktopOnly)}>
            {sample && <SampleButton productName={productName} />}
            {distributor && <DistributorLink />}
          </div>
        )}
      </div>
      <div className={styles.faqList}>
        {items.map((item, i) => (
          <details key={i} className={cx(styles.faqItem, i >= mobileLimit && styles.faqMore)} open={initiallyOpen && i === 0}>
            <summary className={styles.faqQuestion}>
              {item.q}
              <span className={styles.faqPlus} aria-hidden="true">
                +
              </span>
            </summary>
            <p className={styles.faqAnswer}>{item.a}</p>
          </details>
        ))}
      </div>
      {sample && <SampleButton productName={productName} className={cx(styles.mobileOnly, styles.faqMobileCta)} />}
      {distributor && mobileDistributor && <DistributorLink className={cx(styles.mobileOnly, styles.faqMobileCta)} />}
    </section>
  );
}

export { styles as productPageStyles };
