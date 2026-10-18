import { Fragment } from "react";
import { ZoomCallBlock } from "@/components/site/ZoomCallBlock";
import type { LegalBlock, LegalDocument, LegalText } from "./legal-content";
import styles from "./LegalDocumentPage.module.css";

/**
 * `/privacy` and `/terms` — the exported legal text in the house layout.
 *
 * The words, headings and anchors come from `legal-content.ts` unchanged; this
 * component only decides how they sit on the page: paper, Exo 2, an uppercase
 * Black title and a reading column of roughly seventy characters, closing on
 * the shared Zoom call block the export ended with.
 */

function Text({ runs }: { runs: LegalText[] }) {
  return (
    <>
      {runs.map((run, index) => (
        <Fragment key={index}>
          {run.strong && <strong>{run.strong}</strong>}
          {run.text}
        </Fragment>
      ))}
    </>
  );
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case "p":
      return (
        <p className={styles.paragraph}>
          <Text runs={block.text} />
        </p>
      );
    case "ul":
      return (
        <ul className={styles.list}>
          {block.items.map((item, index) => (
            <li key={index}>
              <Text runs={[item]} />
            </li>
          ))}
        </ul>
      );
    case "cards":
      return (
        <ul className={styles.cards}>
          {block.items.map((item) => (
            <li key={item} className={styles.card}>
              {item}
            </li>
          ))}
        </ul>
      );
    case "contact":
      return (
        <div className={styles.contact}>
          <h3 className={styles.contactName}>{block.name}</h3>
          <dl className={styles.contactRows}>
            {block.rows.map((row) => (
              <div key={row.label} className={styles.contactRow}>
                <dt>{row.label}</dt>
                <dd>{row.href ? <a href={row.href}>{row.value}</a> : row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
  }
}

export function LegalDocumentPage({ content }: { content: LegalDocument }) {
  return (
    <main className={styles.page}>
      <article className={styles.article} aria-labelledby="legal-title">
        <div className={styles.head}>
          <span className={styles.badge}>{content.badge}</span>
          <h1 id="legal-title" className={styles.title}>
            {content.title}
          </h1>
          {content.meta && (
            <p className={styles.meta}>
              {content.meta.map((item) => (
                <span key={item.label}>
                  <strong>{item.label}</strong> {item.value}
                </span>
              ))}
            </p>
          )}
          {content.nav && (
            <nav className={styles.nav} aria-label={`${content.title} sections`}>
              {content.nav.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
          )}
        </div>

        <div className={styles.body}>
          <p className={styles.intro}>
            <Text runs={content.intro} />
          </p>

          {content.sections.map((section) => (
            <section key={section.heading} id={section.id} className={styles.section}>
              <h2 className={styles.sectionTitle}>{section.heading}</h2>
              {section.blocks.map((block, index) => (
                <Block key={index} block={block} />
              ))}
            </section>
          ))}
        </div>
      </article>

      <ZoomCallBlock />
    </main>
  );
}
