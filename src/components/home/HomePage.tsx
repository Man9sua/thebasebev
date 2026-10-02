import { About } from "@/components/home/About";
import { BlogCarousel } from "@/components/home/BlogCarousel";
import { Bestsellers } from "@/components/home/Bestsellers";
import { Collage } from "@/components/home/Collage";
import { Hero } from "@/components/home/Hero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getLegacyStructuredData } from "@/lib/legacy-structured-data";

/**
 * The homepage.
 *
 * Five sections: the photographic hero, the bestsellers carousel, the collage,
 * the editorial rail and the About block the brand film plays inside.
 *
 * This is the page as it stood before `5992bb5` rebuilt it from the Figma file
 * into eight sections — hero, four savings, the range as a 4×4 grid, four
 * reasons, two offer cards, the team photograph, four assurances and a
 * distributor form. The owner asked for this one back; the film in About is
 * what they missed, and the rest of that page comes with it. The eight
 * redesigned sections are in the history at `5992bb5` if any of them should
 * return.
 *
 * Two things are deliberately not restored with it:
 *
 * - **`data/posts.ts`**, the five existing pages the editorial rail was seeded
 *   with while the blog feed returned nothing. The blog is real now, so the
 *   rail reads it — see `BlogCarousel`.
 * - **the distributor form.** It arrived with the redesign, so it is not part
 *   of this page; `/distributors`, `/contacts` and `/rnd` all still carry one.
 *   Worth knowing, because it means the homepage no longer captures a lead.
 *
 * Only `/` renders this. Every other route renders the Tilda parity document
 * inside the shared shell, so the migration's SEO surface is untouched.
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
