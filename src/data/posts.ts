/**
 * Editorial entries for the homepage carousel.
 *
 * ## Why these are not blog posts
 *
 * The site's blog is a Tilda `t-feed` (`feeduid: 699537006591`). Its posts live
 * on Tilda's servers and are injected into the page at runtime — the export
 * contains only the empty feed container and its preloader skeletons. On the
 * migrated clone the feed fetches nothing at all: `/resources/blog` renders zero
 * posts today. That is a pre-existing gap in the migration, not something the
 * redesign introduced.
 *
 * Rather than invent articles, the carousel is seeded with pages that genuinely
 * exist and already rank. Every title and summary below is that page's own
 * `<title>` and meta description, copied verbatim from the export.
 *
 * ## Replacing this with the real feed
 *
 * `HOMEPAGE_ENTRIES` is the only thing `BlogCarousel` reads. When posts become
 * available — a CMS, a Tilda feed export, or an API — map them to `Entry` and
 * export them from here. No component changes.
 *
 * `date` is optional and deliberately unset: these pages carry no publication
 * date, and inventing one would put a false signal in front of readers and
 * crawlers alike.
 */

export type Entry = {
  href: string;
  category: string;
  title: string;
  summary: string;
  image: string;
  /** ISO date, when the source actually has one. */
  date?: string;
};

export const HOMEPAGE_ENTRIES: Entry[] = [
  {
    href: "/resources/blog",
    category: "Guides",
    title: "B2B Beverage Blog",
    summary:
      "Practical guidance on beverage bases and B2B supply for cafés, restaurants and distributors.",
    image: "/images/tild3239-6265-4237-b866-373233306262__photo-1772986564376-.jpg",
  },
  {
    href: "/wholesale-strategy",
    category: "Market",
    title: "Wholesale Strategy and Market Insights",
    summary:
      "Wholesale beverage distribution in the GCC: margins, MOQ, supplier checklist and the mistakes that cost money.",
    image: "/images/tild3935-6337-4533-a633-643534346539__photo-1590497008432-.jpg",
  },
  {
    href: "/rnd",
    category: "R&D",
    title: "Beverage R&D and Product Development",
    summary:
      "Custom beverage R&D in Dubai: recipe development, flavour matching and pilot batches for HoReCa and private label.",
    image: "/images/tild6565-3533-4465-b561-303337656436__photo-1530037335614-.jpg",
  },
  {
    href: "/resources/tools",
    category: "Tools",
    title: "HoReCa Cost Calculator",
    summary:
      "Estimate ingredient costs, portion pricing and margins for cafés and restaurants.",
    image: "/images/tild3232-3361-4536-b535-383330393461__photo-1732365898359-.jpg",
  },
  {
    href: "/private-labeling",
    category: "Service",
    title: "Private Label & Wholesale Premixes",
    summary:
      "Beverage premixes under your own brand: sixteen product lines, custom development and contract manufacturing.",
    image: "/images/tild3061-3436-4265-b762-383638623261__apron.jpg",
  },
  {
    href: "/resources/glossary",
    category: "Reference",
    title: "Beverage Glossary",
    summary:
      "Definitions of key beverage and HoReCa supply terms, from base powders to garnishes.",
    image: "/images/tild3161-3138-4736-b333-353231303039__photo-1447933601403-.jpg",
  },
  {
    href: "/distributors",
    category: "Partnership",
    title: "Beverage Distributors in Dubai",
    summary:
      "Bulk supply for cafés and restaurants, and partnership terms for regional distributors.",
    image: "/images/tild3433-6466-4661-b034-656563323035__photo-1627309366653-.jpg",
  },
];
