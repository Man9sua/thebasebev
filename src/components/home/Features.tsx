import styles from "./Features.module.css";

/**
 * Four reasons to pour a powder, as icon and copy.
 *
 * Copy is the design file's desktop frame, verbatim. Its phone frame carries a
 * different set of words for the same four points, and for the first one a
 * different number — "1,500+ Exquisite Flavors" against the desktop's "600+
 * Premium Flavors". 600+ is used: it is what the rest of the site says, and the
 * two cannot both be true.
 *
 * The icons are the design's own vectors, exported as SVG. They are pictures,
 * not typography, so they are served as files rather than redrawn inline.
 */
const FEATURES: readonly {
  icon: string;
  name: string;
  copy: string;
}[] = [
  {
    icon: "/images/icons/feature-flavors.svg",
    name: "600+ Premium Flavors",
    copy: "A vast selection of high-quality flavors to match any concept or trend.",
  },
  {
    icon: "/images/icons/feature-seasonal.svg",
    name: "Signature & Seasonal Creations",
    copy: "Custom drinks crafted to fit your brand and seasonal menu",
  },
  {
    icon: "/images/icons/feature-simplify.svg",
    name: "Simplify Your Bar Operations",
    copy: "No unnecessary steps—just great drinks with minimal effort.",
  },
  {
    icon: "/images/icons/feature-no-recipes.svg",
    name: "No Recipes Needed",
    copy: "Pre-mixed ingredients for consistent and hassle-free preparation",
  },
];

export function Features() {
  return (
    <section className={styles.section} aria-label="Why THE BASE">
      <div className={styles.inner}>
        <ul className={styles.grid}>
          {FEATURES.map((feature) => (
            <li className={styles.item} key={feature.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.icon} src={feature.icon} alt="" />
              <h3 className={styles.name}>{feature.name}</h3>
              <p className={styles.copy}>{feature.copy}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
