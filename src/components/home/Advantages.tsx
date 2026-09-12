import styles from "./Advantages.module.css";

/**
 * What a buyer saves by pouring a powder, as four figures.
 *
 * The copy is the design file's, verbatim. Two things in it are the owner's to
 * settle rather than mine, so they are carried as written:
 *
 *   - The design's phone frame reads 20 / 50 / 40 / 100 where its desktop frame
 *     reads 40 / 50 / 60 / 100. The desktop figures are used, since these are
 *     claims and they cannot differ by device.
 *   - "syrups - significantly" uses a hyphen where the sentence wants a dash.
 *     Left alone: it is approved copy, and silently rewriting a claim is not
 *     mine to do.
 *
 * "Up to" sits on the first three and not on the fourth, which is the design's
 * own reading — 100% safety is not a ceiling, it is the claim.
 */
const ADVANTAGES: readonly {
  figure: string;
  qualifier?: string;
  name: string;
  copy: string;
}[] = [
  {
    figure: "40%",
    qualifier: "Up to",
    name: "Cost Reduction",
    copy:
      "Our dry bases replace cream, syrups, and toppings, cutting ingredient costs and maximizing profitability.",
  },
  {
    figure: "50%",
    qualifier: "Up to",
    name: "Savings on Logistics",
    copy:
      "No refrigeration, no breakage, and lighter than bottled syrups - significantly reducing shipping and storage expenses",
  },
  {
    figure: "60%",
    qualifier: "Up to",
    name: "Time Savings",
    copy:
      "Quick and easy to mix, ensuring consistency and efficiency across all locations",
  },
  {
    figure: "100%",
    name: "Safety",
    copy:
      "Made from high-quality natural ingredients for guaranteed safety and premium taste",
  },
];

export function Advantages() {
  return (
    <section className={styles.section} aria-label="What THE BASE saves you">
      <div className={styles.inner}>
        <ul className={styles.grid}>
          {ADVANTAGES.map((advantage) => (
            <li className={styles.item} key={advantage.name}>
              <span className={styles.disc}>
                {advantage.qualifier && (
                  <span className={styles.qualifier}>
                    {advantage.qualifier}
                  </span>
                )}
                <span className={styles.figure}>{advantage.figure}</span>
              </span>
              <h2 className={styles.name}>{advantage.name}</h2>
              <p className={styles.copy}>{advantage.copy}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
