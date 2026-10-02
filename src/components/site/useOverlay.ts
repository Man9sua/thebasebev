"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * How long a panel's wipe takes, in milliseconds — `--tbb-dur-fast` in
 * `design-tokens.css`, which is where it is set and where it has to be changed.
 * Repeated here because `leaving` has to last exactly as long, and a timer
 * cannot read a CSS token without a layout pass.
 */
const WIPE_MS = 320;

/**
 * Shared behaviour for the menu and search panels: close on Escape, lock the
 * page behind them without the usual scroll jump, and move focus in and back.
 *
 * It also returns whether the panel is on its way out, which is a state of its
 * own rather than simply "not open" — see `Overlay.module.css`. A panel arrives
 * by wiping down out of the bar and leaves by wiping down off the page: two
 * gestures in the same direction, where a reversed wipe would retreat upward
 * and uncover the bar last, leaving the bar sitting in the panel's ink waiting
 * for it. Two clip states cannot both be "closed", so the leaving one is held
 * for the length of the wipe and then released.
 */
export function useOverlay(
  open: boolean,
  onClose: () => void,
  panelRef: RefObject<HTMLElement | null>,
  focusRef?: RefObject<HTMLElement | null>,
) {
  const [leaving, setLeaving] = useState(false);
  /*
   * React's own way of adjusting state when a prop changes: compare against
   * the last value during the render rather than in an effect, which would both
   * run a frame late and be a synchronous `setState` inside one. The first
   * render is not a close, so a panel nobody opened never wipes off the page.
   */
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    setLeaving(wasOpen && !open);
  }

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => setLeaving(false), WIPE_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement as HTMLElement | null;

    // Compensating for the scrollbar keeps the page from shifting sideways
    // when it locks — a layout shift the user would see behind the panel.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const { overflow, paddingRight } = document.body.style;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      // Keep tabbing inside the panel while it is open.
      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // Wait for the wipe before focusing, so the panel is not announced while
    // it is still clipped out of view.
    const focusTimer = window.setTimeout(() => {
      (focusRef?.current ?? panelRef.current)?.focus();
    }, 220);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      opener?.focus?.();
    };
  }, [open, onClose, panelRef, focusRef]);

  return !open && leaving;
}
