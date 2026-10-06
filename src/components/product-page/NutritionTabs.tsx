"use client";

import { useId, useState, type ReactNode } from "react";
import styles from "./ProductPage.module.css";

export type NutritionRow = {
  label: string;
  value: string;
  /** % daily value; empty for calories. */
  dv?: string;
  /** Left out of the phone's shorter table, as the mobile mock does. */
  desktopOnly?: boolean;
};

export type NutritionSet = {
  /** Flavour the label was read from, e.g. "Mango Coconut". */
  name: string;
  /** "Per serving 20 g" on the desktop table head. */
  caption: string;
  /** The phone's head line, e.g. "Mango Coconut · per serving 20 g". */
  mobileCaption: string;
  rows: NutritionRow[];
  note?: string;
};

/**
 * "Inside the pack": the nutrition table beside the side cards.
 *
 * The mocks draw flavour tabs over it. They are real tabs here, so they only
 * appear when there is more than one label to switch between — a tab with no
 * table behind it would be a control that does nothing.
 */
export function NutritionTabs({
  title,
  sets,
  side,
  className,
}: {
  title: ReactNode;
  sets: NutritionSet[];
  side: ReactNode;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const id = useId();
  const set = sets[active] ?? sets[0];

  return (
    <section className={[styles.section, styles.inside, className].filter(Boolean).join(" ")} aria-labelledby={`${id}-title`}>
      <div className={styles.sectionHead}>
        <h2 id={`${id}-title`} className={styles.title}>
          {title}
        </h2>
        {sets.length > 1 && (
          <div className={`${styles.tabs} ${styles.desktopOnly}`} role="tablist" aria-label="Flavour">
            {sets.map((item, i) => (
              <button
                key={item.name}
                type="button"
                role="tab"
                id={`${id}-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`${id}-panel`}
                tabIndex={i === active ? 0 : -1}
                className={styles.tab}
                onClick={() => setActive(i)}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                  event.preventDefault();
                  const next = (active + (event.key === "ArrowRight" ? 1 : sets.length - 1)) % sets.length;
                  setActive(next);
                  document.getElementById(`${id}-tab-${next}`)?.focus();
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.insideGrid}>
        {set && (
          <div
            className={styles.nutrition}
            id={`${id}-panel`}
            role={sets.length > 1 ? "tabpanel" : undefined}
            aria-labelledby={sets.length > 1 ? `${id}-tab-${active}` : undefined}
          >
            <div className={styles.nutritionHead}>
              <span className={styles.desktopOnly}>{set.caption}</span>
              <span className={styles.mobileOnly}>{set.mobileCaption}</span>
              <span className={styles.desktopOnly}>% Daily value</span>
            </div>
            {set.rows.map((row) => (
              <div key={row.label} className={[styles.nutritionRow, row.desktopOnly && styles.desktopOnly].filter(Boolean).join(" ")}>
                <span>{row.label}</span>
                <span>{row.value}</span>
                <span>{row.dv ?? ""}</span>
              </div>
            ))}
            {set.note && <span className={`${styles.nutritionNote} ${styles.desktopOnly}`}>{set.note}</span>}
          </div>
        )}
        <div className={styles.insideSide}>{side}</div>
      </div>
    </section>
  );
}
