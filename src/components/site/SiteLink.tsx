import type { AnchorHTMLAttributes } from "react";

/**
 * An internal link that loads a document.
 *
 * It exists because every route on this site except the home page is still the
 * Tilda export, injected as markup with `dangerouslySetInnerHTML` — see
 * `LegacyDocument`. When the browser parses that markup out of the served
 * document, the eighteen to seventy-two `<script>` tags in it run, which is what
 * builds the catalogue's filters, prices and add-to-cart control and what puts
 * the four popup lead forms on a product page.
 *
 * `innerHTML` does not run scripts. So a client-side navigation into one of
 * those pages produced markup with every script inert: the catalogue arrived
 * with no filter row, no prices and no cart, and a product page arrived with
 * its "Request a sample" button pointing at a form that was never built.
 * Everything worked on a reload and nothing worked on a click, which is exactly
 * what it looked like from the outside — a page half missing.
 *
 * Replaying the scripts after the fact is the other way to fix it, and it was
 * not taken: there are seventy-two of them, they include the analytics and the
 * lead forms, and running them a second time on a page the visitor navigated to
 * from another legacy page risks double-binding a form submit or double-counting
 * a visit. The lead pipeline is the business. A document load is slower and
 * certain.
 *
 * So this is `<a>`, deliberately, and not `next/link`. When a route stops being
 * the export and becomes React — the home page already has — its links can move
 * back to the router.
 */

type SiteLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function SiteLink({ href, ...rest }: SiteLinkProps) {
  return <a href={href} {...rest} />;
}
