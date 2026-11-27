import type { AnchorHTMLAttributes } from "react";
import { SiteLink } from "./SiteLink";

type PageAnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  route: string;
  target: string;
};

export function PageAnchor({ route, target, ...rest }: PageAnchorProps) {
  return <SiteLink href={`${route}#${target}`} {...rest} />;
}
