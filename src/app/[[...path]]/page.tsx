import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPage } from "@/components/about/AboutPage";
import { AboutFaq } from "@/components/about/AboutFaq";
import { CareersSection } from "@/components/about/CareersSection";
import { ABOUT_FAQS } from "@/components/about/about-faqs";
import { DistributorFinderPage } from "@/components/distributor-finder/DistributorFinderPage";
import { PrivateLabelPage } from "@/components/private-label/PrivateLabelPage";
import { ResourcesPage } from "@/components/resources/ResourcesPage";
import { CertificatesPage, CookiePolicyPage, RequestSamplesPage } from "@/components/site/SupportPages";
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
import { PRODUCT_PAGE_ASSETS, PRODUCT_PAGES } from "@/components/product-page/registry";
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
import catalogTiles from "@/data/catalog-tiles.json";
import { getLegacyStructuredData, getOrganizationStructuredData } from "@/lib/legacy-structured-data";
import { breadcrumbList, faqPage, productSchema, type Crumb } from "@/lib/structured-data";
import fs from "node:fs";
import path from "node:path";
import { publicPath, publicUrl } from "@/lib/site-paths";
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
    path: ["ae", ...path.replace(/^\//, "").split("/")],
  }));

  return [...getStaticSiteParams(), ...articleParams];
}

function glossaryMetadata(entry: GlossaryEntry): Metadata {
  const title = entry.seo.title || entry.title;
  const description = entry.seo.description || entry.excerpt || undefined;
  const canonical = publicUrl(entry.seo.canonical || `${SITE_ORIGIN}${entry.path}`);

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
  const canonical = publicUrl(post.seo.canonical || `${SITE_ORIGIN}${post.path}`);
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
  const canonical = page.canonical || `${SITE_ORIGIN}${publicPath(route)}`;
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
      url: publicUrl(page.openGraph.url) || canonical,
      title: page.openGraph.title || title,
      description: page.openGraph.description || description,
      images: page.openGraph.image ? [{ url: page.openGraph.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: "@thebasebev",
      title,
      description,
      images: page.openGraph.image ? [page.openGraph.image] : undefined,
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

/** Short names for the trail; anything not listed falls back to its title. */
const CRUMB_NAMES: Record<string, string> = {
  "/catalog": "Catalogue",
  "/about-us": "About Us",
  "/contacts": "Contacts",
  "/distributors": "Distributors",
  "/rnd": "R&D",
  "/private-labeling": "Private Labeling",
  "/wholesale-strategy": "Wholesale Strategy",
  "/resources": "Resources",
  "/resources/blog": "Blog",
  "/resources/glossary": "Glossary",
  "/resources/tools": "Tools",
  "/sitemap": "Sitemap",
  "/privacy": "Privacy Policy",
  "/terms": "Terms & Conditions",
  "/knowledge-recipes": "Recipe Base",
};

const HOME: Crumb = { name: "Home", path: "/" };

function crumbName(route: string) {
  return CRUMB_NAMES[route] ?? getSitePage(route)?.title.split(" | ")[0] ?? route;
}

/** Where a route sits, for `BreadcrumbList`. The home page has no trail. */
function breadcrumbsFor(route: string): Crumb[] | null {
  if (route === "/") return null;

  const entry = findGlossaryEntryByPath(route) ?? findBlogPostByPath(route);
  if (entry) {
    const index = findGlossaryEntryByPath(route) ? "/resources/glossary" : "/resources/blog";
    return [
      HOME,
      { name: crumbName("/resources"), path: "/resources" },
      { name: crumbName(index), path: index },
      { name: entry.title, path: route },
    ];
  }

  const product = getProduct(route.slice(1));
  if (product) {
    return [HOME, { name: crumbName("/catalog"), path: "/catalog" }, { name: product.name, path: route }];
  }

  if (!getSitePage(route)) return null;
  const parent = route.startsWith("/resources/") ? [{ name: crumbName("/resources"), path: "/resources" }] : [];
  return [HOME, ...parent, { name: crumbName(route), path: route }];
}

/** The product's own schema block, on pages that render the redesigned body. */
function productStructuredData(route: string) {
  const product = getProduct(route.slice(1));
  if (!product || !PRODUCT_PAGES[product.slug]) return null;
  const tile = (catalogTiles as Record<string, { image?: string; source?: string }>)[product.slug];
  const image = tile?.source === "illustration" ? product.image : tile?.image ?? product.image;
  return productSchema({
    name: product.name,
    description: getSitePage(route)?.description || product.description,
    path: product.route,
    image: image && fs.existsSync(path.join(process.cwd(), "public", image)) ? image : undefined,
    price: product.price,
  });
}

/**
 * Every route, with the two schema blocks React owns on top of whatever the
 * page itself carries: its `BreadcrumbList`, and on a product its `Product`.
 */
export default async function SiteRoute({ params }: RouteProps) {
  const route = normalizeSitePath((await params).path);
  const crumbs = breadcrumbsFor(route);
  const product = productStructuredData(route);
  const needsOrganization = getSitePage(route)?.native || findBlogPostByPath(route) || findGlossaryEntryByPath(route);

  return (
    <>
      {needsOrganization && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: getOrganizationStructuredData() }} />}
      {crumbs && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbList(crumbs) }} />
      )}
      {product && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: product }} />}
      <RouteBody params={params} />
    </>
  );
}

