import Link from "next/link";
import { Fragment } from "react";
import {
  categoryLabel,
  resolveGlossaryHref,
  type GlossaryEntry,
  type GlossaryInline,
} from "@/data/glossary";
import styles from "./GlossaryArticlePage.module.css";

function displayDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

function GlossaryInlineContent({ content }: { content: GlossaryInline[] }) {
  return content.map((part, index) => {
    const separator = index < content.length - 1 ? " " : null;

    if (part.type === "link") {
      const href = resolveGlossaryHref(part.href);
      const key = `${href}-${index}`;
      return (
        <Fragment key={key}>
          {href.startsWith("/") ? (
            <Link href={href} prefetch={false}>
              {part.text}
            </Link>
          ) : (
            <a href={href}>{part.text}</a>
          )}
          {separator}
        </Fragment>
      );
    }

    return (
      <Fragment key={`${part.text}-${index}`}>
        {part.text}
        {separator}
      </Fragment>
    );
  });
}

type GlossaryArticlePageProps = {
  entry: GlossaryEntry;
  relatedEntries: GlossaryEntry[];
};

export function GlossaryArticlePage({ entry, relatedEntries }: GlossaryArticlePageProps) {
  return (
    <main className={styles.page} data-glossary-article>
      <article
        className={styles.article}
        itemScope
        itemType="https://schema.org/BlogPosting"
      >
        <meta itemProp="mainEntityOfPage" content={entry.seo.canonical} />
        <meta itemProp="author" content="The Base Beverage LLC" />

        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/resources">Resources</Link>
          <span aria-hidden="true">/</span>
          <Link href="/resources/glossary">Glossary</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{entry.title}</span>
        </nav>

        <Link className={styles.backLink} href="/resources/glossary">
          <span aria-hidden="true">←</span>
          Back to Glossary
        </Link>

        <header className={styles.header}>
          <div className={styles.meta}>
            <span>{categoryLabel(entry.category)}</span>
            <time itemProp="datePublished" dateTime={entry.published}>
              {displayDate(entry.published)}
            </time>
          </div>
          <h1 itemProp="headline">{entry.title}</h1>
          {entry.excerpt && <p itemProp="description">{entry.excerpt}</p>}
        </header>

        <div className={styles.body} itemProp="articleBody" data-glossary-article-body>
          {entry.contentStatus === "empty-production-source" ? (
            <div className={styles.unavailable} role="note">
              <span className="tbb-label">Production source status</span>
              <p>This glossary entry does not currently include published article copy.</p>
            </div>
          ) : (
            entry.body.map((paragraph, index) => (
              <p key={`${entry.uid}-paragraph-${index}`}>
                <GlossaryInlineContent content={paragraph.content} />
              </p>
            ))
          )}
        </div>

        <footer className={styles.articleFooter}>
          {relatedEntries.length > 0 && (
            <section className={styles.related} aria-labelledby="related-terms-title">
              <div className={styles.relatedHeading}>
                <span className="tbb-label">Continue exploring</span>
                <h2 id="related-terms-title">Related terms</h2>
              </div>
              <div className={styles.relatedGrid}>
                {relatedEntries.map((related) => (
                  <Link
                    key={related.uid}
                    className={styles.relatedLink}
                    href={related.path}
                    prefetch={false}
                  >
                    <span>{related.title}</span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <Link className={styles.bottomBackLink} href="/resources/glossary">
            <span aria-hidden="true">←</span>
            All glossary terms
          </Link>
        </footer>
      </article>
    </main>
  );
}
