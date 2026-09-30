import type { AnchorHTMLAttributes } from "react";

/**
 * A link to a section of the page it is already on.
 *
 * It exists because of `<base href="/">` in the root layout — the exported
 * pages need it to resolve their relative assets from four nested routes, and
 * the price is that a bare `#fragment` resolves against the site root instead
 * of the current document. `/rnd`'s "Start a brief" was sending readers to the
 * home page for exactly that reason.
 *
 * So the route is spelled out and the fragment hangs off it. It stays a plain
 * `<a>`: the browser's own behaviour is what is wanted here — no router, no
 * document load, just a scroll, with `scroll-padding-top` in `design-tokens`
 * keeping the target clear of the fixed bar.
 */

type PageAnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  /** The route this anchor is on, e.g. `/rnd`. */
  route: string;
  /** The target element's id, without the `#`. */
  target: string;
};

export function PageAnchor({ route, target, ...rest }: PageAnchorProps) {
  return <a href={`${route}#${target}`} {...rest} />;
}
