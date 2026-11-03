"use client";

import { useCallback, useEffect, useReducer, useRef, useState, type CSSProperties, type TouchEvent } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import { HOME_SLIDES } from "@/data/home-slides";
import styles from "./HomeSlider.module.css";

const INTERVAL = 5000;
const COUNT = HOME_SLIDES.length;
const wrap = (index: number) => (index + COUNT) % COUNT;

type Position = Readonly<{ index: number; loaded: ReadonlySet<number> }>;

/** Moving to a slide also lets it and its two neighbours load their pictures. */
function moveTo(position: Position, next: number): Position {
  const index = wrap(next);
  const wanted = [index, wrap(index + 1), wrap(index - 1)];
  if (index === position.index && wanted.every((item) => position.loaded.has(item))) return position;
  return { index, loaded: new Set([...position.loaded, ...wanted]) };
}

/**
 * The homepage's first section, to the design ("The Base Homepage Slider"):
 * one product a slide, each in its own colour, each opening its product page.
 * It turns every five seconds and stops while the pointer or the keyboard is
 * on it, while it is off screen or the tab is hidden, and for visitors who ask
 * for reduced motion. Dots, arrows and a swipe move it.
 *
 * Only the slide on screen and its two neighbours load their pictures; the
 * rest follow as the slider reaches them.
 */
export function HomeSlider() {
  const rootRef = useRef<HTMLElement>(null);
  const [{ index, loaded }, move] = useReducer(moveTo, 0, (first) => moveTo({ index: -1, loaded: new Set() }, first));
  const [held, setHeld] = useState(false);
  const [visible, setVisible] = useState(false);
  const [still, setStill] = useState(false);
  // Bumped by every manual move, so the timer starts its five seconds again.
  const [turn, setTurn] = useState(0);
  const touchX = useRef<number | null>(null);

  const go = useCallback((next: number) => {
    move(next);
    setTurn((value) => value + 1);
  }, []);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setStill(motion.matches);
    onMotion();
    motion.addEventListener("change", onMotion);

    const root = rootRef.current;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && !document.hidden));
    if (root) observer.observe(root);
    const onVisibility = () => setVisible(!document.hidden && Boolean(root && isOnScreen(root)));
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      motion.removeEventListener("change", onMotion);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (held || !visible || still) return;
    const timer = window.setTimeout(() => move(index + 1), INTERVAL);
    return () => window.clearTimeout(timer);
  }, [index, turn, held, visible, still]);

  const onTouchStart = (event: TouchEvent) => {
    touchX.current = event.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (event: TouchEvent) => {
    const start = touchX.current;
    touchX.current = null;
    const end = event.changedTouches[0]?.clientX;
    if (start === null || end === undefined || Math.abs(end - start) < 40) return;
    go(end < start ? index + 1 : index - 1);
  };

  const current = HOME_SLIDES[index];

  return (
    <section
      ref={rootRef}
      className={styles.section}
      aria-roledescription="carousel"
      aria-labelledby="home-title"
      data-home-slider
    >
      {/* The page's h1, kept from the hero the slider replaced: the slides
          carry the visible copy, this keeps the page's headline for search. */}
      <h1 id="home-title" className={styles.hidden}>
        Premium Beverage Bases
      </h1>
      <div className={styles.stage}>
        <div
          className={styles.frame}
          data-ink={current.ink}
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false);
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className={styles.track} style={{ transform: `translateX(${-index * 100}%)` }} aria-live={held ? "polite" : "off"}>
            {HOME_SLIDES.map((slide, slideIndex) => {
              const active = slideIndex === index;
              return (
                <SiteLink
                  key={slide.slug}
                  href={`/${slide.slug}`}
                  className={styles.slide}
                  data-ink={slide.ink}
                  data-active={active || undefined}
                  style={{ "--slide-bg": slide.background } as CSSProperties}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${slideIndex + 1} of ${COUNT}: ${slide.product}`}
                  aria-hidden={!active}
                  tabIndex={active ? undefined : -1}
                >
                  <span className={styles.pictures} aria-hidden={slide.images.every((image) => !image.alt)}>
                    {loaded.has(slideIndex) &&
                      slide.images.map((image) => (
                        // eslint-disable-next-line @next/next/no-img-element -- transparent cut-outs placed by percent; the files are already sized WebP
                        <img
                          key={image.src}
                          src={image.src}
                          alt={image.alt}
                          className={styles.picture}
                          // The first slide is the top of the page: it loads at once.
                          loading={slideIndex === 0 ? "eager" : "lazy"}
                          fetchPriority={slideIndex === 0 ? "high" : undefined}
                          decoding="async"
                          draggable={false}
                          style={{ left: image.left, bottom: image.bottom, height: image.height, rotate: image.rotate }}
                        />
                      ))}
                  </span>
                  <span className={styles.copy}>
                    <span className={styles.tag}>{slide.tag}</span>
                    <h3 className={styles.title}>{slide.title}</h3>
                    <span className={styles.text}>{slide.text}</span>
                    <span className={styles.cta}>
                      View {slide.product}
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </span>
                </SiteLink>
              );
            })}
          </div>

          <div className={styles.nav}>
            <div className={styles.dots}>
              {HOME_SLIDES.map((slide, slideIndex) => (
                <button
                  key={slide.slug}
                  type="button"
                  className={styles.dot}
                  data-active={slideIndex === index || undefined}
                  aria-label={`Show ${slide.product}`}
                  aria-current={slideIndex === index || undefined}
                  onClick={() => go(slideIndex)}
                />
              ))}
            </div>
            <div className={styles.arrows}>
              <button type="button" className={styles.arrow} aria-label="Previous slide" onClick={() => go(index - 1)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button type="button" className={styles.arrow} aria-label="Next slide" onClick={() => go(index + 1)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function isOnScreen(element: Element) {
  const box = element.getBoundingClientRect();
  return box.bottom > 0 && box.top < window.innerHeight;
}
