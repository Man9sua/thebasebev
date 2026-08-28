import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./Collage.module.css";

/**
 * Editorial photo essay.
 *
 * The heading holds the left column and stays there while the pictures pass it,
 * which is what turns a wall of photographs into something read in order. The
 * pictures are two columns of their own, offset against each other and each
 * tile keeping its own proportion, so the block has a rhythm rather than a grid
 * of equal rectangles. Each tile parallaxes at its own speed.
 *
 * The order is the argument the heading makes — formulation, the product,
 * making it, the people, the brand in the café, dispatch, sixty markets — so
 * the column reads top to bottom rather than being eight pictures in a bag.
 *
 * Two of the photographs it used to carry are gone rather than rearranged: one
 * was a guest holding a cup with COSTA COFFEE legible across it, the other a
 * pile of capsules with the Nespresso "N" on every one. Both are a competitor's
 * mark on this company's homepage, and the second is a category THE BASE does
 * not even sell. Two more were generic stock — a bowl of coffee beans and a
 * warehouse aisle — and gave way to pictures that are actually of this
 * business.
 *
 * Server-rendered: nothing here needs client state, so only the parallax and
 * reveal wrappers ship JavaScript.
 */

type Tile = {
  src: string;
  alt: string;
  caption?: string;
  /** Which of the two picture columns it belongs to. */
  column: 0 | 1;
  /** Its own proportion — what gives the pair of columns their rhythm. */
  ratio: string;
  speed: number;
};

/** Alternating speeds — neighbouring tiles must not drift in lockstep. */
const TILES: Tile[] = [
  {
    src: "/images/tild3335-6562-4638-b361-626264373764__905191c477e5451de329.jpg",
    alt: "Beverage base powder measured out with a wooden scoop",
    caption: "Formulation",
    column: 0,
    ratio: "1 / 1",
    speed: 0.06,
  },
  {
    src: "/images/tild3065-6636-4439-a430-386130353062__photo-1630959305790-.jpg",
    alt: "Technician at a microscope in the laboratory",
    caption: "R&D",
    column: 1,
    ratio: "3 / 2",
    speed: 0.13,
  },
  {
    src: "/images/tild3239-6265-4237-b866-373233306262__photo-1772986564376-.jpg",
    alt: "Chocolate and fruit syrup swirled together",
    column: 0,
    ratio: "3 / 4",
    speed: 0.1,
  },
  {
    src: "/images/tild6565-3533-4465-b561-303337656436__photo-1530037335614-.jpg",
    alt: "Beverage bottling line in production",
    caption: "Production",
    column: 1,
    ratio: "3 / 4",
    speed: 0.07,
  },
  {
    src: "/images/tild3635-3534-4562-a230-386630306263__3_1.jpg",
    alt: "Production technician in a THE BASE coat",
    column: 0,
    ratio: "4 / 3",
    speed: 0.14,
  },
  {
    src: "/images/tild3061-3436-4265-b762-383638623261__apron.jpg",
    alt: "THE BASE branded apron worn by a barista",
    column: 1,
    ratio: "4 / 5",
    speed: 0.09,
  },
  {
    src: "/images/tild3663-3430-4638-b336-316531626361__mask_group_4.jpg",
    alt: "THE BASE delivery truck on the road at night",
    caption: "Dispatch",
    column: 0,
    ratio: "4 / 3",
    speed: 0.08,
  },
  {
    src: "/images/tild3935-6337-4533-a633-643534346539__photo-1590497008432-.jpg",
    alt: "Container port at night",
    caption: "Sixty markets",
    column: 1,
    ratio: "16 / 9",
    speed: 0.12,
  },
];

/** What the heading claims, as three figures the pictures then evidence. */
const FIGURES = [
  { value: "60", label: "Markets served" },
  { value: "600+", label: "Flavours on the shelf" },
  { value: "1", label: "Roof, formulation to dispatch" },
];

/**
 * The two picture columns, each tile carrying where it stands in the essay.
 * That index becomes its `order`, which does nothing while the columns are two
 * — the tiles are already in order within each — and everything when a phone
 * folds them into one, where without it the reading would run down one column
 * and then back up for the other.
 */
const COLUMNS = [0, 1].map((column) =>
  TILES.map((tile, index) => ({ tile, index })).filter((entry) => entry.tile.column === column),
);

export function Collage() {
  return (
    <section className={styles.section} aria-labelledby="collage-title">
      <div className={styles.inner}>
        {/* Sticky, so the claim stays in view for as long as the evidence
            takes to pass it. It is the whole reason the pictures are a
            column and not a mosaic. */}
        <div className={styles.head}>
          <Reveal className={styles.headInner}>
            <span className="tbb-label">From base to cup</span>
            <h2 id="collage-title" className={styles.title}>
              Manufactured in Dubai, shipped to sixty markets
            </h2>
            <p className={styles.lede}>
              Formulation, blending, packing and dispatch under one roof — so a café in Riyadh and a
              franchise in Almaty pour the same drink.
            </p>

            <dl className={styles.figures}>
              {FIGURES.map((figure) => (
                <div key={figure.label} className={styles.figure}>
                  <dt className={styles.figureValue}>{figure.value}</dt>
                  <dd className={`tbb-label ${styles.figureLabel}`}>{figure.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className={styles.grid}>
          {COLUMNS.map((column, columnIndex) => (
            <div key={columnIndex} className={styles.column}>
              {column.map(({ tile, index }, position) => (
                <Reveal
                  key={tile.src}
                  as="figure"
                  className={styles.tile}
                  style={{ ["--ratio" as string]: tile.ratio, order: index }}
                  delay={position * 80}
                  distance={24}
                >
                  <Parallax className={styles.layer} speed={tile.speed}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className={styles.media}
                      src={tile.src}
                      alt={tile.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  </Parallax>
                  {tile.caption && (
                    <figcaption className={`tbb-label ${styles.caption}`}>
                      {tile.caption}
                    </figcaption>
                  )}
                </Reveal>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
