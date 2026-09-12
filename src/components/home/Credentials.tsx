import styles from "./Credentials.module.css";

/**
 * Four assurances about how THE BASE manufactures.
 *
 * Copy is the design file's, verbatim — including "14 day", which wants to be
 * "14 days". It is a claim about a lead time rather than a label, so the
 * wording is the owner's to correct, not mine.
 */
const CREDENTIALS: readonly { icon: string; copy: string }[] = [
  {
    icon: "/images/icons/proof-laboratory.svg",
    copy: "Own laboratory and production",
  },
  {
    icon: "/images/icons/proof-deadlines.svg",
    copy: "We strictly adhere to deadlines and volumes",
  },
  {
    icon: "/images/icons/proof-lead-time.svg",
    copy: "From request to implementation 14 day",
  },
  {
    icon: "/images/icons/proof-certified.svg",
    copy: "Certified production (HACCP and Halal)",
  },
];

export function Credentials() {
  return (
    <section className={styles.section} aria-label="How THE BASE manufactures">
      <div className={styles.inner}>
        <ul className={styles.grid}>
          {CREDENTIALS.map((credential) => (
            <li className={styles.item} key={credential.copy}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.icon} src={credential.icon} alt="" />
              <p className={styles.copy}>{credential.copy}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
