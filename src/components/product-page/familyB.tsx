import type { CSSProperties, ReactNode } from "react";
import { DistributorLink, FlavourEnquiryLink, Responsive, SampleButton, cx, productPageStyles as styles } from "./blocks";
import fb from "./familyB.module.css";

/**
 * "Family B" product pages (garnish, vending, sugar-syrup): the whole page sits
 * on one tint, numbered step cards with the second one black, white flavour
 * cards with a colour swatch, a black R&D band and a two-column "Inside the
 * pack" without tabs. The pieces live here once; each page passes its values.
 *
 * Class names here avoid "title", "card", "tile", "btn", "number", "descr" and
 * "heading": the export's custom.css restyles any class containing them.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** Page root: the tint is the page background and the FAQ "+" circles. */
export function FamilyPage({ tint, children }: { tint: string; children: ReactNode }) {
  return (
    <main
      className={cx(styles.page, fb.page)}
      style={{ "--pp-bg": tint, "--pp-hero-lead": "#3A3835", "--fb-tint": tint } as Vars}
    >
      {children}
    </main>
  );
}

/* ---------------- hero ---------------- */

export function FamilyHero({
  productName,
  title,
  lead,
  image,
  media,
  top = 24,
  mobileTitleSize = 64,
}: {
  productName: string;
  title: ReactNode;
  lead: { desktop: ReactNode; mobile?: ReactNode };
  image: ReactNode;
  /**
   * `bare`: a cut-out straight on the tint (garnish). `contain`: a white card
   * with the picture inset. `cover`: a white card filled edge to edge.
   * Sizes are mock px: card width/height on desktop, height on the phone.
   */
  media: { kind: "bare" | "contain" | "cover"; width: number; height: number; mobileHeight: number; inset?: string; mobileInset?: string };
  /** Desktop top padding in mock px. */
  top?: number;
  mobileTitleSize?: number;
}) {
  return (
    <section
      className={fb.hero}
      aria-labelledby="product-title"
      style={
        {
          "--fb-hero-top": top,
          "--fb-media-w": media.width,
          "--fb-media-h": media.height,
          "--fb-media-mh": `${media.mobileHeight}px`,
          "--fb-inset": media.inset ?? "100%",
          "--fb-inset-m": media.mobileInset ?? media.inset ?? "100%",
          "--fb-hero-m": `${mobileTitleSize}px`,
        } as Vars
      }
    >
      <div className={fb.heroCopy}>
        <h1 id="product-title" className={cx(styles.heroTitle, fb.heroName)}>
          {title}
        </h1>
        <p className={fb.heroLead}>
          <Responsive {...lead} />
        </p>
        <div className={fb.heroActions}>
          <SampleButton productName={productName} className={fb.cta} />
          <DistributorLink className={fb.cta} />
        </div>
      </div>
      <div className={cx(fb.heroMedia, fb[media.kind])}>{image}</div>
    </section>
  );
}

/* ---------------- section shell ---------------- */

export function FamilySection({
  title,
  label,
  children,
  className,
  gap,
}: {
  title: ReactNode;
  label: string;
  children?: ReactNode;
  className?: string;
  /** Phone gap between the heading and the content (20 by default). */
  gap?: number;
}) {
  return (
    <section
      className={cx(fb.section, className)}
      aria-label={label}
      style={gap === undefined ? undefined : ({ "--fb-gap-m": `${gap}px` } as Vars)}
    >
      <h2 className={cx(styles.title, fb.h2)}>{title}</h2>
      {children}
    </section>
  );
}

/* ---------------- stats (6-up) ---------------- */

export type FamilyStat = { value: ReactNode; label: ReactNode };

