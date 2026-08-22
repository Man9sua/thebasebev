"use client";

import { useEffect, type RefObject } from "react";

/**
 * Shared behaviour for the menu and search panels: close on Escape, lock the
 * page behind them without the usual scroll jump, and move focus in and back.
 */
export function useOverlay(
  open: boolean,
  onClose: () => void,
  panelRef: RefObject<HTMLElement | null>,
  focusRef?: RefObject<HTMLElement | null>,
) {
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
}
