import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPage } from "@/components/about/AboutPage";
import { CatalogPage } from "@/components/catalog/CatalogPage";
import { DistributorsPage } from "@/components/distributors/DistributorsPage";
import { RndPage } from "@/components/rnd/RndPage";
import { ContactPage } from "@/components/contact/ContactPage";
import { HomePage } from "@/components/home/HomePage";
import { LegacyDocument } from "@/components/legacy/LegacyDocument";
import { LegacyPageShell } from "@/components/legacy/LegacyPageShell";
import { BlogArticlePage } from "@/components/resources/BlogArticlePage";
import { BlogPage } from "@/components/resources/BlogPage";
import { GlossaryArticlePage } from "@/components/resources/GlossaryArticlePage";
import { GlossaryPage } from "@/components/resources/GlossaryPage";
import { ToolsPage } from "@/components/resources/ToolsPage";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductHero } from "@/components/product/ProductHero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageIntro } from "@/components/site/PageIntro";
import { PageOffers } from "@/components/site/PageOffers";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SitemapPage } from "@/components/sitemap/SitemapPage";
import { ThankYouPage } from "@/components/thanks/ThankYouPage";
import { getPageIntro, getPageOffers } from "@/data/page-intros";
import { getProduct } from "@/data/products";
import {
  GLOSSARY_ENTRIES,
  findGlossaryEntryByPath,
  getRelatedGlossaryEntries,
  type GlossaryEntry,
} from "@/data/glossary";
import {
  BLOG_POSTS,
  findBlogPostByPath,
  getRelatedBlogPosts,
  type BlogPost,
} from "@/data/blog";
import { getLegacyStructuredData } from "@/lib/legacy-structured-data";
import {
  getSitePage,
  getStaticSiteParams,
  normalizeSitePath,
  SITE_ORIGIN,
  withoutLegacyRecords,
  catalogWeights,
  catalogFlavors,
} from "@/lib/site-pages";

type RouteProps = {
  params: Promise<{ path?: string[] }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  const articleParams = [...GLOSSARY_ENTRIES, ...BLOG_POSTS].map(({ path }) => ({
    path: path.replace(/^\//, "").split("/"),
  }));

  return [...getStaticSiteParams(), ...articleParams];
}

function glossaryMetadata(entry: GlossaryEntry): Metadata {
  const title = entry.seo.title || entry.title;
  const description = entry.seo.description || entry.excerpt || undefined;
  const canonical = entry.seo.canonical || `${SITE_ORIGIN}${entry.path}`;

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
    robots: { index: true, follow: true },
    openGraph: {
      // Production Tilda exposes these detail pages as `website`; keep that
      // exact SEO contract during migration even though the body is an article.
      type: "website",
      url: canonical,
      title: entry.seo.openGraphTitle || title,
      description: entry.seo.openGraphDescription || description,
    },
    twitter: {
      card: "summary",
      site: "@thebasebev",
      title,
      description,
    },
    authors: [{ name: "The Base Beverage LLC" }],
  };
}

/**
 * A Blog article's metadata, against production's own contract for these URLs.
 *
 * Two things here are deliberate and look wrong at a glance. The type is
 * `website`, not `article` — Tilda publishes every `/tpost/` page that way and
 * parity is the rule during migration, exactly as the Glossary entries above
 * do. And the `og:image` is this site's own copy of the cover rather than the
 * `static.tildacdn.com` URL production points at: the image has to be served
 * from the canonical host, which is what `audit:seo-parity` checks and what
 * stops the migrated site depending on Tilda for a share card.
 */
