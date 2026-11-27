import type { CSSProperties, ReactNode } from "react";
import { SampleRequestModal } from "@/components/forms/SampleRequestModal";
import { SiteLink } from "@/components/site/SiteLink";
import { faqPage } from "@/lib/structured-data";
import { NutritionTabs, type NutritionSet } from "./NutritionTabs";
import { AnimatedDetails } from "./AnimatedDetails";
import { ProductShopHero } from "./ProductShopHero";
import styles from "./ProductPage.module.css";

export const cx = (...names: Array<string | false | null | undefined>) => names.filter(Boolean).join(" ");

type WithClass = { className?: string; style?: CSSProperties };

export function productImage(slug: string, name: string, widths: number[]) {
  const base = `/images/products/${slug}/${name}`;
  const sorted = [...widths].sort((a, b) => a - b);
  return {
    src: `${base}-${sorted[sorted.length - 1]}.webp`,
    srcSet: sorted.map((w) => `${base}-${w}.webp ${w}w`).join(", "),
  };
}

export function Responsive({ desktop, mobile }: { desktop: ReactNode; mobile?: ReactNode }) {
  if (mobile === undefined) return <>{desktop}</>;
  return (
    <>
      <span className={styles.desktopOnly}>{desktop}</span>
      <span className={styles.mobileOnly}>{mobile}</span>
    </>
  );
}

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

export function FlavourEnquiryLink({ className, children = "Talk to R&D →" }: { className?: string; children?: ReactNode }) {
  return (
    <SiteLink href="/rnd#rnd-form" className={className ?? styles.textLink}>
      {children}
    </SiteLink>
  );
}

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

export function Hero({ slug, title, lead }: {
  slug: string;
  title: ReactNode;
  lead: { desktop: ReactNode; mobile?: ReactNode };
}) {
  return <ProductShopHero slug={slug} title={title} lead={<Responsive {...lead} />} />;
}

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

export function MarketingKitAction({ href, className }: { href?: string; className?: string }) {
  const actionClass = cx(styles.button, styles.red, className);
  return href ? (
    <a href={href} className={actionClass} download>
      <Responsive desktop="Download kit" mobile="Download marketing kit" />
    </a>
  ) : (
    <SiteLink href="/contacts" className={actionClass}>Request</SiteLink>
  );
}

export function Kit({ href, title = "Marketing kit", text, className }: { href?: string; title?: ReactNode; text: ReactNode; className?: string }) {
  return (
    <div className={cx(styles.kit, className)}>
      <div className={styles.kitCopy}>
        <span className={styles.kitTitle}>{title}</span>
        <span className={styles.kitText}>{text}</span>
      </div>
      <MarketingKitAction href={href} />
    </div>
  );
}

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

export type Flavour = { name: ReactNode; color: string; ink?: string };

export function Flavours({
  items,
  columns = 4,
  own = true,
  className,
}: {
  items: Flavour[];
  columns?: number;
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

export type Question = { q: ReactNode; a: ReactNode };

export function FaqSchema({ items }: { items: Question[] }) {
  if (!items.every((item) => typeof item.q === "string" && typeof item.a === "string")) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqPage(items as { q: string; a: string }[]) }} />;
}

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
  mobileLimit?: number;
  distributor?: boolean;
  sample?: boolean;
  className?: string;
  title?: ReactNode;
  initiallyOpen?: boolean;
  mobileDistributor?: boolean;
}) {
  return (
    <section className={cx(styles.faq, className)} aria-labelledby="product-faq-title">
      <FaqSchema items={items} />
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
          <AnimatedDetails
            key={i}
            className={cx(styles.faqItem, i >= mobileLimit && styles.faqMore)}
            summaryClassName={styles.faqQuestion}
            initiallyOpen={initiallyOpen && i === 0}
            summary={<>{item.q}<span className={styles.faqPlus} aria-hidden="true">+</span></>}
          >
            <p className={styles.faqAnswer}>{item.a}</p>
          </AnimatedDetails>
        ))}
      </div>
      {sample && <SampleButton productName={productName} className={cx(styles.mobileOnly, styles.faqMobileCta)} />}
      {distributor && mobileDistributor && <DistributorLink className={cx(styles.mobileOnly, styles.faqMobileCta)} />}
    </section>
  );
}

export { styles as productPageStyles };
