"use client";

import { useEffect, useReducer, useRef, type CSSProperties, type TouchEvent } from "react";
import { ProductPackshot } from "@/components/product/ProductPackshot";
import { SiteLink } from "@/components/site/SiteLink";
import { HOME_SLIDES } from "@/data/home-slides";
import styles from "./HomeSlider.module.css";

const INTERVAL = 5000;
const COUNT = HOME_SLIDES.length;
const wrap = (index: number) => (index + COUNT) % COUNT;

type Position = Readonly<{ index: number; loaded: ReadonlySet<number> }>;

/** Moving to a slide also lets it and its two neighbours load their pictures. */
function moveTo(position: Position, next: number | "next" | "previous"): Position {
  const index = wrap(typeof next === "number" ? next : position.index + (next === "next" ? 1 : -1));
  const wanted = [index, wrap(index + 1), wrap(index - 1)];
  if (index === position.index && wanted.every((item) => position.loaded.has(item))) return position;
  return { index, loaded: new Set([...position.loaded, ...wanted]) };
}

/**
 * The homepage's first section, to the design ("The Base Homepage Slider"):
 * one product a slide, each in its own colour, each opening its product page.
 * Visible banners turn every five seconds, including after manual navigation.
 * Reduced-motion visitors get the same slides with instantaneous transitions.
 *
 * Only the slide on screen and its two neighbours load their pictures; the
 * rest follow as the slider reaches them.
 */
export function HomeSlider() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [{ index, loaded }, move] = useReducer(moveTo, 0, (first) => moveTo({ index: -1, loaded: new Set() }, first));
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    let inView = false;
    let timer: number | undefined;
    function syncTimer() {
      if (inView && !document.hidden) {
        timer ??= window.setInterval(() => move("next"), INTERVAL);
      } else {
        window.clearInterval(timer);
        timer = undefined;
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRect.height > 0;
      syncTimer();
    }, { threshold: [0, 0.001] });
    observer.observe(frame);
    document.addEventListener("visibilitychange", syncTimer);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncTimer);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    const focused = document.activeElement;
    if (frame?.contains(focused) && focused?.matches('[aria-roledescription="slide"][aria-hidden="true"]')) {
      frame.querySelector<HTMLElement>('[aria-roledescription="slide"][data-active]')?.focus({ preventScroll: true });
    }
  }, [index]);

  const onTouchStart = (event: TouchEvent) => {
    touchX.current = event.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (event: TouchEvent) => {
    const start = touchX.current;
    touchX.current = null;
    const end = event.changedTouches[0]?.clientX;
    if (start === null || end === undefined || Math.abs(end - start) < 40) return;
    move(end < start ? "next" : "previous");
  };

  const current = HOME_SLIDES[index];

  return (
    <section
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
          ref={frameRef}
          className={styles.frame}
          data-ink={current.ink}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onTouchCancel={() => { touchX.current = null; }}
        >
          <div className={styles.track} style={{ transform: `translateX(${-index * 100}%)` }} aria-live="off">
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
                  <span className={styles.pictures}>
                    {loaded.has(slideIndex) && (
                      <ProductPackshot slug={slide.slug} className={styles.picture} sizes="(max-width: 759px) 52vw, 30vw" eager={slideIndex === 0} />
                    )}
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
                  onClick={() => move(slideIndex)}
                />
              ))}
            </div>
            <div className={styles.arrows}>
              <button type="button" className={styles.arrow} aria-label="Previous slide" onClick={() => move("previous")}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button type="button" className={styles.arrow} aria-label="Next slide" onClick={() => move("next")}>
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