export function FamilyStats({
  items,
  valueSize,
  mobileValueSize,
  padX = 24,
}: {
  items: FamilyStat[];
  /** Value size in mock px, desktop and phone. */
  valueSize: number;
  mobileValueSize: number;
  /** Desktop side padding of a card. */
  padX?: number;
}) {
  return (
    <div
      className={fb.stats}
      style={{ "--fb-stat": valueSize, "--fb-stat-m": `${mobileValueSize}px`, "--fb-stat-pad": padX } as Vars}
    >
      {items.map((item, i) => (
        <div key={i} className={fb.stat}>
          <span className={fb.statValue}>{item.value}</span>
          <span className={fb.statLabel}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- steps (4-up, the second one black) ---------------- */

export type FamilyStep = { name: ReactNode; text: ReactNode };

export function FamilySteps({ items, nameSize, mobileNameWidth }: { items: FamilyStep[]; nameSize: number; mobileNameWidth: number }) {
  return (
    <div className={fb.steps} style={{ "--fb-step": nameSize, "--fb-step-mw": `${mobileNameWidth}px` } as Vars}>
      {items.map((step, i) => (
        <div key={i} className={cx(fb.step, i === 1 && fb.stepDark)}>
          <span className={fb.stepNo}>{i + 1}</span>
          <span className={fb.stepName}>{step.name}</span>
          <span className={fb.stepText}>{step.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- flavours + R&D band ---------------- */

export type FamilyFlavour = { name: ReactNode; color: string; image?: ReactNode };

export function FamilyFlavours({
  items,
  columns,
  ratio,
  nameSize = 18,
  nameLeading = "normal",
}: {
  items: FamilyFlavour[];
  columns: number;
  /** Desktop swatch aspect ratio; the phone is always square. */
  ratio: string;
  nameSize?: number;
  nameLeading?: string;
}) {
  return (
    <div
      className={fb.flavours}
      style={{ "--cols": columns, "--fb-ratio": ratio, "--fb-name": nameSize, "--fb-name-lh": nameLeading } as Vars}
    >
      {items.map((flavour, i) => (
        <div key={i} className={fb.flavour}>
          <div className={fb.swatch} style={{ background: flavour.color }}>
            {flavour.image}
          </div>
          <span className={fb.flavourName}>{flavour.name}</span>
        </div>
      ))}
    </div>
  );
}

/** The black "Your own …" band with the custom-flavour lead form. */
export function RndBand({ title, text }: { title: ReactNode; text: { desktop: ReactNode; mobile?: ReactNode } }) {
  return (
    <div className={fb.band}>
      <div className={fb.bandCopy}>
        <span className={fb.bandHead}>{title}</span>
        <span className={fb.bandText}>
          <Responsive {...text} />
        </span>
      </div>
      <FlavourEnquiryLink className={cx(styles.button, styles.red, fb.cta)}>Talk to R&amp;D</FlavourEnquiryLink>
    </div>
  );
}

/* ---------------- ready for your menu (photo row) ---------------- */

export type FamilyPhoto = { src: string; srcSet?: string; alt: string };

export function FamilyMenu({ title, items }: { title: ReactNode; items: FamilyPhoto[] }) {
  return (
    <section className={cx(fb.section, fb.menu)} aria-label="Ready for your menu">
      <h2 className={cx(styles.title, fb.h2)}>{title}</h2>
      <div className={fb.menuScroll}>
        <div className={fb.menuTrack} style={{ "--cols": items.length } as Vars}>
          {items.map((photo, i) => (
            <div key={i} className={fb.menuPic}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                srcSet={photo.srcSet}
                sizes={`(max-width: 1023px) 240px, calc((min(100vw, 1440px) - 192px) / ${items.length})`}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- inside the pack ---------------- */

export type FamilyRow = { label: ReactNode; value: ReactNode };

export function FamilyInside({
  caption,
  rows,
  notes,
  mobileNote,
}: {
  /** Nutrition card head, desktop and phone. */
  caption: { desktop: ReactNode; mobile?: ReactNode };
  rows: FamilyRow[];
  /** The desktop column of white text cards. */
  notes: Array<{ head: ReactNode; text: ReactNode }>;
  /** The phone's single merged card. */
  mobileNote: ReactNode;
}) {
  return (
    <FamilySection title="Inside the pack" label="Inside the pack" gap={12}>
      <div className={fb.inside}>
        <div className={fb.panel}>
          <span className={fb.panelHead}>
            <Responsive {...caption} />
          </span>
          {rows.map((row, i) => (
            <div key={i} className={fb.row}>
              <span>{row.label}</span>
              <span>{row.value}</span>
            </div>
          ))}
        </div>
        <div className={cx(fb.notes, styles.desktopOnly)}>
          {notes.map((note, i) => (
            <div key={i} className={cx(fb.panel, fb.note)}>
              <span className={fb.panelHead}>{note.head}</span>
              <span className={fb.noteText}>{note.text}</span>
            </div>
          ))}
        </div>
        <div className={cx(fb.panel, fb.mobileNote, styles.mobileOnly)}>{mobileNote}</div>
      </div>
    </FamilySection>
  );
}

/** Class for the shared `Faq` block: one auto-width button, tinted "+" circles. */
export const familyFaqClass = fb.faq;
