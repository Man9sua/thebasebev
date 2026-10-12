"use client";

import { useState } from "react";
import { COMPANY } from "@/lib/site-config";
import { publicPath } from "@/lib/site-paths";
import { SiteLink } from "@/components/site/SiteLink";
import styles from "./CareersSection.module.css";

const AREAS = ["R&D and lab", "Production", "Sales and distribution", "Marketing", "Supply chain"] as const;

export function CareersSection({ standalone = false }: { standalone?: boolean }) {
  const [area, setArea] = useState<string>(AREAS[0]);
  const [message, setMessage] = useState("");
  const Heading = standalone ? "h1" : "h2";

  return (
    <section id="careers" className={`${styles.section} ${standalone ? styles.standalone : ""}`} aria-labelledby="careers-title" data-surface="dark">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <Heading id="careers-title">Build the Base with us</Heading>
          <p>We are growing across 17 markets and looking for technologists, production specialists, sales and supply chain people who want to build a global ingredient brand from Dubai.</p>
          <a href={`${COMPANY.emailHref}?subject=Careers`}>{COMPANY.email}</a>
        </div>
        <form id="form909008440" className={`t-form js-form-proccess ${styles.form}`} data-success-url={publicPath("/thank-you-form")}>
          <input type="hidden" name="tildaspec-formname" value="Join Our Team" />
          <input type="hidden" name="text" value={`Area: ${area}\n\n${message}`} />
          <div className={`t-form__inputsbox ${styles.fields}`}>
            <label><span>Full name</span><input name="name" type="text" autoComplete="name" required /></label>
            <label><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
            <label className={styles.full}><span>Phone / WhatsApp</span><input name="Phone" type="tel" autoComplete="tel" placeholder="+971" required /></label>
            <fieldset className={styles.full}>
              <legend>Area</legend>
              <div className={styles.areas}>
                {AREAS.map((option) => <label key={option}><input type="radio" name="area" value={option} checked={area === option} onChange={() => setArea(option)} /><span>{option}</span></label>)}
              </div>
            </fieldset>
            <div className={`${styles.full} ${styles.upload}`}>
              <span>CV</span>
              <a className={styles.uploadButton} href={`${COMPANY.emailHref}?subject=Careers%20application`}>Email your CV</a>
              <p className={styles.cvNote}>After sending this form, email your PDF CV to {COMPANY.email}.</p>
            </div>
            <label className={`${styles.full} ${styles.message}`}><span>A few words about you</span><textarea rows={4} placeholder="What you do best and why the Base." value={message} onChange={(event) => setMessage(event.target.value)} /></label>
            <div className={`js-errorbox-all t-form__errorbox-wrapper ${styles.full} ${styles.error}`} style={{ display: "none" }} role="alert"><span className="js-rule-error js-rule-error-all" /></div>
            <label className={`${styles.agreement} ${styles.full}`}><input name="privacy-consent" type="checkbox" value="yes" required /><span>I agree to the <SiteLink href="/privacy">Privacy Policy</SiteLink>.</span></label>
            <button className={`${styles.submit} ${styles.full}`} type="submit">Send application</button>
          </div>
          <div className={`js-successbox t-form__successbox ${styles.success}`} style={{ display: "none" }} role="status">Thank you. Your application has been sent to THE BASE team.</div>
        </form>
      </div>
    </section>
  );
}
