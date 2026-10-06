"use client";

import { useEffect, useState } from "react";
import { PageAnchor } from "@/components/site/PageAnchor";
import local from "./AtHome.module.css";

/**
 * The shelf index under the hero. The chip of the shelf being read is the
 * dark one, so the row says where on the page you are as well as where you
 * can go; before anything has scrolled, that is the first shelf, as drawn.
 */
export function AtHomeChips({ route, shelves }: { route: string; shelves: readonly { id: string; label: string }[] }) {
  const [active, setActive] = useState(shelves[0]?.id);

  /* The live shelf is the last one whose top has passed 40% of the viewport,
     read on scroll rather than from intersections so that scrolling back up
     past the first shelf hands the mark back to it. */
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current = shelves[0]?.id;
      for (const { id } of shelves) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= line) current = id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [shelves]);

  return (
    <nav className={local.chips} aria-label="Ranges">
      {shelves.map((shelf) => (
        <PageAnchor
          key={shelf.id}
          route={route}
          target={shelf.id}
          className={shelf.id === active ? local.chipActive : local.chip}
          aria-current={shelf.id === active ? "location" : undefined}
        >
          {shelf.label}
        </PageAnchor>
      ))}
    </nav>
  );
}
