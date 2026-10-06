"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { CURRENT_MARKET, MARKETS, type Market } from "@/lib/site-config";
import { PUBLIC_PREFIX } from "@/lib/site-paths";
import styles from "./CountrySelect.module.css";

/**
 * The country selector beside search.
 *
 * Not the region picker the bar used to carry: that one let a visitor choose
 * any of five regions and then did nothing with the choice. This one only
 * offers what exists. The UAE is the market this build serves and is marked as
 * current; the others are listed so a visitor can see they are coming, and are
 * disabled — `MARKETS` gives them no prefix, so there is nothing here that
 * could link to a route that 404s.
 *
 * Should a second market go live, choosing it opens the page the visitor is on
 * under that market's prefix, query string and all, so a campaign's UTM tags
 * survive the switch.
 *
 * It is a listbox, built as `SortMenu` is and for the same reasons: focus moves
 * to the list and `aria-activedescendant` names the active row; the arrows,
 * Home and End move through it, Enter or Space chooses, Escape closes and hands
 * focus back to the trigger, Tab closes and moves on. Disabled rows are walked
 * through like the rest, so a keyboard or screen-reader user finds out what is
 * coming exactly as a sighted one does, but choosing one does nothing.
 *
 * Not `useOverlay`: this is a small list hanging from the bar, not a panel, so
 * it neither locks the page nor traps focus.
 */

/** The path the visitor is on, under another market's prefix. */
function pathInMarket(pathname: string, prefix: string) {
  const rest =
    pathname === PUBLIC_PREFIX
      ? ""
      : pathname.startsWith(`${PUBLIC_PREFIX}/`)
        ? pathname.slice(PUBLIC_PREFIX.length)
        : pathname;
  return rest === "/" || rest === "" ? prefix : `${prefix}${rest}`;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CountrySelect({
  triggerClassName = "",
  overlayOpen = false,
}: {
  /** The bar's own icon-button class, so the trigger moves and focuses as its neighbours do. */
  triggerClassName?: string;
  /** True while the menu or search is open; the list closes when either opens. */
  overlayOpen?: boolean;
}) {
  const id = useId();
  const pathname = usePathname();
  const router = useRouter();
  const currentIndex = Math.max(
    0,
    MARKETS.findIndex((market) => market.code === CURRENT_MARKET.code),
  );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(currentIndex);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  // Two panels never stand at once: when the menu or search opens, this goes.
  // Adjusted while rendering rather than in an effect, so it never paints open
  // on top of them for a frame.
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
    setActive(currentIndex);
    setOpen(true);
  }, [currentIndex]);

  // Focus follows the list in, so the arrows work the moment it is open.
  useEffect(() => {
    if (open) list.current?.focus();
  }, [open]);

  // A press anywhere else closes it — search and the burger included.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    // A press inside a cross-origin iframe (the About map) never reaches this
    // document; the window losing focus to that frame is the only signal.
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
    if (!market.live) return;
    if (market.code === CURRENT_MARKET.code) {
      close(true);
      return;
    }
    setOpen(false);
    router.push(`${pathInMarket(pathname, market.prefix)}${window.location.search}`);
  };

  const onListKeyDown = (event: React.KeyboardEvent) => {
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
        // This Escape is ours, not the open menu's. The menu listens on the
        // document, which is also where React listens in the App Router, so
        // only stopping the rest of the document's listeners keeps it open.
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
              aria-disabled={market.live ? undefined : true}
              data-active={index === active}
              style={{ ["--row" as string]: index }}
              onPointerEnter={() => setActive(index)}
              onClick={() => choose(market)}
            >
              <span className={styles.optionCode} aria-hidden="true">
                {market.code}
              </span>
              <span className={styles.optionName}>{market.name}</span>
              <span className={styles.status}>
                {current ? <CheckIcon /> : market.live ? market.language : "Soon"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
