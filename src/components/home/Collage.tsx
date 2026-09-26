import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./Collage.module.css";

/**
 * From base to cup — the redesign's 10a / 10b.
 *
 * The heading and the sentence on one row, then four photographs of equal
 * height in one line, each numbered and named: formulation, production,
 * dispatch, to cup.
 *
 * It replaces an eight-picture essay laid out as two offset parallaxing
 * columns. Two things were wrong with that and the document fixes both: eight
 * photographs is a gallery rather than a sequence, and only six of them were
 * captioned, so the order it was making an argument in was legible to nobody.
 * Four steps, all four named.
 *
 * The photographs are the ones already in `public/images`, and the ones the
 * document itself names for the first and third frames. Two notes worth
 * keeping:
 *
 * - **Production is a placeholder and the document says so** — it draws a grey
 *   panel reading "нужно реальное фото производства the Base". The bottling
 *   line below is the nearest thing in the pool, and it is wrong in the way
 *   the site review flags: it is a liquids line, and this company sells dry
 *   powder. It needs a photograph of THE BASE's own plant.
 * - **The rest of the eight** — the microscope, the syrup swirl, the container
 *   port and the toast — are out, not deleted. They are stock, and the review's
 *   note is that the homepage should be showing this company's own rooms.
 */

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
    src: "/images/tild6565-3533-4465-b561-303337656436__photo-1530037335614-.jpg",
    alt: "Beverage production line",
    label: "Production",
  },
  {
    src: "/images/tild3433-6466-4661-b034-656563323035__photo-1627309366653-.jpg",
    alt: "Warehouse racking stocked with product ready for dispatch",
    label: "Dispatch",
  },
  {
    src: "/images/tild3061-3436-4265-b762-383638623261__apron.jpg",
    alt: "Barista in a THE BASE apron at the bar",
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

        {/* One line on a desktop, a rail that runs past the gutter on a phone —
            see the note in the stylesheet about why the rail is native scroll
            rather than a control. */}
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
