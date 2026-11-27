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

export function useCountryCode() {
  usePathname();
  return useSyncExternalStore(subscribe, browserCountry, serverCountry);
}
