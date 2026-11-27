export type Entry = {
  href: string;
  category: string;
  title: string;
  summary: string;
  image: string;
  date?: string;
};

export const HOMEPAGE_ENTRIES: Entry[] = [
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