function blogMetadata(post: BlogPost): Metadata {
  const title = post.seo.title || post.title;
  const description = post.seo.description || post.excerpt || undefined;
  const canonical = post.seo.canonical || `${SITE_ORIGIN}${post.path}`;
  const image = post.cover ? `${SITE_ORIGIN}${post.cover.src}` : "";

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
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      url: canonical,
      title: post.seo.openGraphTitle || title,
      description: post.seo.openGraphDescription || description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: "@thebasebev",
      title,
      description,
      images: image ? [image] : undefined,
    },
    authors: [{ name: "The Base Beverage LLC" }],
  };
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const route = normalizeSitePath((await params).path);
  const glossaryEntry = findGlossaryEntryByPath(route);
  if (glossaryEntry) return glossaryMetadata(glossaryEntry);

  const blogPost = findBlogPostByPath(route);
  if (blogPost) return blogMetadata(blogPost);

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
  const glossaryEntry = findGlossaryEntryByPath(route);

  if (glossaryEntry) {
    return (
      <div className="tbb">
        <SiteHeader />
        <GlossaryArticlePage
          entry={glossaryEntry}
          relatedEntries={getRelatedGlossaryEntries(glossaryEntry)}
        />
        <SiteFooter />
      </div>
    );
  }

  const blogPost = findBlogPostByPath(route);
  if (blogPost) {
    return (
      <div className="tbb">
        <SiteHeader />
        <BlogArticlePage post={blogPost} relatedPosts={getRelatedBlogPosts(blogPost)} />
        <SiteFooter />
      </div>
    );
  }

  const page = getSitePage(route);
  if (!page) notFound();

  // `generateMetadata` above is shared, so every route keeps its existing
  // title, description and canonical whichever branch renders it.
  if (route === "/") return <HomePage />;

  if (route === "/about-us") {
    const structuredData = getLegacyStructuredData(page.file);
    return (
      <div className="tbb">
        {structuredData.map((block, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: block }}
          />
        ))}
        <SiteHeader />
        <AboutPage />
        <SiteFooter />
      </div>
    );
  }

  // The two standalone aliases are the exported header and footer records
  // themselves. Framing them in the shared shell would wrap a copy of the site
  // chrome around the site chrome, so they keep rendering exactly as exported.
  if (!page.usesSharedShell) return <LegacyDocument page={page} />;

  if (
    route === "/catalog" ||
    route === "/contacts" ||
    route === "/rnd" ||
    route === "/distributors"
  ) {
    const structuredData = getLegacyStructuredData(page.file);
    return (
      <div className="tbb">
        {structuredData.map((block, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: block }}
          />
        ))}
        <SiteHeader />
        {route === "/catalog" ? (
          <CatalogPage weights={catalogWeights()} flavors={catalogFlavors()} />
        ) : route === "/rnd" ? (
          <RndPage />
        ) : route === "/distributors" ? (
          <DistributorsPage />
        ) : (
          <ContactPage />
        )}
        <SiteFooter />
      </div>
    );
  }

  // Where every lead form lands. React, and deliberately small — see the note
  // in the component for what the exported version was doing on a phone. The
  // export's Organization graph is carried over: it is the site-wide one, on
  // every page including this one, and dropping it here would make this the
  // only route without it.
  if (route === "/thank-you-form") {
    const structuredData = getLegacyStructuredData(page.file);
    return (
      <div className="tbb">
        {structuredData.map((block, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: block }}
          />
        ))}
        <SiteHeader />
        <ThankYouPage />
        <SiteFooter />
      </div>
    );
  }

  if (route === "/resources/tools") {
    const runtimePage = withoutLegacyRecords(page, ["rec2429369331", "rec2430603261"]);
    return (
      <div className="tbb">
        <SiteHeader />
        <ToolsPage />
        <LegacyPageShell page={runtimePage} runtimeOnly />
        <SiteFooter />
      </div>
    );
  }

  if (route === "/resources/glossary" || route === "/resources/blog") {
    const structuredData = getLegacyStructuredData(page.file);
    return (
      <div className="tbb">
        {structuredData.map((block, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: block }}
          />
        ))}
        <SiteHeader />
        {route === "/resources/blog" ? <BlogPage /> : <GlossaryPage />}
        <SiteFooter />
      </div>
    );
  }

  if (route === "/sitemap") {
    const runtimePage = withoutLegacyRecords(page, [
      "rec2493125951",
      "rec2503542591",
    ]);
    return (
      <div className="tbb">
        <SiteHeader />
        <SitemapPage />
        <LegacyPageShell page={runtimePage} runtimeOnly />
        <SiteFooter />
      </div>
    );
  }

  // A product page is React down to the FAQ and the export from there on. The
  // eight blocks React replaces — the hero, the tab strip, the four figures,
  // the comparative table, the flavours, the usage note, the FAQ and its
  // heading — are all cut out of the markup below by `site-pages.ts`, so the
  // two never both claim the copy or the `h1`. What the export still owns is
  // what nothing has replaced yet: the partnership block, the cookie banner and
  // the four popup lead forms the buttons above open.
  const product = getProduct(route.slice(1));

  // Two pages open with a React head instead, and one of them carries its four
  // services in React as well. Both were built on stock Tilda themes and were
  // still opening with the theme rather than with themselves — `site-pages.ts`
  // says exactly what was dropped, and `data/page-intros.ts` holds the copy
  // each page carries in its place.
  const intro = getPageIntro(route);
  const offers = getPageOffers(route);

  // Everything else: one shared header and footer, with the old Tilda chrome
  // already removed from the markup server-side.
  return (
    <div className="tbb">
      <SiteHeader />
      {intro && <PageIntro intro={intro} />}
      {offers && <PageOffers offers={offers} />}
      {product && <ProductHero product={product} />}
      {product && <ProductDetails product={product} />}
      <LegacyPageShell page={page} opensPage={!intro && !product} />
      <SiteFooter />
    </div>
  );
}
