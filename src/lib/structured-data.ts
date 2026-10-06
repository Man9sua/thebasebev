import { publicPath, SITE_ORIGIN } from "@/lib/site-paths";

/**
 * Schema.org blocks the React pages add on top of the export's own graph.
 *
 * The export already carries the site-wide `Organization` (its `@id` is
 * `ORGANIZATION_ID`), so these only point at it rather than repeat it — one
 * name, address and phone for the whole site.
 */

export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;

const absolute = (path: string) => `${SITE_ORIGIN}${publicPath(path)}`;

/** Safe inside a `<script>`: `</script>` cannot close the block early. */
export function jsonLd(value: object) {
  return JSON.stringify({ "@context": "https://schema.org", ...value }).replace(/</g, "\\u003c");
}

export type Crumb = { name: string; path: string };

export function breadcrumbList(crumbs: readonly Crumb[]) {
  return jsonLd({
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  });
}

export function productSchema({
  name,
  description,
  path,
  image,
  price,
}: {
  name: string;
  description: string;
  path: string;
  /** Site-relative, e.g. `/images/tile-matcha.webp`. */
  image: string;
  /** "70.42 AED", or null when sold on quotation (no offer is published). */
  price: string | null;
}) {
  const amount = price ? Number.parseFloat(price) : Number.NaN;
  return jsonLd({
    "@type": "Product",
    name,
    description,
    url: absolute(path),
    image: `${SITE_ORIGIN}${image}`,
    brand: { "@type": "Brand", name: "THE BASE" },
    manufacturer: { "@id": ORGANIZATION_ID },
    ...(Number.isFinite(amount) && {
      offers: {
        "@type": "Offer",
        price: amount.toFixed(2),
        priceCurrency: "AED",
        availability: "https://schema.org/InStock",
        url: absolute(path),
        seller: { "@id": ORGANIZATION_ID },
      },
    }),
  });
}

export function faqPage(items: readonly { q: string; a: string }[]) {
  return jsonLd({
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  });
}
