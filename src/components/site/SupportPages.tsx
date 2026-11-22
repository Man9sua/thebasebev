import { SampleRequestModal } from "@/components/forms/SampleRequestModal";
import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { SiteLink } from "@/components/site/SiteLink";
import { COMPANY } from "@/lib/site-config";
import styles from "./SupportPages.module.css";

export function RequestSamplesPage() {
  return <main className={styles.page}>
    <h1>Try it on your menu.</h1>
    <p className={styles.intro}>Tell us what you serve and which the Base products you would like to test. Our team will confirm suitable samples and delivery arrangements.</p>
    <div className={styles.links}>
      <SampleRequestModal className={styles.button} label="Request samples" />
      <SiteLink href="/catalog">Explore the range →</SiteLink>
    </div>
  </main>;
}

const QUALITY_ITEMS = [
  { title: "HACCP", text: "Every base is made under a HACCP food safety plan: hazards are identified at each step from raw material intake to packing, and each critical control point is monitored and recorded batch by batch." },
  { title: "ISO 22000", text: "Our food safety management system is certified to ISO 22000, the international standard that covers supplier approval, traceability, hygiene and recall procedures across the whole production chain." },
  { title: "Halal", text: "The range is Halal certified, so cafés, hotels and chains across the UAE, the GCC and other Muslim markets can list our products without extra checks. Certificates are sent on request." },
  { title: "Product specifications", text: "Request ingredients, allergens, nutrition, shelf life and handling information for the exact product and flavour you need." },
];

export function CertificatesPage() {
  return <main className={styles.page}>
    <h1>Quality, documented.</h1>
    <p className={styles.intro}>The right documentation for your product, your business and your market. Contact the Base for current certificates and product specifications.</p>
    <div className={styles.cards}>{QUALITY_ITEMS.map(({ title, text }) => <section key={title} className={styles.card}><h2>{title}</h2><p>{text}</p></section>)}</div>
    {/* Facts a buyer or importer checks before listing a supplier: where the
        product is made, what documents come with it and whom to ask. */}
    <div className={styles.copy}>
      <h2>Made in our own UAE factory</h2>
      <p>The Base produces its dry beverage bases in its own factory in the UAE, so formulation, production and quality control stay under one roof. The same certified process supplies more than 5,000 points of sale in 26 countries, from single cafés to international chains and distributors.</p>
      <h2>Documents for your market</h2>
      <p>Import rules differ between markets. Tell us the products, the flavours and the destination country, and we send the matching set: HACCP and ISO 22000 certificates, Halal certificate and product specifications.</p>
      <h2>Ask our team or visit the showroom</h2>
      <p>Write to <a href="mailto:sales@thebasebev.com?subject=Product%20certificates%20and%20specifications">sales@thebasebev.com</a> for current certificates. You can also see and taste the range at our showroom in Al Quoz Industrial Area 2, Dubai, open Monday to Saturday, 9:00 to 18:00, closed on Sunday.</p>
    </div>
    <a className={styles.button} href={`mailto:${COMPANY.email}?subject=Product%20certificates%20and%20specifications`}>Request documentation</a>
  </main>;
}

export function CookiePolicyPage() {
  return <main className={styles.page}>
    <h1>Cookie policy.</h1>
    <div className={styles.copy}>
      <p>This page describes storage used by the Base website. Your browser can also control or remove cookies and website data.</p>
      <h2>Necessary storage</h2>
      <p>The first-party <code>tbb-consent</code> cookie remembers your analytics and marketing choices for twelve months. It records both acceptance and refusal. Necessary storage also keeps forms and browsing preferences working.</p>
      <h2>Analytics and marketing</h2>
      <p>Optional analytics and marketing are controlled separately in cookie settings. The site starts with both categories disabled until you make a choice. When enabled, the configured analytics provider may use its own cookies.</p>
      <h2>Form attribution</h2>
      <p>The website remembers your initial referral and campaign information so that a request retains its source. This information accompanies a form submission, including the landing page, current page and referrer.</p>
      <h2>Change your choice</h2>
      <p>You can reopen settings using the button below or the footer. Clearing browser data also removes stored preferences.</p>
      <div className={styles.links}><CookieSettingsButton className={styles.button} /><SiteLink href="/privacy">Privacy policy →</SiteLink></div>
      <h2>Contact</h2><p>Questions about website data: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.</p>
    </div>
  </main>;
}
