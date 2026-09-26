/**
 * Configuration for the redesigned surfaces.
 *
 * Everything here is meant to be edited without touching a component.
 */

/**
 * The brand film. It is not the hero — the hero is a photograph — and it plays
 * inside the homepage's About frame, lazily and muted: see `BrandFilm`.
 *
 * 3.9 MB desktop and 1.8 MB mobile plus a poster, in `public/video/`. Only the
 * desktop encode is rendered today; the mobile one is here for whenever the
 * frame gets a source of its own on a small screen.
 */
export const BRAND_VIDEO = {
  desktop: "/video/base-hero.mp4",
  mobile: "/video/base-hero-mobile.mp4",
  poster: "/video/base-hero-poster.jpg",
} as const;

/**
 * The menu's first level — the four the redesign sets in Black caps.
 *
 * Every href is a route of its own. "About Us" used to be `/#about`, an anchor
 * on the homepage that no section carries an id for, so the menu's About just
 * reloaded the homepage while `/about-us` — a real page, indexable, and one the
 * footer already links to — went unlinked from the menu entirely.
 *
 * The first label went "Shop" → "Catalogue" with the menu redesign and back
 * again with the hero redesign, which is the newer document and the one the
 * owner pointed at: its bar reads Shop · Distributors · R&D · About, and so
 * does the site review's note about the header. The page it opens is still
 * headed CATALOGUE, because that is what the catalogue document draws — the
 * link is the shop, the page is the range.
 */
export const SITE_NAV = [
  { label: "Shop", href: "/catalog" },
  { label: "Distributors", href: "/distributors" },
  { label: "R&D", href: "/rnd" },
  { label: "About", href: "/about-us" },
] as const;

/**
 * The menu's second level, and the rest of what `SiteSearch` offers: three real
 * pages that are not one of the four above. A quieter row under the display
 * type rather than three more 72px headings.
 */
export const SITE_NAV_SECONDARY = [
  { label: "Private label", href: "/private-labeling" },
  { label: "Resources", href: "/resources" },
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
    { label: "Distributors", href: "/distributors" },
    { label: "R&D", href: "/rnd" },
    { label: "Contacts", href: "/contacts" },
  ],
  resources: [
    { label: "Blog", href: "/resources/blog" },
    { label: "Glossary", href: "/resources/glossary" },
    { label: "Tools", href: "/resources/tools" },
    { label: "Wholesale Strategy", href: "/wholesale-strategy" },
  ],
  /*
   * The bottom line of the footer. The redesign moves Sitemap here, out of
   * Resources: it is a map of the site rather than something to read, which is
   * what the other three in that column are. Every route stays linked — the
   * three columns and this row are the same set, dealt differently.
   */
  legal: [
    { label: "Sitemap", href: "/sitemap" },
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
  /* The same number on WhatsApp, which the menu redesign puts beside it.
     `wa.me/971509890429` is the link the export already carries on 110 of its
     pages, so this publishes a channel the business runs rather than one
     invented to fill a slot in a mockup. */
  whatsappHref: "https://wa.me/971509890429",
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