async function RouteBody({ params }: RouteProps) {
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

  if (route === "/private-labeling" || route === "/resources") {
    const structuredData = getLegacyStructuredData(page.file);
    return <div className="tbb">
      {structuredData.map((block, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: block }} />)}
      <SiteHeader />
      {route === "/private-labeling" ? <PrivateLabelPage /> : <ResourcesPage />}
      <SiteFooter />
    </div>;
  }

  const supportPage = route === "/find-your-distributor" ? <DistributorFinderPage />
    : route === "/careers" ? <main><CareersSection standalone /></main>
    : route === "/request-samples" ? <RequestSamplesPage />
    : route === "/certificates" ? <CertificatesPage />
    : route === "/faq" ? <main><AboutFaq standalone /></main>
    : route === "/cookie-policy" ? <CookiePolicyPage /> : null;
  if (supportPage) return <div className="tbb">
    {route === "/faq" && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqPage(ABOUT_FAQS.map(({ question, answer }) => ({ q: question, a: answer }))) }} />}
    <SiteHeader />{supportPage}<SiteFooter />
  </div>;

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
    const overHero = route === "/distributors" || route === "/rnd";
    return (
      <div className="tbb">
        {structuredData.map((block, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: block }}
          />
        ))}
        <SiteHeader
          overHero={overHero}
          noHeroScrim={overHero}
          darkHero={route === "/rnd" || route === "/distributors"}
        />
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
    return (
      <div className="tbb">
        {getLegacyStructuredData(page.file).map((json, index) => (
          <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
        ))}
        <SiteHeader />
        <SitemapPage />
        <SiteFooter />
      </div>
    );
  }

  // A product page is React down to the FAQ and the export from there on. The
  // eight blocks React replaces — the hero, the tab strip, the four figures,
  // the comparative table, the flavours, the usage note, the FAQ and its
  // heading — are all cut out of the markup below by `site-pages.ts`, so the
  // two never both claim the copy or the `h1`. What the export still owns is
  // what no React section has replaced yet: the cookie banner and the four
  // popup lead forms opened by the buttons above.
  const product = getProduct(route.slice(1));

  // Two pages open with a React head instead, and one of them carries its four
  // services in React as well. Both were built on stock Tilda themes and were
  // still opening with the theme rather than with themselves — `site-pages.ts`
  // says exactly what was dropped, and `data/page-intros.ts` holds the copy
  // each page carries in its place.
  const intro = getPageIntro(route);
  const offers = getPageOffers(route);

  // Redesigned products own the visible hero copy; SEO metadata stays above.
  const RedesignedProduct = product ? PRODUCT_PAGES[product.slug] : undefined;

  // Everything else: one shared header and footer, with the old Tilda chrome
  // already removed from the markup server-side.
  return (
    <div className="tbb">
      <SiteHeader overHero={route === "/private-labeling"} productPage={Boolean(product)} />
      {intro && <PageIntro intro={intro} />}
      {offers && <PageOffers offers={offers} />}
      {RedesignedProduct && product ? (
        <RedesignedProduct
          product={product}
          assets={PRODUCT_PAGE_ASSETS[product.slug] ?? {}}
        />
      ) : (
        product && (
          <>
            <ProductHero product={product} />
            <ProductDetails product={product} />
          </>
        )
      )}
      {/* A native route has no export behind it, so nothing to carry over. */}
      {!page.native && <LegacyPageShell page={page} opensPage={!intro && !product} />}
      <SiteFooter />
    </div>
  );
}
