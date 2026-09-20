/**
 * Configuration for the redesigned surfaces.
 *
 * Everything here is meant to be edited without touching a component.
 */

/**
 * The brand film belongs to the restored homepage's About section. It is
 * requested only once that section approaches the viewport.
 */
export const BRAND_VIDEO = {
  desktop: "/video/base-hero.mp4",
  mobile: "/video/base-hero-mobile.mp4",
  poster: "/video/base-hero-poster.jpg",
} as const;

/**
 * The menu, and — through `SiteSearch` — the pages the search box offers.
 *
 * Every href is a route of its own. "About Us" used to be `/#about`, an anchor
 * on the homepage that no section carries an id for, so the menu's About just
 * reloaded the homepage while `/about-us` — a real page, indexable, and one the
 * footer already links to — went unlinked from the menu entirely.
 */
export const SITE_NAV = [
  { label: "Shop", href: "/catalog" },
  { label: "Private Label", href: "/private-labeling" },
  { label: "Distributors", href: "/distributors" },
  { label: "R&D", href: "/rnd" },
  { label: "Resources", href: "/resources" },
  { label: "About Us", href: "/about-us" },
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
