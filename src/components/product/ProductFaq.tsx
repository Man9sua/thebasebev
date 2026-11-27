"use client";

import { useState } from "react";
import styles from "./ProductFaq.module.css";

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
          <div key={entry.question} className={styles.item}>
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
              inert={!expanded}
            >
              <div className={styles.answerInner}>
                <p className={styles.answerBody}>{entry.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
