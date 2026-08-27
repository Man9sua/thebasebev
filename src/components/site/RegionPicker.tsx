"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { REGIONS, type Region } from "@/lib/site-config";
import styles from "./RegionPicker.module.css";

/**
 * Region picker, ported from the control running on production today.
 *
 * Deliberately display-only, exactly as production behaves: choosing a region
 * updates the flag and label and nothing else. It does not switch currency,
 * prices, language or routing.
 *
 * `PROJECT_CONTEXT.md` says the locale/currency model
 * (`/ae/en/`, `/kz/ru/`, …) must not be implemented before the migration
 * stabilises, so this stays a placeholder for it rather than growing behaviour
 * of its own. The one thing added over production is remembering the choice, so
 * the control does not silently reset on every navigation.
 */

const STORAGE_KEY = "thebase:region:v1";
/** `storage` only fires in *other* tabs, so this one tells itself. */
const STORAGE_EVENT = "thebase:region-change";

/**
 * localStorage is an external store, so it is read through
 * `useSyncExternalStore` rather than copied into state in an effect. That keeps
 * the server snapshot stable for hydration and, as a bonus, keeps two open tabs
 * in agreement.
 */
const regionStore = {
  subscribe(onChange: () => void) {
    window.addEventListener("storage", onChange);
    window.addEventListener(STORAGE_EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(STORAGE_EVENT, onChange);
    };
  },
  // Must return a stable primitive — a fresh object here would loop forever.
  getSnapshot(): string {
    try {
      return window.localStorage.getItem(STORAGE_KEY) ?? REGIONS[0].short;
    } catch {
      return REGIONS[0].short;
    }
  },
  getServerSnapshot(): string {
    return REGIONS[0].short;
  },
};

export function RegionPicker({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const short = useSyncExternalStore(
    regionStore.subscribe,
    regionStore.getSnapshot,
    regionStore.getServerSnapshot,
  );
  const region: Region =
    REGIONS.find((item) => item.short === short) ?? REGIONS[0];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    const focus = window.setTimeout(() => searchRef.current?.focus(), 30);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focus);
    };
  }, [open]);

  const choose = (next: Region) => {
    setOpen(false);
    setQuery("");
    try {
      window.localStorage.setItem(STORAGE_KEY, next.short);
    } catch {
      // Not worth failing the interaction over; the picker just will not
      // remember the choice.
    }
    window.dispatchEvent(new Event(STORAGE_EVENT));
  };

  const normalized = query.trim().toLowerCase();
  const shown = REGIONS.filter((item) =>
    `${item.name} ${item.label} ${item.short} ${item.currency}`
      .toLowerCase()
      .includes(normalized),
  );

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${open ? styles.open : ""} ${compact ? styles.compact : ""}`}
    >
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Region: ${region.name}. Change region`}
      >
        <span className={styles.code}>{region.short}</span>
        <span className={styles.label}>{region.label}</span>
      </button>

      <div className={styles.panel} role="listbox" aria-label="Regions" hidden={!open}>
        <input
          ref={searchRef}
          className={styles.search}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search region"
          aria-label="Search region"
          autoComplete="off"
        />

        <ul className={styles.list}>
          {shown.map((item) => (
            <li key={item.short}>
              <button
                type="button"
                className={styles.option}
                onClick={() => choose(item)}
                role="option"
                aria-selected={item.short === region.short}
              >
                <span className={styles.optionName}>
                  <span className={styles.code}>{item.short}</span>
                  {item.name}
                </span>
                <span className={styles.currency}>{item.currency}</span>
              </button>
            </li>
          ))}
        </ul>

        {shown.length === 0 && (
          <p className={styles.empty}>No region matches “{query.trim()}”.</p>
        )}
      </div>
    </div>
  );
}
