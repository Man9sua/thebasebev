export type PageIntro = {
  title: string;
  legacyH1?: string;
  tagline?: string;
  lead: string;
  video?: string;
  tone?: "dark";
};

export const PAGE_INTROS: Record<string, PageIntro> = {
  "/private-labeling": {
    title: "Wholesale and Private Labeling",
    tagline: "Your Brand. Our Craft.",
    lead:
      "We design and manufacture exclusive beverage formulations for brands who refuse to " +
      "compromise — from concept to finished product, made in the UAE.",
    video: "/images/vide6532-6533-4465-b562-656236323061__11900460_1920_1080_2.mp4",
  },
  "/rnd": {
    tone: "dark",
    title: "Beverage R&D and Product Development in Dubai",
    lead:
      "Custom beverage R&D in Dubai: recipe development, flavour matching and pilot batches " +
      "for HORECA and private label brands across the UAE and GCC.",
  },
};

export function getPageIntro(route: string) {
  return PAGE_INTROS[route];
}

export type PageOffer = {
  title: string;
  from: string;
  description: string;
  image: string;
};

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
