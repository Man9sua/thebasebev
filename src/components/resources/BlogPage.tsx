"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BLOG_POSTS, BLOG_TOPICS } from "@/data/blog";
import styles from "./BlogPage.module.css";

/**
 * `/resources/blog`.
 *
 * Built on the Glossary's shelf — the same paper, the same control panel, the
 * same card rhythm — because the two are siblings under Resources and the
 * owner asked for this one to read like that one. What it does not borrow is
 * the Glossary's card: a Blog post has a photograph, a date and a length, and
 * hiding those behind a title would make thirty articles look like one wall.
 *
 * The newest post is set as the lead card and drops back into the grid the
 * moment a filter is on, so the shelf never shows the same article twice.
 */

type TopicFilter = "all" | string;

function displayDate(value: string) {
  const [year, month, day] = value.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BlogPage() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<TopicFilter>("all");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("en");

    return BLOG_POSTS.filter((post) => {
      const matchesTopic = topic === "all" || post.topic.id === topic;
      if (!matchesTopic) return false;
      if (!normalizedQuery) return true;
      return [post.title, post.excerpt, post.topic.label, post.bodyText]
        .join(" ")
        .toLocaleLowerCase("en")
        .includes(normalizedQuery);
    });
  }, [query, topic]);

  const isFiltered = Boolean(query.trim()) || topic !== "all";
  const lead = isFiltered ? null : filtered[0];
  const rest = lead ? filtered.slice(1) : filtered;

  return (
    <main className={styles.page} data-blog-page>
      <section className={styles.hero} aria-labelledby="blog-title">
        <div className={styles.heroInner}>
          <span className="tbb-label">Resources / {BLOG_POSTS.length} articles</span>
          <h1 id="blog-title">Blog</h1>
          <p>
            Practical guidance on beverage bases and B2B supply for cafés, restaurants and
            distributors — menu economics, café operations, certification and formulation.
          </p>
        </div>
      </section>

      <section className={styles.content} aria-label="Blog articles">
        <div className={styles.controls}>
          <label className={styles.search}>
            <span className="tbb-visually-hidden">Search articles</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.75" />
              <path d="m15.5 15.5 5 5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search articles, topics or terms"
            />
          </label>

          <div className={styles.filterGroup} aria-label="Article topics">
            <button
              type="button"
              className={topic === "all" ? styles.filterActive : styles.filter}
              onClick={() => setTopic("all")}
              aria-pressed={topic === "all"}
            >
              All topics
            </button>
            {BLOG_TOPICS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={topic === option.id ? styles.filterActive : styles.filter}
                onClick={() => setTopic(option.id)}
                aria-pressed={topic === option.id}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.resultBar} aria-live="polite">
          <span>
            {filtered.length} {filtered.length === 1 ? "article" : "articles"}
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setTopic("all");
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {lead && (
          <Link className={styles.lead} href={lead.path} prefetch={false} data-blog-post>
            {lead.cover && (
              <span className={styles.leadArt}>
                <Image
                  src={lead.cover.src}
                  alt={lead.cover.alt}
                  width={1440}
                  height={900}
                  sizes="(max-width: 47.9375rem) 92vw, 60vw"
                  priority
                />
              </span>
            )}
            <span className={styles.leadCopy}>
              <span className={styles.postMeta}>
                <span>{lead.topic.label}</span>
                <time dateTime={lead.published}>{displayDate(lead.published)}</time>
              </span>
              <h2>{lead.title}</h2>
              <span className={styles.excerpt}>{lead.excerpt}</span>
              <span className={styles.readMore}>
                Read article <span aria-hidden="true">→</span>
              </span>
            </span>
          </Link>
        )}

        {rest.length > 0 && (
          <div className={styles.grid} data-blog-grid>
            {rest.map((post, index) => (
              <Link
                key={post.uid}
                className={styles.post}
                href={post.path}
                prefetch={false}
                data-blog-post
                data-blog-uid={post.uid}
              >
                {post.cover && (
                  <span className={styles.art}>
                    <Image
                      src={post.cover.src}
                      alt={post.cover.alt}
                      width={1440}
                      height={900}
                      sizes="(max-width: 47.9375rem) 92vw, (max-width: 74.9375rem) 44vw, 30vw"
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                  </span>
                )}
                <span className={styles.postBody}>
                  <span className={styles.postMeta}>
                    <span>{post.topic.label}</span>
                    <time dateTime={post.published}>{displayDate(post.published)}</time>
                  </span>
                  <h2>{post.title}</h2>
                  <span className={styles.excerpt}>{post.excerpt}</span>
                  <span className={styles.readMore}>
                    Read article <span aria-hidden="true">→</span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className={styles.empty}>
            <strong>No matching articles</strong>
            <p>Try another word or topic.</p>
          </div>
        )}
      </section>
    </main>
  );
}
