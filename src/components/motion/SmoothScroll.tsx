"use client";

import { useEffect } from "react";

/**
 * Inertial smooth scrolling.
 *
 * Written by hand rather than pulling in a scroll library — it is short, and a
 * dependency would also have to be reasoned about on the legacy Tilda pages
 * that share this layout.
 *
 * Approach: intercept the wheel, keep our own eased target, and drive the real
 * `window.scrollTo`. The document is never transformed, so `position: sticky`,
 * pinned sections, `IntersectionObserver`, anchor links, scrollbar dragging and
 * keyboard scrolling all keep working. (Translating a wrapper instead — the
 * other common technique — silently breaks sticky, which this design needs.)
 *
 * Disabled for reduced-motion users and for touch, where the native momentum is
 * better than anything we would simulate.
 */

/** Higher settles faster. Low enough to feel like glide, not lag. */
const LERP = 0.1;
const SETTLE_EPSILON = 0.4;
/** Trackpads report far smaller deltas than mice; both should feel the same. */
const WHEEL_MULTIPLIER = 1;

export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    if (reduced.matches || coarse.matches) return;

    let target = window.scrollY;
    let animating = false;
    let frame = 0;

    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const tick = () => {
      const current = window.scrollY;
      const delta = target - current;

      if (Math.abs(delta) < SETTLE_EPSILON) {
        window.scrollTo(0, target);
        animating = false;
        return;
      }

      window.scrollTo(0, current + delta * LERP);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (animating) return;
      animating = true;
      frame = requestAnimationFrame(tick);
    };

    const onWheel = (event: WheelEvent) => {
      // Leave pinch-zoom, modifier gestures and independently scrollable
      // panes (menus, horizontal rails) to the browser.
      if (event.ctrlKey || event.metaKey || event.defaultPrevented) return;

      const scrollable = (event.target as Element | null)?.closest?.(
        "[data-native-scroll]",
      );
      if (scrollable) return;

      event.preventDefault();
      target = Math.min(
        maxScroll(),
        Math.max(0, target + event.deltaY * WHEEL_MULTIPLIER),
      );
      start();
    };

    // Anything that is not our own easing — scrollbar drag, keyboard, anchor
    // jumps, browser restore — resets the target so the two never fight.
    const onScroll = () => {
      if (!animating) target = window.scrollY;
    };

    const onResize = () => {
      target = Math.min(target, maxScroll());
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}
