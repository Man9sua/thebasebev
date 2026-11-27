import type { CSSProperties, ReactNode } from "react";
import { cx, productPageStyles as styles } from "../blocks";
import local from "./Range.module.css";

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

export type Bottle = {
  name: string;
  text: string;
  code: string;
  color: string;
};

export function BottleCards({
  items,
  single = false,
}: {
  items: readonly Bottle[];
  single?: boolean;
}) {
  return (
    <div className={cx(local.bottles, single && local.bottlesSingle)}>
      {items.map((item) => (
        <div key={item.name} className={local.bottle}>
          <div className={local.bottlePlate} style={{ "--plate": item.color } as CSSProperties} aria-hidden="true" />
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
