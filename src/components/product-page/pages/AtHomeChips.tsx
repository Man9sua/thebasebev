"use client";

import { useEffect, useState } from "react";
import { PageAnchor } from "@/components/site/PageAnchor";
import local from "./AtHome.module.css";

export function AtHomeChips({ route, shelves }: { route: string; shelves: readonly { id: string; label: string }[] }) {
  const [active, setActive] = useState(shelves[0]?.id);

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
