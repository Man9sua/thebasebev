import { About } from "@/components/home/About";
import { BlogCarousel } from "@/components/home/BlogCarousel";
import { Bestsellers } from "@/components/home/Bestsellers";
import { Collage } from "@/components/home/Collage";
import { Hero } from "@/components/home/Hero";
import { LoadingScreen } from "@/components/site/LoadingScreen";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { StackReveal } from "@/components/motion/StackReveal";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getLegacyStructuredData } from "@/lib/legacy-structured-data";

/**
 * The redesigned homepage.
 *
 * Only `/` renders this. Every other route renders the Tilda parity document
 * inside the shared shell, so the migration's SEO surface is untouched while the
 * new design is built out section by section.
 *
 * From Bestsellers down the sections are stacked: each pins at the top of the
 * viewport and the next rides up over it. The hero stays out of it — it has its
 * own entrance, and the header's solid/transparent state is measured against it.
 */
export function HomePage() {
  // The old homepage's JSON-LD travels with the redesign unchanged: FAQPage,
  // WebSite, ContactPoint and the OfferCatalog entries all keep working.
  const structuredData = getLegacyStructuredData("page62361237.html");

  return (
    <div className="tbb">
      {/* First in the tree: its inline script has to run before the header and
          the hero are parsed, or there is a frame of page before the curtain. */}
      <LoadingScreen />

      {structuredData.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: block }}
        />
      ))}

      <SmoothScroll />
      <SiteHeader overHero />
      <main>
        <Hero />
        <StackReveal>
          <Bestsellers />
        </StackReveal>
        <StackReveal>
          <Collage />
        </StackReveal>
        <StackReveal>
          <BlogCarousel />
        </StackReveal>
        <StackReveal>
          <About />
        </StackReveal>
      </main>
      <StackReveal pinned={false}>
        <SiteFooter />
      </StackReveal>
    </div>
  );
}
