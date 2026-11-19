"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { countryCodeFromPath, countryPath } from "@/lib/country-paths";
import { useCountryCode } from "./useCountryCode";

type Props = ComponentProps<typeof NextLink>;

export function PublicLink({ href, onClick, prefetch, replace, ...props }: Props) {
  const country = useCountryCode();
  const destination = typeof href === "string" ? countryPath(href, country)
    : { ...href, pathname: href.pathname ? countryPath(href.pathname, country) : href.pathname };
  const pathname = typeof destination === "string" ? destination : destination.pathname;
  const countryAlias = pathname?.startsWith("/") && !pathname.startsWith("//")
    && countryCodeFromPath(pathname) !== "AE";
  return (
    <NextLink
      href={destination}
      {...props}
      replace={replace}
      prefetch={countryAlias ? false : prefetch}
      onClick={(event) => {
        onClick?.(event);
        if (!countryAlias || event.defaultPrevented || event.button !== 0
          || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const anchor = event.currentTarget;
        if ((anchor.target && anchor.target.toLowerCase() !== "_self")
          || anchor.hasAttribute("download") || anchor.origin !== window.location.origin) return;
        // Alias documents share an AE RSC tree; keep their visible country on a full load.
        event.preventDefault();
        if (replace) window.location.replace(anchor.href);
        else window.location.assign(anchor.href);
      }}
    />
  );
}
