/**
 * Page heads for the two parity pages whose own opening block had to go.
 *
 * Both are Tilda template pages whose top was template debris rather than
 * content — see `REMOVED_BODY_RECORDS` in `lib/site-pages.ts` for what was
 * dropped and why. Dropping it took each page's `h1` with it, so the heading
 * is written down here and rendered by `PageIntro` instead.
 *
 * The wording is the page's own wherever the page had any: `/private-labeling`
 * keeps its heading and its opening sentence character for character, and only
 * moves them to the top of the page from the bottom, where they were sitting
 * under nothing. `/rnd` is the one place a heading is new — its only `h1` was
 * the Russian calorie calculator that came with the template, and the wording
 * below is that page's own `<title>`, which is the phrase it has been
 * optimised for all along.
 *
 * Anything here is SEO surface. Change it deliberately, not in passing.
 */

export type PageIntro = {
  /** Small label above the heading. */
  eyebrow: string;
  /** The page's `h1`. */
  title: string;
  /**
   * Exact legacy H1 retained only when parity and the visible page title
   * conflict. The replacement title remains the first visible heading.
   */
  legacyH1?: string;
  /** Optional statement between the heading and the lead. */
  tagline?: string;
  lead: string;
  /** Optional background film, muted and looping. */
  video?: string;
  /**
   * Set on a page whose own first block is dark, so the head reads as the top
   * of that page rather than as a white strip resting on it.
   */
  tone?: "dark";
};

export const PAGE_INTROS: Record<string, PageIntro> = {
  "/private-labeling": {
    eyebrow: "Private label",
    title: "Wholesale and Private Labeling",
    tagline: "Your Brand. Our Craft.",
    lead:
      "We design and manufacture exclusive beverage formulations for brands who refuse to " +
      "compromise — from concept to finished product, made in the UAE.",
    video: "/images/vide6532-6533-4465-b562-656236323061__11900460_1920_1080_2.mp4",
  },
  "/rnd": {
    eyebrow: "R&D lab",
    tone: "dark",
    title: "Beverage R&D and Product Development in Dubai",
    legacyH1: "Узнай свою дневную норму за 30 секунд",
    lead:
      "Custom beverage R&D in Dubai: recipe development, flavour matching and pilot batches " +
      "for HORECA and private label brands across the UAE and GCC.",
  },
};

export function getPageIntro(route: string) {
  return PAGE_INTROS[route];
}

/** One thing the company sells, with what it costs to start. */
export type PageOffer = {
  title: string;
  /** The entry point — a minimum order, or a price floor. */
  from: string;
  description: string;
  image: string;
};

/**
 * `/private-labeling`'s four services.
 *
 * Lifted verbatim out of the block they were in — another zero block, laid out
 * as four rounded grey panels each holding a rounded photograph, with the
 * titles running one to three lines so no two cards agreed on where the price
 * sat. `PageOffers` sets the same copy as a row that lines up.
 */
export const PAGE_OFFERS: Record<string, PageOffer[]> = {
  "/private-labeling": [
    {
      title: "Private Label Premixes",
      from: "From 2,000 units per SKU",
      description:
        "Beverage premixes under your brand. 16 core product lines in powder format. " +
        "Fast launch and scalable production, made in the UAE.",
      image: "/images/tild6538-3838-4138-b331-356333373234__rectangle_1131_1.jpg",
    },
    {
      title: "Custom Product Development",
      from: "From 16,000 AED",
      description:
        "Beverage development from scratch — bottled iced tea, juices, carbonated drinks. " +
        "Ingredient selection, formulation, and pilot samples included.",
      image: "/images/tild3462-3061-4138-b930-663963343630__rectangle_1132_1.jpg",
    },
    {
      title: "Canned Milk Based Beverages (Oat, Coconut, Dairy)",
      from: "From 23,500 AED",
      description:
        "RTD matcha, chocolate and coffee drinks in cans. Dairy-stable formulations and " +
        "can-ready recipes.",
      image: "/images/tild6431-3338-4164-a564-336463636163__rectangle_1133_1.jpg",
    },
    {
      title: "Corporate R&D & Contract Manufacturing",
      from: "From 68,000 AED",
      description:
        "Exclusive formulations for large brands. Contract production, export readiness. " +
        "Made in the UAE with origin and scale support.",
      image: "/images/tild6261-3964-4535-b037-643166626332__rectangle_1134_1.jpg",
    },
  ],
};

export function getPageOffers(route: string) {
  return PAGE_OFFERS[route];
}
