"use client";

import { useMemo, useState } from "react";
import { GLOSSARY_TERMS, type GlossaryTerm } from "@/data/glossary";
import styles from "./GlossaryPage.module.css";

type Category = "all" | "ingredients" | "tech" | "business";

const CATEGORIES: Array<{ value: Category; label: string }> = [
  { value: "all", label: "All terms" },
  { value: "ingredients", label: "Ingredients & bases" },
  { value: "tech", label: "Beverage tech" },
  { value: "business", label: "HoReCa & business" },
];

const CATEGORY_LABELS: Record<Exclude<Category, "all">, string> = {
  ingredients: "ingredients & bases",
  tech: "beverage tech",
  business: "HoReCa & business",
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const BUSINESS_TERMS = new Set([
  "Authenticity Premium", "Beverage Cost %", "CapEx", "Category Anchor", "Contract Manufacturing",
  "Crossover Drink", "Cup Cost", "Deskilling", "EXW", "FOB", "CIF", "Franchise Uniformity",
  "Habit Loop", "HS Code", "Incoterms", "Landed Cost", "Lead Time", "Lot Number", "LTO",
  "Menu Engineering", "Mise en Place", "MOQ", "Net Margin per Cup", "ODM", "OEM", "OpEx",
  "Peak Hour", "Portion Control", "Premiumization", "Private Label", "Signature Drink", "SKU",
  "Ticket Time", "Trade Marketing", "Waste Log", "White Label",
]);

const TECH_TERMS = new Set([
  "Agglomeration", "Ambient Shelf Life", "Anti caking Agent", "Astringency", "Brix", "Bulk Density",
  "Caramelization", "Certificate of Analysis", "Ceremonial vs Culinary Matcha", "Cold Chain",
  "Danger Zone", "Dial In", "Dispersibility", "Dose Weight", "Doypack", "Emulsion", "Encapsulation",
  "Frappe", "Freddo", "GMP", "HACCP", "Halal Certification", "Homogenization", "Hygroscopicity",
  "Instantization", "ISO 22000", "Maillard Reaction", "Mouthfeel", "Nitro Cold Brew", "Overrun",
  "Sensory Panel", "Solubility", "Stabilizer", "Steam Wand", "Theaflavins", "Volatile Terpenes",
  "Water Activity",
]);

function categoryFor(term: GlossaryTerm): Exclude<Category, "all"> {
  if (BUSINESS_TERMS.has(term.title)) return "business";
  if (TECH_TERMS.has(term.title)) return "tech";
  return "ingredients";
}

function displayDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

export function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [letter, setLetter] = useState("all");

  const availableLetters = useMemo(
    () => new Set(GLOSSARY_TERMS.map((term) => term.title.charAt(0).toUpperCase())),
    [],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("en");
    return GLOSSARY_TERMS.filter((term) => {
      const matchesQuery =
        !normalizedQuery ||
        `${term.title} ${term.definition}`.toLocaleLowerCase("en").includes(normalizedQuery);
      const matchesCategory = category === "all" || categoryFor(term) === category;
      const matchesLetter = letter === "all" || term.title.charAt(0).toUpperCase() === letter;
      return matchesQuery && matchesCategory && matchesLetter;
    });
  }, [category, letter, query]);

  return (
    <main className={styles.page} data-glossary-page>
      <section className={styles.hero} aria-labelledby="glossary-title">
        <div className={styles.heroInner}>
          <span className="tbb-label">Reference / 101 terms</span>
          <h1 id="glossary-title">Beverage glossary</h1>
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
          <span>{filtered.length} {filtered.length === 1 ? "term" : "terms"}</span>
          {(query || category !== "all" || letter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
                setLetter("all");
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {filtered.length ? (
          <div className={styles.grid} data-glossary-grid>
            {filtered.map((term, index) => (
              <article key={`${term.title}-${index}`} className={styles.term} data-glossary-term>
                <div className={styles.termMeta}>
                  <span>{CATEGORY_LABELS[categoryFor(term)]}</span>
                  <time dateTime={term.published}>{displayDate(term.published)}</time>
                </div>
                <h2>{term.title}</h2>
                {term.definition && <p>{term.definition}</p>}
              </article>
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
