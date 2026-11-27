import { About } from "@/components/home/About";
import { BlogCarousel } from "@/components/home/BlogCarousel";
import { Collage } from "@/components/home/Collage";
import { HomeBestsellers } from "@/components/home/HomeBestsellers";
import { HomeSlider } from "@/components/home/HomeSlider";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getLegacyStructuredData } from "@/lib/legacy-structured-data";

export function HomePage() {
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

      <SiteHeader />
      <main>
        <HomeSlider />
        <HomeBestsellers />
        <Collage />
        <BlogCarousel />
        <About />
      </main>
      <SiteFooter />
    </div>
  );
}
