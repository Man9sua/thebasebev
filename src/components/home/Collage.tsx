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
 * The order is the argument the heading makes — formulation, research, the
 * product, making it, dispatch, sixty markets, the brand in the café, and the
 * drink in someone's hand. It ends where "from base to cup" says it ends, so
 * the column reads top to bottom rather than being eight pictures in a bag.
 *
 * Every one of them is a photograph. Three had to go for reasons that are not
 * design: a guest holding a cup with COSTA COFFEE legible across it and a pile
 * of capsules stamped with the Nespresso "N" — a competitor's mark on this
 * company's homepage, the second in a category THE BASE does not even sell —
 * and, separately, two generated images that read as generated, a woman in a
 * branded coat and a truck at night, both delivered at 600x440 where the real
 * photography here is 1680 wide.
 *
 * That is worth keeping in mind when this set is refreshed: the pool in
 * `public/images` mixes stock photographs with composed artwork, and the second
 * kind shows.
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
    src: "/images/tild3433-6466-4661-b034-656563323035__photo-1627309366653-.jpg",
    alt: "Warehouse racking stocked with product",
    caption: "Dispatch",
    column: 0,
    ratio: "2 / 1",
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
  {
    src: "/images/tild3061-3436-4265-b762-383638623261__apron.jpg",
    alt: "THE BASE branded apron worn by a barista",
    column: 0,
    ratio: "4 / 5",
    speed: 0.09,
  },
  {
    src: "/images/tild6132-3863-4132-a630-386136393833__photo-1725268093455-.jpg",
    alt: "Four mixed drinks raised in a toast",
    caption: "To cup",
    column: 1,
    ratio: "4 / 3",
    speed: 0.14,
  },
];

/** What the heading claims, as three figures the pictures then evidence. */
const FIGURES = [
  { value: "60", label: "Markets served" },
  { value: "600+", label: "Flavours on the shelf" },
  { value: "1", label: "Roof, formulation to dispatch" },
];

/** The two picture columns, in the order the essay is written in. */
const COLUMNS = [0, 1].map((column) => TILES.filter((tile) => tile.column === column));

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
              {column.map((tile, index) => (
                <Reveal
                  key={tile.src}
                  as="figure"
                  className={styles.tile}
                  style={{ ["--ratio" as string]: tile.ratio }}
                  delay={index * 80}
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
