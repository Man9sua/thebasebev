"use client";

import { useSyncExternalStore } from "react";

/**
 * Read a media query without a state-in-effect round trip.
 *
 * `useSyncExternalStore` is the right tool here: matchMedia is an external
 * store, and this returns the server snapshot during SSR so markup matches.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
