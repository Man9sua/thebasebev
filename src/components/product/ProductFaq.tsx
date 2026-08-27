"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./ProductFaq.module.css";

/**
 * The questions each product page answers.
 *
 * The export had a working Tilda accordion here — the only block below the hero
 * that was not a zero block — but it came with Tilda's own grey panels, its own
 * type and its own icon set, so it was the last thing on the page that did not
 * look like the rest of the site.
 *
 * One panel open at a time, as before. The answer is always in the document,
 * only its row is collapsed, so it is there for crawlers and for find-on-page
 * whether or not it is open.
 */

export type FaqEntry = { question: string; answer: string };

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProductFaq({ entries }: { entries: FaqEntry[] }) {
  const [open, setOpen] = useState<string | null>(entries[0]?.question ?? null);

  return (
    <div className={styles.list}>
      {entries.map((entry, index) => {
        const expanded = open === entry.question;

        return (
          <Reveal
            key={entry.question}
            className={styles.item}
            delay={index * 70}
            distance={16}
          >
            <h3 className={styles.heading}>
              <button
                type="button"
                className={styles.trigger}
                aria-expanded={expanded}
                aria-controls={`faq-answer-${index}`}
                onClick={() => setOpen(expanded ? null : entry.question)}
              >
                <span>{entry.question}</span>
                <span className={styles.icon} data-open={expanded}>
                  <Chevron />
                </span>
              </button>
            </h3>

            <div
              id={`faq-answer-${index}`}
              className={styles.answer}
              data-open={expanded}
              // Collapsed rather than removed, so the answer stays selectable
              // and searchable; `inert` keeps it out of the tab order while it
              // is closed.
              inert={!expanded}
            >
              <div className={styles.answerInner}>
                <p className={styles.answerBody}>{entry.answer}</p>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
