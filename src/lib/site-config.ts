/**
 * Configuration for the redesigned surfaces.
 *
 * Everything here is meant to be edited without touching a component.
 */

/**
 * The brand film is no longer the hero — the hero is the product.
 *
 * The encoded files stay in `public/video/` (3.9 MB desktop / 1.8 MB mobile
 * plus a poster) so the asset is available if it is wanted elsewhere. Nothing
 * renders them today.
 */
export const BRAND_VIDEO = {
  desktop: "/video/base-hero.mp4",
  mobile: "/video/base-hero-mobile.mp4",
  poster: "/video/base-hero-poster.jpg",
} as const;

/**
 * Regions offered by the header picker, copied from the control on production.
 *
 * Display-only for now — see RegionPicker. The shape matches the future
 * locale/currency model in PROJECT_CONTEXT.md so wiring it up later is a data
 * change rather than a rewrite.
 *
 * No `flag` field, deliberately. Emoji flags are regional-indicator pairs and
 * Windows ships no glyphs for them, so every browser there falls back to
 * drawing the two letters — which is the country code the picker already
 * prints beside it. The result was "AE AE" for every Windows visitor. The code
 * on its own renders the same everywhere.
 */
export type Region = {
  short: string;
  label: string;
  name: string;
  currency: string;
};

export const REGIONS: Region[] = [
  { short: "AE", label: "UAE (EN)", name: "United Arab Emirates", currency: "AED" },
  { short: "SA", label: "KSA (EN)", name: "Saudi Arabia", currency: "SAR" },
  { short: "KZ", label: "KZ (RU)", name: "Kazakhstan", currency: "KZT" },
  { short: "RU", label: "RU (RU)", name: "Russia", currency: "RUB" },
  { short: "UK", label: "UK (EN)", name: "United Kingdom", currency: "GBP" },
];

export const SITE_NAV = [
  { label: "Shop", href: "/catalog" },
  { label: "Private Label", href: "/private-labeling" },
  { label: "Distributors", href: "/distributors" },
  { label: "R&D", href: "/rnd" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/#about" },
  { label: "Contacts", href: "/contacts" },
] as const;

export const FOOTER_LINKS = {
  products: [
    { label: "Shop", href: "/catalog" },
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
/**
 * `phoneAlt` used to carry +971 58 932 7887. It is retired: the export still
 * contains it in 37 files, and the site ships a `fixPhone` script that rewrites
 * every occurrence — links, text nodes and WhatsApp numbers — to the number
 * below on page load. Publishing it from the shared footer meant the React shell
 * was the one place still advertising a number the business rewrites away, and
 * `fixPhone` duly corrected it after hydration, which is what broke hydration on
 * every parity page. One number, and it is this one.
 */
export const COMPANY = {
  legalName: "The Base Beverage LLC",
  city: "Dubai",
  country: "United Arab Emirates",
  phone: "+971 50 989 0429",
  phoneHref: "tel:+971509890429",
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
