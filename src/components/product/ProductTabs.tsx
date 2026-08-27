"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./ProductTabs.module.css";

/**
 * The product page's detail sections, and the bar that switches between them.
 *
 * The exported Tilda block looked like a tab strip and was not one: its four
 * panes were four separate records stacked below it, so the tabs scrolled and
 * nothing ever switched. This restores what it looked like — one pane at a
 * time — which is also what the page is for. A buyer comparing the cost of a
 * recipe is not reading the flavour list at the same time, and stacked, the
 * four of them ran to four screens of scrolling before the FAQ.
 *
 * Every pane stays in the document whichever one is showing. They are hidden
 * with `hidden`, not dropped: these pages carry two years of ranking and the
 * copy in them is part of what they rank on, so it has to be in the markup a
 * crawler is served. It is also what lets a link to `#usage` work — the hash
 * selects the pane on arrival rather than scrolling to a section that is not
 * on screen.
 */

export type ProductPane = { id: string; label: string; content: ReactNode };

export function ProductTabs({ panes }: { panes: ProductPane[] }) {
  const [current, setCurrent] = useState(panes[0]?.id ?? "");
  const bar = useRef<HTMLDivElement>(null);

  // The panes arrive as a fresh array on every render, so the effect below
  // hangs off what it actually depends on — which panes there are — rather than
  // off the array's identity, which would re-subscribe the listener each time.
  const ids = panes.map((pane) => pane.id).join(" ");

  // A hash may name a pane rather than a place on the page — the tab strip
  // writes one on every click, and the FAQ below is still an ordinary anchor.
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (ids.split(" ").includes(id)) setCurrent(id);
    };

    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [ids]);

  const select = useCallback(
    (id: string) => {
      setCurrent(id);
      // Written, not navigated to: `history.replaceState` leaves the pane
      // linkable without the browser jumping the page to it, which it would do
      // for an element that was hidden a frame ago.
      window.history.replaceState(null, "", `#${id}`);

      // A pane taller than the one it replaced can leave the reader below the
      // bar looking at the middle of it, so the bar comes back to the top of
      // the view whenever it is already above it.
      const top = bar.current?.getBoundingClientRect().top ?? 0;
      if (top < 0) bar.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    },
    [],
  );

  // Left and right move between tabs, which is what a tablist is expected to do
  // once it is a real one.
  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;

    event.preventDefault();
    const index = panes.findIndex((pane) => pane.id === current);
    const next = panes[(index + step + panes.length) % panes.length];
    select(next.id);
    bar.current?.querySelector<HTMLButtonElement>(`#tab-${next.id}`)?.focus();
  };

  return (
    <>
      <div className={styles.bar} ref={bar}>
        <div className={styles.list} role="tablist" aria-label="Product details" onKeyDown={onKeyDown}>
          {panes.map((pane) => (
            <button
              key={pane.id}
              type="button"
              id={`tab-${pane.id}`}
              role="tab"
              className={styles.tab}
              aria-selected={pane.id === current}
              aria-controls={pane.id}
              tabIndex={pane.id === current ? 0 : -1}
              onClick={() => select(pane.id)}
            >
              {pane.label}
            </button>
          ))}
        </div>
      </div>

      {panes.map((pane) => (
        <div
          key={pane.id}
          id={pane.id}
          role="tabpanel"
          aria-labelledby={`tab-${pane.id}`}
          // A pane whose content holds nothing focusable — Specifications is
          // four figures and four lines — is unreachable by keyboard unless the
          // pane itself can take focus.
          tabIndex={pane.id === current ? 0 : -1}
          hidden={pane.id !== current}
        >
          {pane.content}
        </div>
      ))}
    </>
  );
}
