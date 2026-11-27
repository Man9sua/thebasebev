import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./Collage.module.css";

type Step = {
  src: string;
  alt: string;
  label: string;
};

const STEPS: Step[] = [
  {
    src: "/images/tild3335-6562-4638-b361-626264373764__905191c477e5451de329.jpg",
    alt: "Beverage base powder measured out with a wooden scoop",
    label: "Formulation",
  },
  {
    src: "/images/tild6663-3864-4961-b139-316164363938__mask_group_1.jpg",
    alt: "the Base branded shipping carton artwork",
    label: "Production",
  },
  {
    src: "/images/tild3433-6466-4661-b034-656563323035__photo-1627309366653-.jpg",
    alt: "Warehouse racking stocked with product ready for dispatch",
    label: "Dispatch",
  },
  {
    src: "/images/tild3061-3436-4265-b762-383638623261__apron.jpg",
    alt: "Barista in a the Base apron at the bar",
    label: "To cup",
  },
];

export function Collage() {
  return (
    <section className={styles.section} aria-labelledby="collage-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <Reveal>
            <h2 id="collage-title" className={styles.title}>
              Manufactured in the UAE, shipped to sixty markets
            </h2>
          </Reveal>
          <Reveal as="p" className={styles.lede} delay={80}>
            Formulation, blending, packing and dispatch under one roof, so a café in
            Riyadh and a franchise in Almaty pour the same drink.
          </Reveal>
        </div>

        <ol className={styles.steps}>
          {STEPS.map((step, index) => (
            <li key={step.label} className={styles.step}>
              <span className={styles.frame}>
                <Image
                  src={step.src}
                  alt={step.alt}
                  fill
                  sizes="(max-width: 47.9375rem) 17.5rem, 23vw"
                  loading="lazy"
                />
              </span>
              <span className={styles.caption}>
                <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.label}>{step.label}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
