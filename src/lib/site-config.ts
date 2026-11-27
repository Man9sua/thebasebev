import { DISTRIBUTOR_MARKETS } from "@/data/distributor-markets";
import { countryPath } from "@/lib/country-paths";

export type Market = {
  code: string;
  name: string;
  label: string;
  language: string;
  href: string;
};

export const MARKETS: readonly Market[] = DISTRIBUTOR_MARKETS.map((market) => ({
  code: market.code,
  name: market.code === "AE" ? "United Arab Emirates" : market.name,
  label: market.code === "AE" ? "UAE" : market.code,
  language: "EN",
  href: countryPath("/", market.code),
}));

export const CURRENT_MARKET = MARKETS.find((market) => market.code === "AE")!;

export const SHOP_URL = "/catalog";

export const ODOO_ACCOUNT_URL = "https://odoo.thebasebev.com/my";

export const SITE_NAV = [
  { label: "Shop", href: SHOP_URL },
  { label: "Distributors", href: "/distributors" },
  { label: "R&D", href: "/rnd" },
  { label: "About", href: "/about-us" },
] as const;

export const SITE_NAV_SECONDARY = [
  { label: "Private label", href: "/private-labeling" },
  { label: "Resources", href: "/resources" },
  { label: "Contacts", href: "/contacts" },
] as const;

export const FOOTER_LINKS = {
  products: [
    { label: "Shop", href: SHOP_URL },
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
  ],
  legal: [
    { label: "Sitemap", href: "/sitemap" },
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
} as const;

export const COMPANY = {
  legalName: "The Base Beverage LLC",
  city: "Dubai",
  country: "United Arab Emirates",
  phone: "+971 50 989 0429",
  phoneHref: "tel:+971509890429",
  whatsappHref: "https://wa.me/971509890429",
  email: "info@thebasebev.com",
  emailHref: "mailto:info@thebasebev.com",
} as const;

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/thebasebev/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/the-base-beverage-llc/" },
  { label: "YouTube", href: "https://youtube.com/@thebasebev" },
  { label: "Facebook", href: "https://www.facebook.com/p/The-Base-Beverage-61572299409113/" },
] as const;
