import type { CSSProperties, ReactNode } from "react";
import { FlavourEnquiryLink, Responsive, cx, productPageStyles as styles } from "./blocks";
import fb from "./familyB.module.css";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

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

export type FamilyStat = { value: ReactNode; label: ReactNode };

export function FamilyStats({
  items,
  valueSize,
  mobileValueSize,
  padX = 24,
}: {
  items: FamilyStat[];
  valueSize: number;
  mobileValueSize: number;
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

export type FamilyRow = { label: ReactNode; value: ReactNode };

export function FamilyInside({
  caption,
  rows,
  notes,
  mobileNote,
}: {
  caption: { desktop: ReactNode; mobile?: ReactNode };
  rows: FamilyRow[];
  notes: Array<{ head: ReactNode; text: ReactNode }>;
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

export const familyFaqClass = fb.faq;
