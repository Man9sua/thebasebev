import NextLink from "next/link";
import type { ComponentProps } from "react";
import { publicPath } from "@/lib/site-paths";

type Props = ComponentProps<typeof NextLink>;

export function PublicLink({ href, ...props }: Props) {
  return <NextLink href={typeof href === "string" ? publicPath(href) : href} {...props} />;
}
