"use client";

import { useEffect, useState } from "react";
import styles from "./ProductTabs.module.css";

/**
 * The bar that follows the page down a product's detail sections.
 *
 * It replaces the exported Tilda tab strip, which was a horizontal scroller
 * whose panes were four separate blocks stacked below it anyway — so the tabs
 * never switched anything. Here they are what they always looked like: anchors
 * into the four sections, with the one you are reading marked.
 *
 * Which section that is comes from an `IntersectionObserver` rather than from
 * scroll maths, so it costs nothing while the page is still. The band the
 * observer watches is a thin one just under the sticky bar: a section counts as
 * current from the moment its heading passes behind the bar until the next
 * one's does, which is the same rule the eye uses.
 */

export type ProductTab = { id: string; label: string };

export function ProductTabs({ tabs }: { tabs: ProductTab[] }) {
  const [current, setCurrent] = useState(tabs[0]?.id ?? "");

  useEffect(() => {
    const sections = tabs
      .map((tab) => document.getElementById(tab.id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        }
      },
      // Only the strip right below the bar is "in view", so exactly one section
      // is ever intersecting and the last write wins cleanly.
      { rootMargin: "-18% 0px -78% 0px", threshold: 0 },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [tabs]);

  return (
    <nav className={styles.bar} aria-label="Product details">
      <ul className={styles.list}>
        {tabs.map((tab) => (
          <li key={tab.id}>
            <a
              href={`#${tab.id}`}
              className={styles.tab}
              aria-current={tab.id === current ? "true" : undefined}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
