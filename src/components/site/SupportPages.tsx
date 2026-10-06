import { SampleRequestModal } from "@/components/forms/SampleRequestModal";
import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { SiteLink } from "@/components/site/SiteLink";
import { COMPANY } from "@/lib/site-config";
import styles from "./SupportPages.module.css";

function Breadcrumb({ title }: { title: string }) {
  return <nav className={styles.breadcrumbs} aria-label="Breadcrumb"><SiteLink href="/">Home</SiteLink> / {title}</nav>;
}

export function RequestSamplesPage() {
  return <main className={styles.page}>
    <Breadcrumb title="Request samples" />
    <h1>Try it on your menu.</h1>
    <p className={styles.intro}>Tell us what you serve and which THE BASE products you would like to test. Our team will confirm suitable samples and delivery arrangements.</p>
    <div className={styles.links}>
      <SampleRequestModal className={styles.button} label="Request samples" />
      <SiteLink href="/catalog">Explore the range →</SiteLink>
    </div>
  </main>;
}

const QUALITY_ITEMS = [
  { title: "HACCP", text: "Food safety controls across production. Ask our team for current documentation relevant to your order." },
  { title: "Halal", text: "Halal documentation is available on request. Confirm product and destination requirements with our team." },
  { title: "Product specifications", text: "Request ingredients, allergens, nutrition and handling information for the exact product and flavour you need." },
];

export function CertificatesPage() {
  return <main className={styles.page}>
    <Breadcrumb title="Certificates" />
    <h1>Quality, documented.</h1>
    <p className={styles.intro}>The right documentation for your product, your business and your market. Contact THE BASE for current certificates and product specifications.</p>
    <div className={styles.cards}>{QUALITY_ITEMS.map(({ title, text }) => <section key={title} className={styles.card}><h2>{title}</h2><p>{text}</p></section>)}</div>
    <a className={styles.button} href={`mailto:${COMPANY.email}?subject=Product%20certificates%20and%20specifications`}>Request documentation</a>
  </main>;
}

export function CookiePolicyPage() {
  return <main className={styles.page}>
    <Breadcrumb title="Cookie policy" />
    <h1>Cookie policy.</h1>
    <div className={styles.copy}>
      <p>This page describes storage used by the THE BASE website. Your browser can also control or remove cookies and website data.</p>
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
