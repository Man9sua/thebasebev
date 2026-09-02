import Link from "next/link";
import styles from "./SitemapPage.module.css";

type SitemapLink = {
  href: string;
  label: string;
};

type SitemapSection = {
  title: string;
  links: readonly SitemapLink[];
};

const PRIMARY_SECTIONS: readonly SitemapSection[] = [
  {
    title: "Company",
    links: [
      { href: "/", label: "Home" },
      { href: "/about-us", label: "About Us" },
      { href: "/contacts", label: "Contact" },
      { href: "/distributors", label: "Wholesale & Distributors" },
      { href: "/private-labeling", label: "Private Labeling" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources", label: "Resources Hub" },
      { href: "/resources/blog", label: "Blog" },
      { href: "/resources/glossary", label: "Glossary" },
      { href: "/resources/tools", label: "HoReCa Cost Calculator & Tools" },
      { href: "/knowledge-recipes", label: "Recipe Base" },
      {
        href: "/wholesale-strategy",
        label: "Wholesale Strategy & Market Insights",
      },
    ],
  },
];

const LEGAL_SECTION: SitemapSection = {
  title: "Legal & Compliance",
  links: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms & Conditions" },
  ],
};

const PRODUCT_SECTIONS: readonly SitemapSection[] = [
  {
    title: "Cold & Refreshing",
    links: [
      { href: "/milkshake", label: "Milkshake" },
      { href: "/frappe", label: "Frappe" },
      { href: "/iced-tea", label: "Iced Tea" },
      { href: "/cordial", label: "Cordial" },
    ],
  },
  {
    title: "Coffee & Specialty",
    links: [
      { href: "/raf-coffee", label: "RAF Coffee" },
      { href: "/cream-latte", label: "Cream Latte" },
      { href: "/chai-latte", label: "Chai Latte" },
      { href: "/matcha", label: "Matcha" },
      { href: "/chocolate", label: "Chocolate" },
    ],
  },
  {
    title: "Bar & Ingredients",
    links: [
      { href: "/topping", label: "Topping" },
      { href: "/sugar-syrup", label: "Sugar Syrup" },
      { href: "/jam", label: "Jam & Purees" },
      { href: "/garnish", label: "Garnish & Accents" },
    ],
  },
  {
    title: "Business & Innovation",
    links: [
      { href: "/vending", label: "Vending Solutions" },
      { href: "/sugar-free", label: "Sugar Free Line" },
      { href: "/tea", label: "Tea Infusions" },
    ],
  },
];

function SitemapLinkList({ links }: { links: readonly SitemapLink[] }) {
  return (
    <ul className={styles.linkList}>
      {links.map((link) => (
        <li key={link.href}>
          <Link className={styles.link} href={link.href} prefetch={false}>
            <span>{link.label}</span>
            <span className={styles.arrow} aria-hidden="true">
              &rarr;
            </span>
          </Link>
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
          <p className={styles.eyebrow}>Index & Navigation</p>
          <h1 className={styles.title}>Sitemap</h1>
          <p className={styles.lede}>
            Browse all main pages, resources and product categories.
          </p>
        </header>

        <nav className={styles.sitemap} aria-label="Website sitemap">
          <div className={styles.primaryGrid}>
            {PRIMARY_SECTIONS.map((section, index) => (
              <section className={styles.card} key={section.title}>
                <div className={styles.sectionHeading}>
                  <span className={styles.sectionNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2>{section.title}</h2>
                </div>
                <SitemapLinkList links={section.links} />
              </section>
            ))}
          </div>

          <section className={`${styles.card} ${styles.products}`}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionNumber} aria-hidden="true">
                03
              </span>
              <h2>Product Catalog</h2>
              <Link
                className={styles.catalogLink}
                href="/catalog"
                prefetch={false}
              >
                All Products <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            <div className={styles.productGrid}>
              {PRODUCT_SECTIONS.map((section) => (
                <section className={styles.productGroup} key={section.title}>
                  <h3>{section.title}</h3>
                  <SitemapLinkList links={section.links} />
                </section>
              ))}
            </div>
          </section>

          <section className={`${styles.card} ${styles.legal}`}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionNumber} aria-hidden="true">
                04
              </span>
              <h2>{LEGAL_SECTION.title}</h2>
            </div>
            <SitemapLinkList links={LEGAL_SECTION.links} />
          </section>
        </nav>
      </div>
    </main>
  );
}
