"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HOMEPAGE_ENTRIES, type Entry } from "@/data/posts";
import styles from "./BlogCarousel.module.css";

/**
 * Staggered editorial deck.
 *
 * The entries are dealt like a hand of cards: one square card centred and
 * raised, the rest fanned out either side, alternately nudged up/down and
 * rotated a couple of degrees. Moving the deck only changes each card's
 * `transform`, so the whole thing stays on the compositor — no layout, no
 * reflow, and nothing to measure on resize beyond the card edge length.
 *
 * The deck loops. `active` is an index into `HOMEPAGE_ENTRIES` and every card
 * derives its slot from the wrapped distance to it, so the DOM order never
 * changes: React keys stay stable, and tab order stays document order.
 *
 * Every entry renders as a real `<Link>`, including the ones fanned out behind.
 * That matters more here than the interaction does — the homepage's internal
 * links are part of the migration's SEO surface and must survive the redesign.
 * Only the centre card navigates on click; the others deal themselves forward
 * instead, because sending a reader to a card they cannot yet read is a trap.
 */

/** Card edge length, in pixels. Square, so this is both width and height. */
const CARD_WIDE = 365;
const CARD_NARROW = 290;

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path
        d={back ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Signed slot for `index` given the current centre, wrapped into
 * `[-floor(n/2), floor(n/2)]` so the deck reads as a loop rather than a list
 * with two ends.
 */
function slotFor(index: number, active: number, total: number) {
  const half = Math.floor(total / 2);
  const forward = (((index - active) % total) + total) % total;
  return forward > half ? forward - total : forward;
}

type DeckCardProps = {
  entry: Entry;
  /** Signed distance from the centre; 0 is the centre card. */
  slot: number;
  /** Stacking order, highest at the centre. */
  depth: number;
  size: number;
  onDeal: (steps: number) => void;
};

function DeckCard({ entry, slot, depth, size, onDeal }: DeckCardProps) {
  const isCentre = slot === 0;
  const odd = slot % 2 !== 0;

  return (
    <Link
      href={entry.href}
      className={`${styles.card} ${isCentre ? styles.centre : ""}`}
      aria-current={isCentre ? "true" : undefined}
      onClick={(event) => {
        if (isCentre) return;
        event.preventDefault();
        onDeal(slot);
      }}
      onFocus={(event) => {
        // A mouse press fires focus before click. Dealing on that focus would
        // re-render this card as the centre one, and its own click handler
        // would then navigate instead of dealing. Restricting this to
        // `:focus-visible` keeps the keyboard path working without hijacking
        // the pointer path.
        if (isCentre || !event.currentTarget.matches(":focus-visible")) return;
        onDeal(slot);
      }}
      style={{
        width: size,
        height: size,
        zIndex: depth,
        transform: `
          translate(-50%, -50%)
          translateX(${(size / 1.5) * slot}px)
          translateY(${isCentre ? -64 : odd ? 16 : -16}px)
          rotate(${isCentre ? 0 : odd ? 2.5 : -2.5}deg)
        `,
      }}
    >
      <span className={styles.notch} aria-hidden="true" />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.thumb}
        src={entry.image}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
      />

      <span className={`tbb-label ${styles.category}`}>{entry.category}</span>
      <h3 className={styles.cardTitle}>{entry.title}</h3>
      <span className={styles.summary}>{entry.summary}</span>

      <span className={styles.foot}>
        {entry.date ? (
          <time dateTime={entry.date}>
            {new Date(entry.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </time>
        ) : (
          <span>Read</span>
        )}
        <Arrow />
      </span>
    </Link>
  );
}

export function BlogCarousel() {
  const [cardSize, setCardSize] = useState(CARD_WIDE);
  const [active, setActive] = useState(0);

  const deal = useCallback((steps: number) => {
    setActive((current) => {
      const total = HOMEPAGE_ENTRIES.length;
      return (((current + steps) % total) + total) % total;
    });
  }, []);

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? CARD_WIDE : CARD_NARROW);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <section className={styles.section} aria-labelledby="reading-title">
      <div className={styles.head}>
        <span className="tbb-label">Reading</span>
        <h2 id="reading-title" className={styles.title}>
          Guides, tools and market notes
        </h2>
      </div>

      <div className={styles.deck}>
        {HOMEPAGE_ENTRIES.map((entry, index) => {
          const slot = slotFor(index, active, HOMEPAGE_ENTRIES.length);
          return (
            <DeckCard
              key={entry.href}
              entry={entry}
              slot={slot}
              depth={HOMEPAGE_ENTRIES.length - Math.abs(slot)}
              size={cardSize}
              onDeal={deal}
            />
          );
        })}

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => deal(-1)}
            aria-label="Previous entry"
          >
            <Arrow back />
          </button>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => deal(1)}
            aria-label="Next entry"
          >
            <Arrow />
          </button>
        </div>
      </div>
    </section>
  );
}
