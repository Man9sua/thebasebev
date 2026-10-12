"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { CURRENT_MARKET, MARKETS, type Market } from "@/lib/site-config";
import styles from "./CountrySelect.module.css";

const CURRENT_MARKET_INDEX = Math.max(0, MARKETS.findIndex((market) => market.code === CURRENT_MARKET.code));

/** Keep campaign parameters while the destination selects the requested market. */
function marketHref(market: Market, search: string) {
  const destination = new URL(market.href, window.location.origin);
  const params = new URLSearchParams(search);
  params.delete("market");
  destination.searchParams.forEach((value, name) => params.set(name, value));
  const query = params.toString();
  return `${destination.pathname}${query ? `?${query}` : ""}`;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Keyboard-accessible country list beside search, restored from the previous header. */
export function CountrySelect({
  triggerClassName = "",
  overlayOpen = false,
}: {
  triggerClassName?: string;
  overlayOpen?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(CURRENT_MARKET_INDEX);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [overlayWas, setOverlayWas] = useState(overlayOpen);

  if (overlayOpen !== overlayWas) {
    setOverlayWas(overlayOpen);
    if (overlayOpen) setOpen(false);
  }

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) button.current?.focus();
  }, []);

  const openList = useCallback(() => {
    setActive(CURRENT_MARKET_INDEX);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (open) list.current?.focus();
  }, [open]);

  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onWindowBlur = () => {
      if (document.activeElement instanceof HTMLIFrameElement) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("blur", onWindowBlur);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [open]);

  const choose = (market: Market) => {
    if (market.code === CURRENT_MARKET.code) {
      close(true);
      return;
    }
    setOpen(false);
    window.location.assign(marketHref(market, window.location.search));
  };

  const onListKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((index) => Math.min(index + 1, MARKETS.length - 1));
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
        setActive(MARKETS.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(MARKETS[active]);
        break;
      case "Escape":
        event.preventDefault();
        event.nativeEvent.stopImmediatePropagation();
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
      <button
        ref={button}
        type="button"
        className={`${triggerClassName} ${styles.trigger}`.trim()}
        aria-label={`Country: ${CURRENT_MARKET.code}, ${CURRENT_MARKET.name}. Change country`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openList();
          }
        }}
      >
        <span>{CURRENT_MARKET.code}</span>
        <svg className={styles.chevron} viewBox="0 0 12 8" aria-hidden="true">
          <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>

      <ul
        ref={list}
        id={`${id}-list`}
        className={styles.list}
        role="listbox"
        tabIndex={-1}
        data-open={open}
        aria-label="Country"
        aria-activedescendant={open ? `${id}-option-${active}` : undefined}
        onKeyDown={onListKeyDown}
      >
        {MARKETS.map((market, index) => {
          const current = market.code === CURRENT_MARKET.code;
          return (
            <li
              key={market.code}
              id={`${id}-option-${index}`}
              className={styles.option}
              role="option"
              aria-selected={current}
              data-active={index === active}
              style={{ ["--row" as string]: index }}
              onPointerEnter={() => setActive(index)}
              onClick={() => choose(market)}
            >
              <span className={styles.optionCode} aria-hidden="true">{market.code}</span>
              <span className={styles.optionName}>{market.name}</span>
              <span className={styles.status}>{current ? <CheckIcon /> : market.language}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
