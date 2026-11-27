import { publicPath, SITE_ORIGIN } from "@/lib/site-paths";

export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;

const absolute = (path: string) => `${SITE_ORIGIN}${publicPath(path)}`;

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
  image?: string;
  price: string | null;
}) {
  const amount = price ? Number.parseFloat(price) : Number.NaN;
  return jsonLd({
    "@type": "Product",
    name,
    description,
    url: absolute(path),
    ...(image && { image: `${SITE_ORIGIN}${image}` }),
    brand: { "@type": "Brand", name: "THE BASE" },
    manufacturer: { "@id": ORGANIZATION_ID },
    ...(Number.isFinite(amount) && {
      offers: {
        "@type": "Offer",
        price: amount.toFixed(2),
        priceCurrency: "AED",
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
