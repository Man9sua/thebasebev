export const DISTRIBUTOR_GROUPS = [
  "Gulf",
  "Levant & North Africa",
  "Central Asia & Caucasus",
] as const;

export type DistributorMarket = {
  code: string;
  name: string;
  group: (typeof DISTRIBUTOR_GROUPS)[number];
  languages: string;
};

/** Market list supplied with the distributor design. Only UAE contacts are confirmed. */
export const DISTRIBUTOR_MARKETS: readonly DistributorMarket[] = [
  { code: "AE", name: "UAE", group: "Gulf", languages: "EN · AR" },
  { code: "SA", name: "Saudi Arabia", group: "Gulf", languages: "EN · AR" },
  { code: "QA", name: "Qatar", group: "Gulf", languages: "EN · AR" },
  { code: "KW", name: "Kuwait", group: "Gulf", languages: "EN · AR" },
  { code: "OM", name: "Oman", group: "Gulf", languages: "EN · AR" },
  { code: "BH", name: "Bahrain", group: "Gulf", languages: "EN · AR" },
  { code: "EG", name: "Egypt", group: "Levant & North Africa", languages: "EN · AR" },
  { code: "IQ", name: "Iraq", group: "Levant & North Africa", languages: "EN · AR" },
  { code: "JO", name: "Jordan", group: "Levant & North Africa", languages: "EN · AR" },
  { code: "PS", name: "Palestine", group: "Levant & North Africa", languages: "EN · AR" },
  { code: "LB", name: "Lebanon", group: "Levant & North Africa", languages: "EN · AR" },
  { code: "TR", name: "Türkiye", group: "Levant & North Africa", languages: "EN · TR" },
  { code: "KZ", name: "Kazakhstan", group: "Central Asia & Caucasus", languages: "EN · RU" },
  { code: "UZ", name: "Uzbekistan", group: "Central Asia & Caucasus", languages: "EN · RU" },
  { code: "KG", name: "Kyrgyzstan", group: "Central Asia & Caucasus", languages: "EN · RU" },
  { code: "TM", name: "Turkmenistan", group: "Central Asia & Caucasus", languages: "EN · RU" },
  { code: "AZ", name: "Azerbaijan", group: "Central Asia & Caucasus", languages: "EN · RU" },
];
