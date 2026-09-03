import type { MetadataRoute } from "next";
import { GLOSSARY_ENTRIES } from "@/data/glossary";
import { SITE_ORIGIN, sitemapRoutes } from "@/lib/site-pages";

const auditedLastModified = {
  "/": "2026-08-20T20:38:39+00:00",
  "/wholesale-strategy": "2026-08-20T14:18:41+00:00",
  "/contacts": "2026-08-20T14:18:43+00:00",
  "/about-us": "2026-08-20T14:18:45+00:00",
  "/resources": "2026-08-20T14:18:46+00:00",
  "/distributors": "2026-08-20T14:18:49+00:00",
  "/resources/blog": "2026-08-20T14:18:50+00:00",
  "/private-labeling": "2026-08-20T14:18:53+00:00",
  "/sitemap": "2026-08-20T14:18:55+00:00",
  "/resources/glossary": "2026-08-20T14:18:56+00:00",
  "/resources/tools": "2026-08-20T14:18:57+00:00",
  "/rnd": "2026-08-20T14:19:00+00:00",
  "/raf-coffee": "2026-08-20T14:19:05+00:00",
  "/cream-latte": "2026-08-20T14:19:06+00:00",
  "/chai-latte": "2026-08-20T14:19:08+00:00",
  "/milkshake": "2026-08-20T14:19:09+00:00",
  "/frappe": "2026-08-20T14:19:11+00:00",
  "/iced-tea": "2026-08-20T14:19:12+00:00",
  "/cordial": "2026-08-20T14:19:14+00:00",
  "/topping": "2026-08-20T14:19:15+00:00",
  "/matcha": "2026-08-20T14:19:16+00:00",
  "/chocolate": "2026-08-20T14:19:18+00:00",
  "/sugar-syrup": "2026-08-20T14:19:19+00:00",
  "/vending": "2026-08-20T14:19:20+00:00",
  "/jam": "2026-08-20T14:19:22+00:00",
  "/garnish": "2026-08-20T14:19:23+00:00",
  "/sugar-free": "2026-08-20T14:19:25+00:00",
  "/tea": "2026-08-20T14:19:26+00:00",
  "/catalog": "2026-08-20T14:19:28+00:00",
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  if (sitemapRoutes.length !== 29) {
    throw new Error(`Expected 29 audited sitemap routes, received ${sitemapRoutes.length}.`);
  }

  const publicPages = sitemapRoutes.map(({ route }) => {
    const lastModified = auditedLastModified[route as keyof typeof auditedLastModified];

    if (!lastModified) {
      throw new Error(`Missing audited sitemap lastmod for ${route}.`);
    }

    return {
      url: `${SITE_ORIGIN}${route === "/" ? "/" : route}`,
      lastModified,
    };
  });

  const glossaryArticles = GLOSSARY_ENTRIES.map((entry) => ({
    url: `${SITE_ORIGIN}${entry.path}`,
    lastModified: `${entry.published}T00:00:00.000Z`,
  }));

  return [...publicPages, ...glossaryArticles];
}
