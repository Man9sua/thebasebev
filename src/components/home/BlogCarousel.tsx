"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import { BLOG_POSTS } from "@/data/blog";
import styles from "./BlogCarousel.module.css";

/**
 * Guides and tools — the redesign's 11a / 11b.
 *
 * A horizontal rail of cards under one display heading, with "All resources"
 * and a pair of arrows opposite it. Built on a native `overflow-x` scroller
 * with snap points rather than a transform-driven track, so trackpad, touch,
 * keyboard, scrollbar and browser find-on-page all keep working — and,
 * importantly, a vertical wheel over the rail still scrolls the page instead
 * of being captured.
 *
 * Drag-to-scroll is layered on top for mouse users, and is careful to let a
 * click through when the pointer barely moved.
 *
 * **What the rail carries.** The document names five: the wholesale strategy
 * guide, the R&D page, the cost calculator, private label and the glossary —
 * four services and tools, and one reference. They are all real routes, and
 * they are what someone weighing up a supplier opens. The newest article from
 * the imported blog closes the row, so the rail is not only evergreen pages;
 * "All resources" is the way to the other forty-five.
 *
 * The site review would rather the services were their own block — see its
 * note about mixing services with content. This follows the document, which
 * is the newer of the two, and puts them in one rail called what it is.
 */

type Entry = {
  href: string;
  category: string;
  title: string;
  summary: string;
  image: string | null;
};

const GUIDES: Entry[] = [
  {
    href: "/wholesale-strategy",
    category: "Market",
    title: "Wholesale Strategy and Market Insights",
    summary:
      "Wholesale beverage distribution in the GCC: margins, MOQ, supplier checklist and the mistakes that cost money.",
    image: "/images/tild3935-6337-4533-a633-643534346539__photo-1590497008432-.jpg",
  },
  {
    href: "/rnd",
    category: "R&D",
    title: "Beverage R&D and Product Development",
    summary:
      "Custom beverage R&D in Dubai: recipe development, flavour matching and pilot batches for HoReCa and private label.",
    image: "/images/tild6565-3533-4465-b561-303337656436__photo-1530037335614-.jpg",
  },
  {
    href: "/resources/tools",
    category: "Tools",
    title: "HoReCa Cost Calculator",
    summary:
      "Estimate ingredient costs, portion pricing and margins for cafés and restaurants.",
    image: "/images/tild3232-3361-4536-b535-383330393461__photo-1732365898359-.jpg",
  },
  {
    href: "/private-labeling",
    category: "Service",
    title: "Private Label & Wholesale Premixes",
    summary:
      "Beverage premixes under your own brand: sixteen product lines, custom development and contract manufacturing.",
    image: "/images/tild3061-3436-4265-b762-383638623261__apron.jpg",
  },
  {
    href: "/resources/glossary",
    category: "Reference",
    title: "Beverage Glossary",
    summary:
      "Definitions of key beverage and HoReCa supply terms, from base powders to garnishes.",
    image: "/images/tild3161-3138-4736-b333-353231303039__photo-1447933601403-.jpg",
  },
];

/** The newest article, so the rail is not five evergreen pages on their own. */
const LATEST: Entry[] = BLOG_POSTS.slice(0, 1).map((post) => ({
  href: post.path,
  category: post.topic.label,
  title: post.title,
  summary: post.excerpt,
  image: post.cover?.src ?? null,
}));

const ENTRIES: Entry[] = [...GUIDES, ...LATEST];

/** Beyond this, a press counts as a drag and the click is suppressed. */
const DRAG_THRESHOLD_PX = 6;

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

