"use client";

import { useId, useState, type ReactNode } from "react";
import styles from "./ProductPage.module.css";

export type NutritionRow = {
  label: string;
  value: string;
  dv?: string;
  desktopOnly?: boolean;
};

export type NutritionSet = {
  name: string;
  caption: string;
  mobileCaption: string;
  rows: NutritionRow[];
  note?: string;
};

function servingCaption(caption: string, flavour: string) {
  const sourceName = flavour.toLowerCase();
  return caption.split("·").map((part) => part.trim())
    .filter((part) => part && part.toLowerCase() !== sourceName).join(" · ");
}

export function NutritionTabs({
  title,
  sets,
  side,
  className,
  tableTitle,
  fullMobile = false,
}: {
  title: ReactNode;
  sets: NutritionSet[];
  side: ReactNode;
  className?: string;
  tableTitle?: string;
  fullMobile?: boolean;
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
            className={[styles.nutrition, fullMobile && styles.nutritionFullMobile].filter(Boolean).join(" ")}
            id={`${id}-panel`}
            role={sets.length > 1 ? "tabpanel" : undefined}
            aria-labelledby={sets.length > 1 ? `${id}-tab-${active}` : undefined}
          >
            <div className={styles.nutritionHead}>
              {tableTitle && <h3 className={styles.nutritionTableTitle}>{tableTitle}</h3>}
              <span className={styles.desktopOnly}>{servingCaption(set.caption, set.name)}</span>
              <span className={styles.mobileOnly}>{servingCaption(set.mobileCaption, set.name)}</span>
              {!tableTitle && <span className={styles.desktopOnly}>% Daily value</span>}
            </div>
            {set.rows.map((row) => (
              <div key={row.label} className={[styles.nutritionRow, row.desktopOnly && styles.desktopOnly].filter(Boolean).join(" ")}>
                <span>{row.label}</span>
                <span>{row.value}</span>
                <span>{row.dv ?? ""}</span>
              </div>
            ))}
            {set.note && <span className={[styles.nutritionNote, !fullMobile && styles.desktopOnly].filter(Boolean).join(" ")}>{set.note}</span>}
          </div>
        )}
        <div className={styles.insideSide}>{side}</div>
      </div>
    </section>
  );
}
