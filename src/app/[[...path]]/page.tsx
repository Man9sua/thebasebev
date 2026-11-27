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
import { ShopPage } from "@/components/shop/ShopPage";
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
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { ZoomCallBlock } from "@/components/site/ZoomCallBlock";
import { PRIVACY_POLICY, TERMS_AND_CONDITIONS } from "@/components/legal/legal-content";
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

const ZOOM_CALL_RECORD = "rec2503542591";

const CRUMB_NAMES: Record<string, string> = {
  "/catalog": "Shop",
  "/about-us": "About Us",
  "/contacts": "Contacts",
  "/distributors": "Distributors",
  "/rnd": "R&D",
  "/private-labeling": "Private Labeling",
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
          <ShopPage />
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
    const runtimePage = withoutLegacyRecords(page, ["rec2429369331", "rec2430603261", ZOOM_CALL_RECORD]);
    return (
      <div className="tbb">
        <SiteHeader />
        <ToolsPage />
        <LegacyPageShell page={runtimePage} runtimeOnly />
        <ZoomCallBlock />
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

  if (route === "/privacy" || route === "/terms") {
    const legalRecord = route === "/privacy" ? "rec2430715951" : "rec2546753201";
    const runtimePage = withoutLegacyRecords(page, [legalRecord, ZOOM_CALL_RECORD]);
    return (
      <div className="tbb">
        <SiteHeader />
        <LegalDocumentPage content={route === "/privacy" ? PRIVACY_POLICY : TERMS_AND_CONDITIONS} />
        <LegacyPageShell page={runtimePage} runtimeOnly />
        <SiteFooter />
      </div>
    );
  }

  const product = getProduct(route.slice(1));

  const intro = getPageIntro(route);
  const offers = getPageOffers(route);

  const RedesignedProduct = product ? PRODUCT_PAGES[product.slug] : undefined;

  const zoomCall = !page.native && page.bodyHtml.includes(`id="${ZOOM_CALL_RECORD}"`);
  const shellPage = zoomCall ? withoutLegacyRecords(page, [ZOOM_CALL_RECORD]) : page;

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
      {!page.native && <LegacyPageShell page={shellPage} opensPage={!intro && !product} />}
      {zoomCall && <ZoomCallBlock />}
      <SiteFooter />
    </div>
  );
}
