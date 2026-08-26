import { HomeExperience } from "@/components/home/HomeExperience";
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
      {structuredData.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: block }}
        />
      ))}

      <HomeExperience />
    </div>
  );
}
