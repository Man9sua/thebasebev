import Image from "next/image";
import styles from "./CertificationMarks.module.css";

const MARKS = [
  { src: "haccp", alt: "HACCP certification — EIAC / BSCIC, CB-HACCP-017", width: 668, height: 432 },
  { src: "iso-22000", alt: "ISO 22000 certification — EIAC / BSCIC, CB-FSMS-017", width: 668, height: 432 },
  { src: "halal", alt: "Halal certification mark", width: 433, height: 234 },
] as const;

export function CertificationMarks({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <ul className={`${styles.marks} ${tone === "dark" ? styles.dark : ""}`} aria-label="Quality certifications">
      {MARKS.map((mark) => (
        <li key={mark.src} className={styles.mark}>
          <Image
            src={`/images/certifications/${mark.src}.jpg`}
            alt={mark.alt}
            width={mark.width}
            height={mark.height}
            className={styles.image}
          />
        </li>
      ))}
    </ul>
  );
}
