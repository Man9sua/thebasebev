import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { resolveBlogHref, type BlogBlock, type BlogInline, type BlogPost } from "@/data/blog";
import styles from "./BlogArticlePage.module.css";

/**
 * One Blog article.
 *
 * The body is rendered from the block model the importer writes, not from
 * markup: nothing on this page is `dangerouslySetInnerHTML`, so Tilda's
 * redactor classes and inline styles never reach the document and the article
 * inherits this site's type scale instead of that one's.
 */

function displayDate(value: string) {
  const [year, month, day] = value.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Inline({ content }: { content: BlogInline[] }) {
  return content.map((part, index) => {
    const key = `${part.type}-${index}`;
    let node = <>{part.text}</>;

    if (part.type === "link") {
      const href = resolveBlogHref(part.href);
      node = href.startsWith("/") ? (
        <Link href={href} prefetch={false}>
          {part.text}
        </Link>
      ) : (
        <a href={href} rel="noreferrer noopener">
          {part.text}
        </a>
      );
    }

    if (part.strong) node = <strong>{node}</strong>;
    if (part.em) node = <em>{node}</em>;

    return <Fragment key={key}>{node}</Fragment>;
  });
}

function Block({ block, index }: { block: BlogBlock; index: number }) {
  switch (block.type) {
    case "heading": {
      // The article's own `h1` is the title above, so the body starts at h2 and
      // the source's h2/h3/h4 keep their relative depth.
      const Tag = (block.level === 2 ? "h2" : block.level === 3 ? "h3" : "h4") as
        | "h2"
        | "h3"
        | "h4";
      return (
        <Tag className={styles.heading} data-level={block.level}>
          <Inline content={block.content} />
        </Tag>
      );
    }

    case "list":
      return block.ordered ? (
        <ol className={styles.list}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>
              <Inline content={item} />
            </li>
          ))}
        </ol>
      ) : (
        <ul className={styles.list}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>
              <Inline content={item} />
            </li>
          ))}
        </ul>
      );

    case "image":
      return (
        <figure className={styles.figure}>
          <Image
            src={block.src}
            alt={block.alt}
            width={1440}
            height={900}
            sizes="(max-width: 47.9375rem) 92vw, 46rem"
            loading={index < 2 ? "eager" : "lazy"}
          />
        </figure>
      );

    case "video":
      return (
        <figure className={styles.video}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${block.id}`}
            title="Video"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </figure>
      );

    default:
      return (
        <p className={styles.paragraph}>
          <Inline content={block.content} />
        </p>
      );
  }
}

export function BlogArticlePage({
  post,
  relatedPosts,
}: {
  post: BlogPost;
  relatedPosts: BlogPost[];
}) {
  return (
    <main className={styles.page} data-blog-article>
      <article className={styles.article} itemScope itemType="https://schema.org/BlogPosting">
        <meta itemProp="mainEntityOfPage" content={post.seo.canonical} />
        <meta itemProp="author" content="The Base Beverage LLC" />

        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/resources">Resources</Link>
          <span aria-hidden="true">/</span>
          <Link href="/resources/blog">Blog</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{post.title}</span>
        </nav>

        <Link className={styles.backLink} href="/resources/blog">
          <span aria-hidden="true">←</span>
          Back to Blog
        </Link>

        <header className={styles.header}>
          <div className={styles.meta}>
            <span>{post.topic.label}</span>
            <time itemProp="datePublished" dateTime={post.published}>
              {displayDate(post.published)}
            </time>
            <span>{post.readingMinutes} min read</span>
          </div>
          <h1 itemProp="headline">{post.title}</h1>
          {post.excerpt && (
            <p className={styles.standfirst} itemProp="description">
              {post.excerpt}
            </p>
          )}
        </header>

        {post.cover && (
          <div className={styles.cover}>
            <Image
              src={post.cover.src}
              alt={post.cover.alt}
              width={1440}
              height={900}
              sizes="(max-width: 47.9375rem) 100vw, 64rem"
              priority
              itemProp="image"
            />
          </div>
        )}

        <div className={styles.body} itemProp="articleBody" data-blog-article-body>
          {post.body.map((block, index) => (
            <Block key={`${post.uid}-${index}`} block={block} index={index} />
          ))}
        </div>

        <footer className={styles.articleFooter}>
          {relatedPosts.length > 0 && (
            <section className={styles.related} aria-labelledby="related-articles-title">
              <div className={styles.relatedHeading}>
                <span className="tbb-label">Continue reading</span>
                <h2 id="related-articles-title">Related articles</h2>
              </div>
              <div className={styles.relatedGrid}>
                {relatedPosts.map((related) => (
                  <Link
                    key={related.uid}
                    className={styles.relatedLink}
                    href={related.path}
                    prefetch={false}
                  >
                    {related.cover && (
                      <span className={styles.relatedArt}>
                        <Image
                          src={related.cover.src}
                          alt=""
                          width={1440}
                          height={900}
                          sizes="(max-width: 47.9375rem) 92vw, 20rem"
                          loading="lazy"
                        />
                      </span>
                    )}
                    <span className={styles.relatedCopy}>
                      <span className={styles.relatedTopic}>{related.topic.label}</span>
                      <span className={styles.relatedTitle}>{related.title}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <Link className={styles.bottomBackLink} href="/resources/blog">
            <span aria-hidden="true">←</span>
            All articles
          </Link>
        </footer>
      </article>
    </main>
  );
}
