import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./Collage.module.css";

/**
 * Editorial photo collage.
 *
 * A dense 12-column grid with tiles of different spans rather than a uniform
 * gallery. Each tile parallaxes at its own speed, which is what keeps the block
 * feeling composed while scrolling instead of like a wall of pictures.
 *
 * Server-rendered: nothing here needs client state, so only the parallax and
 * reveal wrappers ship JavaScript.
 */

type Tile = {
  src: string;
  alt: string;
  caption?: string;
  place: keyof typeof PLACEMENTS;
  speed: number;
};

const PLACEMENTS = {
  a: styles.a,
  b: styles.b,
  c: styles.c,
  d: styles.d,
  e: styles.e,
  f: styles.f,
  g: styles.g,
  h: styles.h,
} as const;

/** Alternating speeds — neighbouring tiles must not drift in lockstep. */
const TILES: Tile[] = [
  {
    src: "/images/tild6565-3533-4465-b561-303337656436__photo-1530037335614-.jpg",
    alt: "Beverage bottling line in production",
    caption: "Production",
    place: "a",
    speed: 0.06,
  },
  {
    src: "/images/tild3239-6265-4237-b866-373233306262__photo-1772986564376-.jpg",
    alt: "Chocolate and fruit syrup swirled together",
    caption: "R&D",
    place: "b",
    speed: 0.13,
  },
  {
    src: "/images/tild3061-3436-4265-b762-383638623261__apron.jpg",
    alt: "THE BASE branded apron worn by a barista",
    place: "c",
    speed: 0.09,
  },
  {
    src: "/images/tild3161-3138-4736-b333-353231303039__photo-1447933601403-.jpg",
    alt: "Roasted coffee beans",
    place: "d",
    speed: 0.16,
  },
  {
    src: "/images/tild6437-6132-4439-b162-333335366235__photo-1763849049299-.jpg",
    alt: "Guest holding a prepared drink",
    place: "e",
    speed: 0.07,
  },
  {
    src: "/images/tild3935-6337-4533-a633-643534346539__photo-1590497008432-.jpg",
    alt: "Container port at night",
    caption: "Global supply",
    place: "f",
    speed: 0.12,
  },
  {
    src: "/images/tild3232-3361-4536-b535-383330393461__photo-1732365898359-.jpg",
    alt: "Coffee capsules and cups",
    place: "g",
    speed: 0.1,
  },
  {
    src: "/images/tild3433-6466-4661-b034-656563323035__photo-1627309366653-.jpg",
    alt: "Warehouse racking stocked with product",
    caption: "Logistics",
    place: "h",
    speed: 0.05,
  },
];

export function Collage() {
  return (
    <section className={styles.section} aria-labelledby="collage-title">
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <span className="tbb-label">From base to cup</span>
          <h2 id="collage-title" className={styles.title}>
            Manufactured in Dubai, shipped to sixty markets
          </h2>
          <p className={styles.lede}>
            Formulation, blending, packing and dispatch under one roof — so a
            café in Riyadh and a franchise in Almaty pour the same drink.
          </p>
        </Reveal>

        <div className={styles.grid}>
          {TILES.map((tile, index) => (
            <Reveal
              key={tile.src}
              className={`${styles.tile} ${PLACEMENTS[tile.place]}`}
              delay={(index % 4) * 90}
              distance={20}
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
                <span className={`tbb-label ${styles.caption}`}>{tile.caption}</span>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
