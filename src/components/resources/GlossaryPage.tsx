"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  GLOSSARY_ENTRIES,
  categoryLabel,
  type GlossaryCategory,
} from "@/data/glossary";
import styles from "./GlossaryPage.module.css";

type CategoryFilter = "all" | GlossaryCategory;

const CATEGORIES: Array<{ value: CategoryFilter; label: string }> = [
  { value: "all", label: "All terms" },
  { value: "ingredients", label: "Ingredients & bases" },
  { value: "tech", label: "Beverage tech" },
  { value: "business", label: "HoReCa & business" },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function displayDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

export function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [letter, setLetter] = useState("all");

  const availableLetters = useMemo(
    () => new Set(GLOSSARY_ENTRIES.map((term) => term.title.charAt(0).toUpperCase())),
    [],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("en");

    return GLOSSARY_ENTRIES.filter((term) => {
      const searchableText = [
        term.title,
        term.excerpt,
        categoryLabel(term.category),
        term.bodyText,
      ]
        .join(" ")
        .toLocaleLowerCase("en");
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
      const matchesCategory = category === "all" || term.category === category;
      const matchesLetter = letter === "all" || term.title.charAt(0).toUpperCase() === letter;

      return matchesQuery && matchesCategory && matchesLetter;
    });
  }, [category, letter, query]);

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setLetter("all");
  }

  return (
    <main className={styles.page} data-glossary-page>
      <section className={styles.hero} aria-labelledby="glossary-title">
        <div className={styles.heroInner}>
          <span className="tbb-label">Reference / {GLOSSARY_ENTRIES.length} terms</span>
          <h1 id="glossary-title">Glossary</h1>
          <p>
            Practical definitions for product development, beverage operations and B2B supply.
          </p>
        </div>
      </section>

      <section className={styles.content} aria-label="Glossary terms">
        <div className={styles.controls}>
          <label className={styles.search}>
            <span className="tbb-visually-hidden">Search glossary</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.75" />
              <path d="m15.5 15.5 5 5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search terms, definitions or topics"
            />
          </label>

          <div className={styles.filterGroup} aria-label="Glossary categories">
            {CATEGORIES.map((option) => (
              <button
                key={option.value}
                type="button"
                className={category === option.value ? styles.filterActive : styles.filter}
                onClick={() => setCategory(option.value)}
                aria-pressed={category === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className={styles.alphabetWrap}>
            <span className="tbb-label">Index</span>
            <div className={styles.alphabet} aria-label="Alphabetical filter">
              <button
                type="button"
                className={letter === "all" ? styles.letterActive : styles.letter}
                onClick={() => setLetter("all")}
                aria-pressed={letter === "all"}
              >
                All
              </button>
              {ALPHABET.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={letter === value ? styles.letterActive : styles.letter}
                  onClick={() => setLetter(value)}
                  aria-pressed={letter === value}
                  disabled={!availableLetters.has(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.resultBar} aria-live="polite">
          <span>
            {filtered.length} {filtered.length === 1 ? "term" : "terms"}
          </span>
          {(query || category !== "all" || letter !== "all") && (
            <button type="button" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        {filtered.length ? (
          <div className={styles.grid} data-glossary-grid>
            {filtered.map((term) => (
              <Link
                key={term.uid}
                className={styles.term}
                href={term.path}
                prefetch={false}
                data-glossary-term
                data-glossary-uid={term.uid}
              >
                <div className={styles.termMeta}>
                  <span>{categoryLabel(term.category)}</span>
                  <time dateTime={term.published}>{displayDate(term.published)}</time>
                </div>
                <div className={styles.termHeading}>
                  <h2>{term.title}</h2>
                  <span className={styles.termArrow} aria-hidden="true">
                    ↗
                  </span>
                </div>
                {term.excerpt && <p>{term.excerpt}</p>}
                {term.contentStatus === "empty-production-source" && (
                  <span className={styles.sourceStatus}>Source article has no published copy</span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <strong>No matching terms</strong>
            <p>Try another word, category or letter.</p>
          </div>
        )}
      </section>
    </main>
  );
}
