import { About } from "@/components/home/About";
import { BlogCarousel } from "@/components/home/BlogCarousel";
import { Bestsellers } from "@/components/home/Bestsellers";
import { Collage } from "@/components/home/Collage";
import { Hero } from "@/components/home/Hero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getLegacyStructuredData } from "@/lib/legacy-structured-data";

/**
 * The redesigned homepage.
 *
 * Only `/` renders this. Every other route renders the Tilda parity document
 * inside the shared shell, so the migration's SEO surface is untouched while the
 * new design is built out section by section.
 */
export function HomePage() {
  // The old homepage's JSON-LD travels with the redesign unchanged: FAQPage,
  // WebSite, ContactPoint and the OfferCatalog entries all keep working.
  const structuredData = getLegacyStructuredData("page62361237.html");

  return (
    <div className="tbb">
      {structuredData.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: block }}
        />
      ))}

      <SiteHeader overHero />
      <main>
        <Hero />
        <Bestsellers />
        <Collage />
        <BlogCarousel />
        <About />
      </main>
      <SiteFooter />
    </div>
  );
}
