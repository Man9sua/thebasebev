/**
 * Configuration for the redesigned surfaces.
 *
 * Everything here is meant to be edited without touching a component.
 */

export const HERO_VIDEO = {
  /**
   * Encoded from the supplied `BASE-VIDEO final2.mp4` (86 MB, 1920x1080, 55s):
   * audio stripped because the hero is always muted, H.264 CRF 30, faststart.
   * Result is 3.9 MB desktop / 1.8 MB mobile.
   */
  desktop: "/video/base-hero.mp4",
  mobile: "/video/base-hero-mobile.mp4",
  poster: "/video/base-hero-poster.jpg",

  /** Below this width the lighter file is used. Matches the CSS breakpoint. */
  mobileBreakpoint: 768,

  /**
   * The source is a finished promo film: it opens on a logo card and ends on a
   * "Simplify your bar operations today" card, so looping it end-to-end shows a
   * hard cut. `seamFadeMs` fades the seam so the restart reads as intentional.
   *
   * To loop only the ambient product footage instead, set `loopStart` /
   * `loopEnd` (seconds). `null` plays the whole film.
   */
  loopStart: null as number | null,
  loopEnd: null as number | null,
  seamFadeMs: 900,

  /**
   * How the frame is anchored when the viewport crops it. The film is centre
   * composed, so mobile keeps the middle rather than drifting to one edge.
   */
  objectPosition: { desktop: "center center", mobile: "center center" },
} as const;

/**
 * Regions offered by the header picker, copied from the control on production.
 *
 * Display-only for now — see RegionPicker. The shape matches the future
 * locale/currency model in PROJECT_CONTEXT.md so wiring it up later is a data
 * change rather than a rewrite.
 */
export type Region = {
  short: string;
  label: string;
  name: string;
  flag: string;
  currency: string;
};

export const REGIONS: Region[] = [
  { short: "AE", label: "UAE (EN)", name: "United Arab Emirates", flag: "🇦🇪", currency: "AED" },
  { short: "SA", label: "KSA (EN)", name: "Saudi Arabia", flag: "🇸🇦", currency: "SAR" },
  { short: "KZ", label: "KZ (RU)", name: "Kazakhstan", flag: "🇰🇿", currency: "KZT" },
  { short: "RU", label: "RU (RU)", name: "Russia", flag: "🇷🇺", currency: "RUB" },
  { short: "UK", label: "UK (EN)", name: "United Kingdom", flag: "🇬🇧", currency: "GBP" },
];

export const SITE_NAV = [
  { label: "Catalog", href: "/catalog" },
  { label: "Private Label", href: "/private-labeling" },
  { label: "Distributors", href: "/distributors" },
  { label: "R&D", href: "/rnd" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about-us" },
  { label: "Contacts", href: "/contacts" },
] as const;

export const FOOTER_LINKS = {
  products: [
    { label: "Catalog", href: "/catalog" },
    { label: "Private Labeling", href: "/private-labeling" },
    { label: "Sugar Free", href: "/sugar-free" },
    { label: "Vending", href: "/vending" },
  ],
  company: [
    { label: "About Us", href: "/about-us" },
    { label: "Wholesale Strategy", href: "/wholesale-strategy" },
    { label: "Distributors", href: "/distributors" },
    { label: "R&D", href: "/rnd" },
  ],
  resources: [
    { label: "Blog", href: "/resources/blog" },
    { label: "Glossary", href: "/resources/glossary" },
    { label: "Tools", href: "/resources/tools" },
    { label: "Sitemap", href: "/sitemap" },
  ],
  legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
} as const;

/** Taken from the existing site — every value appears in the Tilda export. */
export const COMPANY = {
  legalName: "The Base Beverage LLC",
  city: "Dubai",
  country: "United Arab Emirates",
  phone: "+971 50 989 0429",
  phoneHref: "tel:+971509890429",
  phoneAlt: "+971 58 932 7887",
  phoneAltHref: "tel:+971589327887",
  email: "info@thebasebev.com",
  emailHref: "mailto:info@thebasebev.com",
} as const;

/** Live accounts, lifted from the export — none of these are placeholders. */
export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/thebasebev/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/the-base-beverage-llc/" },
  { label: "YouTube", href: "https://youtube.com/@thebasebev" },
  { label: "Facebook", href: "https://www.facebook.com/p/The-Base-Beverage-61572299409113/" },
] as const;
