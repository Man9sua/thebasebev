"use client";

import { useState } from "react";
import { CATALOG_PRODUCTS } from "@/data/catalog";
import { PageAnchor } from "@/components/site/PageAnchor";
import { SiteLink } from "@/components/site/SiteLink";
import { publicPath } from "@/lib/site-paths";
import styles from "./PrivateLabelPage.module.css";

const FACTS = [
  { title: `${CATALOG_PRODUCTS.length} categories`, body: "Bases, purées, sauces and syrups to build your range from" },
  { title: "MOQ 500 kg", body: "Per product, mixed across flavours" },
  { title: "45 days", body: "From approved sample to first production run" },
  { title: "HACCP and Halal", body: "Certified production in the UAE" },
] as const;

const FORMATS = [
  { title: "Private label premixes", condition: "From 2,000 units per SKU", body: `Beverage bases under your brand, chosen from our ${CATALOG_PRODUCTS.length} categories. Fast launch, production that scales with you.` },
  { title: "Custom product development", condition: "Pilot samples included", body: "A drink built from scratch: iced tea, juice or carbonated. Ingredient selection, formulation and pilot samples." },
  { title: "Canned milk drinks", condition: "Oat, coconut and dairy", body: "Ready-to-drink matcha, chocolate and coffee in cans. Dairy-stable formulas, ready for the canning line." },
  { title: "R&D and contract manufacturing", condition: "For large brands", body: "Exclusive formulations and contract production in the UAE, with export documents and scale support." },
] as const;

export function PrivateLabelPage() {
  const [format, setFormat] = useState<string>(FORMATS[0].title);
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="private-label-title">
        <div className={styles.inner}>
          <h1 id="private-label-title">Your brand.<br /><span>Our craft.</span></h1>
          <p className={styles.lead}>We develop and manufacture exclusive beverage formulations for your brand, from the first concept to the finished, packed product. Made in the UAE.</p>
          <div className={styles.actions}>
            <PageAnchor route="/private-labeling" target="private-label-brief" className={styles.primary}>Start your brand</PageAnchor>
            <PageAnchor route="/private-labeling" target="private-label-formats" className={styles.secondary}>How it works</PageAnchor>
          </div>
          <div className={styles.facts}>{FACTS.map((fact) => <div key={fact.title}><h2>{fact.title}</h2><p>{fact.body}</p></div>)}</div>
        </div>
      </section>
      <section id="private-label-formats" className={styles.formats} aria-labelledby="private-label-formats-title">
        <div className={styles.inner}>
          <div className={styles.formatsIntro}><h2 id="private-label-formats-title">Four ways<br />to work with us</h2><PageAnchor className={`${styles.primary} ${styles.desktopQuote}`} route="/private-labeling" target="private-label-brief">Request a quote</PageAnchor></div>
          <div className={styles.grid}>
            {FORMATS.map((item) => <PageAnchor key={item.title} route="/private-labeling" target="private-label-brief" className={styles.card} onClick={() => setFormat(item.title)}><h3>{item.title}</h3><p className={styles.condition}>{item.condition}</p><p>{item.body}</p></PageAnchor>)}
          </div>
          <PageAnchor className={`${styles.primary} ${styles.mobileQuote}`} route="/private-labeling" target="private-label-brief">Request a quote</PageAnchor>
        </div>
      </section>
      <section id="private-label-brief" className={styles.brief} aria-labelledby="private-label-brief-title">
        <div className={styles.briefInner}>
          <h2 id="private-label-brief-title">Start your brand</h2>
          <form id="form1855232921" className={`t-form js-form-proccess ${styles.form}`} data-success-url={publicPath("/thank-you-form")}>
            <input type="hidden" name="tildaspec-formname" value="Custom flavor for your brand" />
            <div className={`t-form__inputsbox ${styles.fields}`}>
              <label><span>Full name</span><input name="name" type="text" autoComplete="name" required /></label>
              <label><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
              <label><span>Phone / WhatsApp</span><input name="Phone" type="tel" autoComplete="tel" required /></label>
              <label><span>Company</span><input name="company" type="text" autoComplete="organization" /></label>
              <label className={styles.full}><span>Format</span><select name="product" value={format} onChange={(event) => setFormat(event.target.value)}>{FORMATS.map((item) => <option key={item.title}>{item.title}</option>)}</select></label>
              <label className={styles.full}><span>Your brief</span><textarea name="text" rows={5} /></label>
              <label className={`${styles.agreement} ${styles.full}`}><input name="privacy-consent" type="checkbox" value="yes" required /><span>I agree to the <SiteLink href="/privacy">Privacy Policy</SiteLink>.</span></label>
              <div className={`js-errorbox-all t-form__errorbox-wrapper ${styles.full} ${styles.error}`} style={{ display: "none" }} role="alert"><span className="js-rule-error js-rule-error-all" /></div>
              <button type="submit" className={`${styles.primary} ${styles.full}`}>Request a quote</button>
            </div>
            <div className={`js-successbox t-form__successbox ${styles.success}`} style={{ display: "none" }} role="status">Thank you. Your brief has been sent to THE BASE team.</div>
          </form>
        </div>
      </section>
    </main>
  );
}
