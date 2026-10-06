import type { CSSProperties, ReactNode } from "react";
import { cx, productImage, productPageStyles as styles } from "../blocks";
import local from "./Range.module.css";

/**
 * Pieces shared by the ranges added after the export — purées, sauces,
 * functional add-ons, the colour collection and the at-home pouches. Their
 * mocks are drawn on the same grid as the other product pages, so everything
 * here is built from the same type and spacing; only the cards are new.
 */

/** Hero title sizes, desktop (mock px at 1440) and phone. */
export function heroSize(desktop: number, mobile: number) {
  return { "--range-hero": desktop, "--range-hero-m": `${mobile}px` } as CSSProperties;
}

export const rangeHeroClass = local.hero;

/* ---------------- three ways to use it ---------------- */

export type Use = { label: ReactNode; value: ReactNode; text: ReactNode };

export function UseCards({ items }: { items: readonly Use[] }) {
  return (
    <div className={local.uses}>
      {items.map((item, i) => (
        <div key={i} className={local.use}>
          <span className={local.useLabel}>{item.label}</span>
          <span className={local.useValue}>{item.value}</span>
          <span className={local.useText}>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- bottle cards (purées, sauces) ---------------- */

export type Bottle = {
  name: string;
  text: string;
  /** "950 ml · PR-001-C950" */
  code: string;
  color: string;
  /** `flavour-<image>-{240,400}.webp` */
  image: string;
};

export function BottleCards({
  slug,
  kind,
  items,
  single = false,
}: {
  slug: string;
  kind: string;
  items: readonly Bottle[];
  /** One card to a row on a phone, larger — for a range of three. */
  single?: boolean;
}) {
  return (
    <div className={cx(local.bottles, single && local.bottlesSingle)}>
      {items.map((item) => (
        <div key={item.name} className={local.bottle}>
          <div className={local.bottlePlate} style={{ "--plate": item.color } as CSSProperties}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              {...productImage(slug, `flavour-${item.image}`, [240, 400])}
              sizes="(max-width: 1023px) 60px, 110px"
              alt={`${item.name} ${kind} bottle`}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className={local.bottleCopy}>
            <span className={local.bottleName}>{item.name}</span>
            <span className={local.bottleText}>{item.text}</span>
            <span className={cx(local.code, !single && styles.desktopOnly)}>{item.code}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- dark band with one action ---------------- */

export function Band({ title, text, action }: { title: ReactNode; text: ReactNode; action: ReactNode }) {
  return (
    <div className={local.band}>
      <div className={local.bandCopy}>
        <span className={local.bandTitle}>{title}</span>
        <span className={local.bandText}>{text}</span>
      </div>
      {action}
    </div>
  );
}

/* ---------------- plain text cards ---------------- */

export function NoteCards({ items, columns = 3 }: { items: readonly { title: ReactNode; text: ReactNode }[]; columns?: number }) {
  return (
    <div className={local.notes} style={{ "--cols": columns } as CSSProperties}>
      {items.map((item, i) => (
        <div key={i} className={local.note}>
          <span className={local.noteTitle}>{item.title}</span>
          <span className={local.noteText}>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

export { local as rangeStyles };
