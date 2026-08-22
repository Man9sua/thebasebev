import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage } from "@/components/home/HomePage";
import { LegacyDocument } from "@/components/legacy/LegacyDocument";
import {
  getSitePage,
  getStaticSiteParams,
  normalizeSitePath,
  SITE_ORIGIN,
} from "@/lib/site-pages";

type RouteProps = {
  params: Promise<{ path?: string[] }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getStaticSiteParams();
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const route = normalizeSitePath((await params).path);
  const page = getSitePage(route);
  if (!page) return {};

  const robots = page.robots.toLowerCase();
  const canonical = page.canonical || `${SITE_ORIGIN}${route === "/" ? "" : route}`;
  const title = page.title || "THE BASE";
  const description = page.description || undefined;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: canonical,
        "x-default": canonical,
      },
    },
    robots: {
      index: page.indexable && !robots.includes("noindex"),
      follow: !robots.includes("nofollow"),
    },
    openGraph: {
      type: "website",
      url: page.openGraph.url || canonical,
      title: page.openGraph.title || title,
      description: page.openGraph.description || description,
      images: page.openGraph.image ? [{ url: page.openGraph.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: "@thebasebev",
      title: "Dry Beverage Premix Manufacturer | Global HoReCa Supply",
      description:
        "The Base Beverage manufactures dry beverage bases and instant premixes in Dubai, UAE. 600+ flavours, private label and custom R&D for HoReCa, retail and distributors.",
      images: [
        `${SITE_ORIGIN}/images/tild3435-6364-4232-a539-303363373037__frame_1413375666_1.jpg`,
      ],
    },
    authors: [{ name: "The Base Beverage LLC" }],
    other: {
      "geo.region": "AE-DU",
      "geo.placename": "Dubai, United Arab Emirates",
      "business:contact_data:locality": "Dubai",
      "business:contact_data:country_name": "United Arab Emirates",
      "business:contact_data:phone_number": "+971509890429",
    },
  };
}

export default async function SiteRoute({ params }: RouteProps) {
  const route = normalizeSitePath((await params).path);
  const page = getSitePage(route);
  if (!page) notFound();

  // Only the homepage is redesigned so far. Every other route keeps rendering
  // the Tilda parity document, so titles, canonicals, structured data and the
  // legacy form pipeline are untouched while the new design is built out.
  // `generateMetadata` above is shared, so `/` keeps its existing title and
  // description either way.
  if (route === "/") return <HomePage />;

  return <LegacyDocument page={page} />;
}
