"use client";

import { useEffect } from "react";

/**
 * Cursor tilt for the exported catalogue tiles.
 *
 * The catalogue grid is still the Tilda export and it owns the cart, so this
 * decorates the cards that are already there rather than replacing them.
 *
 * What turns is `.catg-img-wrap`, the visible tile — `.catg-card` is a
 * transparent anchor wrapped around it, and the export pins it with
 * `transform: none !important`.
 *
 * The transform is written inline with `important` priority rather than through
 * a stylesheet, because the export also ends with
 * `.catg-card:hover .catg-img-wrap { transform: none !important }` — the client
 * switched the old hover lift off deliberately. An important declaration in a
 * stylesheet can only be answered by another one, and no selector reaches past
 * it; an important *inline* style does. Writing it from here rather than from
 * CSS keeps that override on exactly one element at a time, the one under the
 * cursor, and removes it again on the way out.
 *
 * One delegated listener per grid rather than two per card: the page holds
 * sixteen cards across several category grids, and per-card listeners would be
 * thirty-two closures kept alive for an effect that only ever applies to one.
 *
 * Off for coarse pointers and reduced motion: there is no cursor to follow on
 * touch, and a tile that pitches under the finger is just noise.
 */

/** Degrees at the far edge of a tile. Past ~8 the pack shots start to skew. */
const MAX_TILT = 6;
/** Matches the lift the export's own hover used before it was switched off. */
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
        // Back through the eased transition in the stylesheet, then out of the
        // way entirely so the export's own rules own the element again.
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

      // Y drives the X axis and vice versa: pushing the cursor up should tip the
      // top of the tile away, not roll it sideways.
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
