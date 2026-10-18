import type { CSSProperties, ReactNode } from "react";
import { cx, productPageStyles as styles } from "../blocks";
import type { ProductPageProps } from "../types";
import { BlendPage } from "./BlendPage";
import local from "./Milkshake.module.css";

export const MADE_IN = "Made in the UAE under HACCP-focused processes and Halal-aligned standards.";

export function PackFacts({ children, columns = 3 }: { children: ReactNode; columns?: number }) {
  return (
    <section className={cx(styles.section, styles.inside)} aria-labelledby="product-pack-title">
      <h2 id="product-pack-title" className={styles.title}>Inside the pack</h2>
      <div className={local.facts} style={{ "--cols": columns } as CSSProperties}>{children}</div>
    </section>
  );
}

export function MilkshakePage(props: ProductPageProps) {
  return <BlendPage {...props} kind="milkshake" />;
}
