import { ABOUT_FAQS } from "./about-faqs";
import styles from "./AboutFaq.module.css";

export function AboutFaq({ standalone = false }: { standalone?: boolean }) {
  const Heading = standalone ? "h1" : "h2";
  return (
    <section className={`${styles.section} ${standalone ? styles.standalone : ""}`} aria-labelledby="about-faq-title">
      <div className={styles.inner}>
        <Heading id="about-faq-title">Frequently asked questions</Heading>
        <div className={styles.list}>
          {ABOUT_FAQS.map((faq) => (
            <details name="about-faq" key={faq.question}>
              <summary><span>{faq.question}</span><i aria-hidden="true" /></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
