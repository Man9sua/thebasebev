import { PublicLink as Link } from "@/components/site/PublicLink";
import { CATALOG_GROUPS, CATALOG_PRODUCTS } from "@/data/catalog";
import { DISTRIBUTOR_MARKETS } from "@/data/distributor-markets";
import { SHOP_URL } from "@/lib/site-config";
import styles from "./SitemapPage.module.css";

type SitemapLink = { label: string; href: string; external?: boolean };
type SitemapSection = { title: string; links: readonly SitemapLink[] };

const SECTIONS: readonly SitemapSection[] = [
  {
    title: "Company",
    links: [
      { href: "/", label: "Home" },
      { href: "/about-us", label: "About us" },
      { href: "/careers", label: "Careers" },
      { href: "/contacts", label: "Contacts" },
    ],
  },
  {
    title: "Work with us",
    links: [
      { href: "/distributors", label: "Distributors" },
      { href: "/private-labeling", label: "Private label" },
      { href: "/rnd", label: "R&D" },
      { href: "/request-samples", label: "Request samples" },
      { href: "/contacts", label: "Get a quote" },
      { href: "/find-your-distributor", label: "Find your distributor" },
      { href: "/wholesale-strategy", label: "Wholesale strategy" },
    ],
  },
  {
    title: "Quality",
    links: [
      { href: "/about-us#quality-control", label: "Quality control" },
      { href: "/certificates", label: "Certificates: HACCP and Halal" },
      { href: "/about-us#laboratory", label: "Our lab" },
      { href: "/about-us#manufacturing", label: "Our factory" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources", label: "Resources hub" },
      { href: "/resources/blog", label: "Blog" },
      { href: "/resources/glossary", label: "Glossary" },
      { href: "/resources/tools", label: "Cost calculator and tools" },
      { href: "/knowledge-recipes", label: "Recipe base" },
      { href: "/faq", label: "FAQ" },
    ],
  },
];

const LEGAL_LINKS: readonly SitemapLink[] = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms and conditions" },
  { href: "/cookie-policy", label: "Cookie policy" },
];

const PRODUCT_SECTIONS: readonly SitemapSection[] = CATALOG_GROUPS.map((group) => ({
  title: group.id === "bar" ? "Bar ingredients" : group.id === "business" ? "Bisuness lines" : group.label,
  links: CATALOG_PRODUCTS.filter((product) => product.categoryId === group.id).map((product) => ({
    href: product.route,
    label: product.name,
  })),
}));

function SitemapLinkList({ links }: { links: readonly SitemapLink[] }) {
  return (
    <ul className={styles.linkList}>
      {links.map((link) => (
        <li key={link.label}>
          {link.external ? (
            <a className={styles.link} href={link.href} target="_blank" rel="noopener">
              {link.label} <span aria-hidden="true">&#8599;</span>
            </a>
          ) : (
            <Link className={styles.link} href={link.href} prefetch={false}>{link.label}</Link>
          )}
        </li>
      ))}
    </ul>
  );
}

export function SitemapPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.intro}>
          <h1>Sitemap</h1>
          <p>Every page of the Base: company, services, {CATALOG_PRODUCTS.length} product categories, quality, resources and our {DISTRIBUTOR_MARKETS.length} markets.</p>
        </header>
        <nav className={styles.sitemap} aria-label="Website sitemap">
          <div className={styles.primaryGrid}>
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2>{section.title}</h2>
                <SitemapLinkList links={section.links} />
              </section>
            ))}
          </div>
          <section className={styles.products}>
            <header className={styles.sectionHeading}>
              <h2>Products <span aria-hidden="true">&#183;</span> {CATALOG_PRODUCTS.length} <span className={styles.desktopOnly}>categories</span></h2>
              <Link className={styles.catalogLink} href="/catalog" prefetch={false}>Catalogue <span aria-hidden="true">&#8594;</span></Link>
            </header>
            <div className={styles.productGrid}>
              {PRODUCT_SECTIONS.map((section) => (
                <section key={section.title}>
                  <h3>{section.title}</h3>
                  <SitemapLinkList links={section.links} />
                </section>
              ))}
            </div>
            <a className={styles.shopLink} href={SHOP_URL} target="_blank" rel="noopener">Online shop for cafés and home <span aria-hidden="true">&#8599;</span></a>
          </section>
          <section className={styles.markets}>
            <header className={styles.sectionHeading}>
              <h2>Markets <span aria-hidden="true">&#183;</span> {DISTRIBUTOR_MARKETS.length} <span className={styles.desktopOnly}>countries</span></h2>
              <p>Select a market to find your distributor.</p>
            </header>
            <ul className={styles.marketGrid}>
              {DISTRIBUTOR_MARKETS.map((market) => (
                <li key={market.code}>
                  <Link className={styles.marketLink} href={`/find-your-distributor?market=${market.code}`} prefetch={false}>
                    <span>{market.name}</span><span className={styles.marketCode}>/{market.code.toLowerCase()}/</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <div className={styles.legal}><SitemapLinkList links={LEGAL_LINKS} /></div>
        </nav>
      </div>
    </main>
  );
}