export function BlogCarousel() {
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [dragging, setDragging] = useState(false);

  const readPosition = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const max = rail.scrollWidth - rail.clientWidth;
    setAtStart(rail.scrollLeft <= 1);
    setAtEnd(rail.scrollLeft >= max - 1);

    if (thumbRef.current) {
      const visible = rail.clientWidth / rail.scrollWidth;
      const offset = max > 0 ? rail.scrollLeft / max : 0;
      // The thumb is full-width and scaled down, so it shows how much of the
      // list is on screen. A percentage translate resolves against the
      // unscaled box, which is the full track — so the travel is simply the
      // share of the track the thumb does not occupy.
      // Written straight to style: this runs on every scroll frame and must
      // not re-render the list.
      thumbRef.current.style.transform = `translate3d(${(
        offset *
        (1 - visible) *
        100
      ).toFixed(2)}%, 0, 0) scaleX(${visible.toFixed(4)})`;
    }
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    readPosition();
    rail.addEventListener("scroll", readPosition, { passive: true });
    const observer = new ResizeObserver(readPosition);
    observer.observe(rail);

    return () => {
      rail.removeEventListener("scroll", readPosition);
      observer.disconnect();
    };
  }, [readPosition]);

  const scrollByCard = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 24 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  // --- drag to scroll ---
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: 0 });

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Touch already scrolls natively; hijacking it would fight the browser.
    if (event.pointerType === "touch") return;
    const rail = railRef.current;
    if (!rail) return;

    drag.current = {
      active: true,
      startX: event.clientX,
      startLeft: rail.scrollLeft,
      moved: 0,
    };
    // Deliberately no setPointerCapture here. Capturing on pointerdown
    // retargets the following `click` to the rail instead of the card, so
    // every blog link silently stopped navigating. Capture is taken below,
    // only once the pointer has actually moved far enough to be a drag.
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const rail = railRef.current;
    if (!rail) return;

    const delta = event.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(delta));
    if (drag.current.moved <= DRAG_THRESHOLD_PX) return;

    if (!rail.hasPointerCapture(event.pointerId)) {
      rail.setPointerCapture(event.pointerId);
      setDragging(true);
      // Snapping has to be off *this frame*. Waiting for the state-driven
      // class meant mandatory snap pulled every scrollLeft write straight back
      // to the nearest card, so the rail never moved.
      rail.style.scrollSnapType = "none";
    }
    rail.scrollLeft = drag.current.startLeft - delta;
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);

    const rail = railRef.current;
    if (rail?.hasPointerCapture(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }
    // Hand snapping back so the rail settles on a card.
    if (rail) rail.style.scrollSnapType = "";
  };

  // A drag that ends over a card must not also open it.
  const onClickCapture = (event: React.MouseEvent) => {
    if (drag.current.moved > DRAG_THRESHOLD_PX) {
      event.preventDefault();
      event.stopPropagation();
      drag.current.moved = 0;
    }
  };

  return (
    <section className={styles.section} aria-labelledby="reading-title">
      <div className={styles.head}>
        <h2 id="reading-title" className={styles.title}>
          Guides and tools
        </h2>

        <div className={styles.controls}>
          <SiteLink href="/resources" className={styles.all}>
            All resources
          </SiteLink>
          <div className={styles.arrows}>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => scrollByCard(-1)}
              disabled={atStart}
              aria-label="Scroll left"
            >
              <Arrow back />
            </button>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => scrollByCard(1)}
              disabled={atEnd}
              aria-label="Scroll right"
            >
              <Arrow />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={railRef}
        className={`${styles.rail} ${dragging ? styles.dragging : ""}`}
        // Marks the rail as its own scroller — it scrolls natively and nothing
        // else may drive it. `smoke:browser` uses it as the rail's handle.
        data-native-scroll
        // Cards are links, and pressing then moving on a link starts a native
        // link drag, which kills the pointer stream mid-gesture. Suppressing
        // dragstart keeps drag-to-scroll alive without touching click.
        onDragStart={(event) => event.preventDefault()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        {ENTRIES.map((entry) => (
          <SiteLink key={entry.href} href={entry.href} className={styles.card} data-card>
            <span className={styles.frame}>
              {/* An entry without a picture keeps the frame, which is what holds
                  the row's rhythm — only the photograph is missing. */}
              {entry.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={styles.media}
                  src={entry.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              )}
            </span>

            <span className={styles.copy}>
              <span className={styles.category}>{entry.category}</span>
              <span className={styles.cardTitle}>{entry.title}</span>
              <span className={styles.summary}>{entry.summary}</span>
            </span>
          </SiteLink>
        ))}
      </div>

      <div className={styles.progress} aria-hidden="true">
        <span className={styles.track}>
          <span ref={thumbRef} className={styles.thumb} />
        </span>
      </div>
    </section>
  );
}
