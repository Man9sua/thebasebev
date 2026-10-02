import type { AnchorHTMLAttributes } from "react";
import { publicPath } from "@/lib/site-paths";

type SiteLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function SiteLink({ href, ...rest }: SiteLinkProps) {
  return <a href={publicPath(href)} {...rest} />;
}
