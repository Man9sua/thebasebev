"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { countryCodeFromPath } from "@/lib/country-paths";

function subscribe(change: () => void) {
  window.addEventListener("popstate", change);
  return () => window.removeEventListener("popstate", change);
}

const browserCountry = () => countryCodeFromPath(window.location.pathname);
const serverCountry = () => "AE";

/** Country aliases share the English SSG document; hydrate its AE snapshot first. */
export function useCountryCode() {
  usePathname();
  return useSyncExternalStore(subscribe, browserCountry, serverCountry);
}
