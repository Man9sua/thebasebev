"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import styles from "./SortMenu.module.css";

export type SortOption<T extends string> = { id: T; label: string };

/**
 * The shop's sort control.
 *
 * Written out rather than a `<select>` because a native one cannot be animated
 * — the browser draws its list outside the page and nothing in CSS reaches it —
 * and because its focus ring appears on a plain mouse click, which on this site
 * meant a red rectangle around the control every time anyone used it.
 *
 * It is a listbox, so it carries the keyboard a `<select>` gives for free:
 * Enter, Space or either arrow opens it, the arrows and Home/End move through
 * it, Enter or Space chooses, Escape and Tab close it. Focus stays on the list
 * itself and `aria-activedescendant` says which option is current, rather than
 * being moved from option to option.
 *
 * The list stays mounted while closed so it has something to animate out of;
 * `visibility` is what keeps a closed one out of the tab order and off the
 * pointer, and it is transitioned stepwise so it only flips once the fade is
 * over.
 */
export function SortMenu<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly SortOption<T>[];
  onChange: (next: T) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((o) => o.id === value)));
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  const current = options.find((option) => option.id === value) ?? options[0];

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) button.current?.focus();
  }, []);

  const openAt = useCallback(() => {
    setActive(Math.max(0, options.findIndex((option) => option.id === value)));
    setOpen(true);
  }, [options, value]);

  // Focus follows the list in, so the arrows work the moment it is open.
  useEffect(() => {
    if (open) list.current?.focus();
  }, [open]);

  // A click anywhere else closes it, as a native one does.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const choose = (index: number) => {
    onChange(options[index].id);
    close(true);
  };

  const onListKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((index) => Math.min(index + 1, options.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(active);
        break;
      case "Escape":
        event.preventDefault();
        close(true);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.root} ref={root}>
      <span className={styles.label} id={`${id}-label`}>
        {label}
      </span>

      <button
        ref={button}
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => (open ? close(false) : openAt())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openAt();
          }
        }}
      >
        <span id={`${id}-value`}>{current.label}</span>
        <svg className={styles.chevron} viewBox="0 0 12 8" aria-hidden="true" data-open={open}>
          <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>

      <ul
        ref={list}
        className={styles.list}
        role="listbox"
        tabIndex={-1}
        data-open={open}
        aria-labelledby={`${id}-label`}
        aria-activedescendant={open ? `${id}-option-${active}` : undefined}
        onKeyDown={onListKeyDown}
      >
        {options.map((option, index) => (
          <li
            key={option.id}
            id={`${id}-option-${index}`}
            className={styles.option}
            role="option"
            aria-selected={option.id === value}
            data-active={index === active}
            style={{ ["--row" as string]: index }}
            onPointerEnter={() => setActive(index)}
            onClick={() => choose(index)}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
