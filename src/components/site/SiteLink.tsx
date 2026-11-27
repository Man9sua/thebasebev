"use client";

import type { AnchorHTMLAttributes } from "react";
import { countryPath } from "@/lib/country-paths";
import { useCountryCode } from "./useCountryCode";

type SiteLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function SiteLink({ href, ...rest }: SiteLinkProps) {
  const country = useCountryCode();
  return <a href={countryPath(href, country)} {...rest} />;
}
