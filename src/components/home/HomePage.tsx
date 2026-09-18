import { About } from "@/components/home/About";
import { Advantages } from "@/components/home/Advantages";
import { Credentials } from "@/components/home/Credentials";
import { Features } from "@/components/home/Features";
import { Hero } from "@/components/home/Hero";
import { Partner } from "@/components/home/Partner";
import { Products } from "@/components/home/Products";
import { Signature } from "@/components/home/Signature";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getLegacyStructuredData } from "@/lib/legacy-structured-data";

/**
 * The homepage.
 *
 * Eight sections in the order the design file stacks them: the hero, the four
 * savings, the range, the four reasons, the two offers, the team, the four
 * assurances, and the distributor form. Header and footer are untouched — the
 * design carries both as instances of the symbols already built.
 *
 * Only `/` renders this. Every other route renders the Tilda parity document
 * inside the shared shell, so the migration's SEO surface is untouched while
 * the new design is built out section by section.
 *
 * The blog carousel and the brand film are no longer here: the design replaces
 * that part of the page with the team photograph and the assurances. Neither
 * the posts nor the video were deleted.
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
        <Advantages />
        <Products />
        <Features />
        <Signature />
        <About />
        <Credentials />
        <Partner />
      </main>
      <SiteFooter />
    </div>
  );
}
