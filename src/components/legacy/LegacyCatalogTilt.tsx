"use client";

import { useEffect } from "react";

const MAX_TILT = 6;
const LIFT_PX = 6;

export function LegacyCatalogTilt() {
  useEffect(() => {
    const grids = Array.from(document.querySelectorAll<HTMLElement>(".catg-grid"));
    if (!grids.length) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let active: HTMLElement | null = null;

    const tileOf = (card: HTMLElement) =>
      card.querySelector<HTMLElement>(".catg-img-wrap");

    const clear = (card: HTMLElement) => {
      const tile = tileOf(card);
      if (tile) {
        tile.style.setProperty("transform", "none", "important");
        window.setTimeout(() => tile.style.removeProperty("transform"), 400);
      }
      card.removeAttribute("data-tilting");
    };

    const onMove = (event: PointerEvent) => {
      const target = event.target;
      const card =
        target instanceof Element ? target.closest<HTMLElement>(".catg-card") : null;

      if (card !== active) {
        if (active) clear(active);
        active = card;
        if (card) card.setAttribute("data-tilting", "");
      }

      if (!card) return;
      const tile = tileOf(card);
      if (!tile) return;

      const box = tile.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;

      tile.style.setProperty(
        "transform",
        `translateY(-${LIFT_PX}px) rotateX(${(-y * MAX_TILT).toFixed(2)}deg) rotateY(${(
          x * MAX_TILT
        ).toFixed(2)}deg)`,
        "important",
      );
    };

    const onLeave = () => {
      if (active) clear(active);
      active = null;
    };

    grids.forEach((grid) => {
      grid.addEventListener("pointermove", onMove);
      grid.addEventListener("pointerleave", onLeave);
    });

    return () => {
      grids.forEach((grid) => {
        grid.removeEventListener("pointermove", onMove);
        grid.removeEventListener("pointerleave", onLeave);
      });
      if (active) clear(active);
    };
  }, []);

  return null;
}
