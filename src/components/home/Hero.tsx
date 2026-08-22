"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/components/motion/useMediaQuery";
import { HERO_VIDEO } from "@/lib/site-config";
import styles from "./Hero.module.css";

/**
 * Fullscreen hero video.
 *
 * Intentionally has no heading: the page h1 lives in Bestsellers, where it
 * carries the active product the way production does today.
 *
 * The source is chosen once, before the element mounts, from a media query —
 * setting `src` after mount would make the browser fetch both files. Autoplay
 * can still be refused (low-power mode, some mobile settings), so the poster
 * stays underneath and a play control appears rather than a dead black screen.
 */
export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [seam, setSeam] = useState(false);

  // Resolved before the element renders, so only one file is ever fetched.
  const isMobile = useMediaQuery(
    `(max-width: ${HERO_VIDEO.mobileBreakpoint - 1}px)`,
  );
  const source = isMobile ? HERO_VIDEO.mobile : HERO_VIDEO.desktop;

  // Read inside listeners without making them a dependency of the effect.
  const blockedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      video.play().then(
        () => {
          blockedRef.current = false;
          setNeedsGesture(false);
        },
        () => {
          blockedRef.current = true;
          setNeedsGesture(true);
        },
      );
    };

    play();

    const { loopStart, loopEnd, seamFadeMs } = HERO_VIDEO;
    const fadeSeconds = seamFadeMs / 1000;

    /**
     * Two jobs: honour an optional trim range, and dip to black across the loop
     * boundary. `timeupdate` fires ~4x a second, which is enough to arm a CSS
     * transition ahead of the seam without polling every frame.
     */
    const onTimeUpdate = () => {
      const end = loopEnd ?? video.duration;
      if (!Number.isFinite(end)) return;

      setSeam(video.currentTime >= end - fadeSeconds);

      if (video.currentTime >= end) {
        video.currentTime = loopStart ?? 0;
      }
    };

    const onSeeked = () => setSeam(false);
    // A stalled hero reads as broken; recovering silently is better than a
    // frozen frame the user has to fix by reloading.
    const onStalled = () => play();

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("stalled", onStalled);
    video.addEventListener("suspend", onStalled);

    // A background tab refuses autoplay the same way a real block does, so
    // always retry on return: if it was only the tab being hidden, this starts
    // playback and clears the Play control the user never needed to press.
    const onVisibility = () => {
      if (!document.hidden && video.paused) play();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("stalled", onStalled);
      video.removeEventListener("suspend", onStalled);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [source]);

  const scrollOn = () => {
    const next = document.getElementById("bestsellers");
    (next ?? document.body).scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className={styles.hero} aria-label="THE BASE" data-hero>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.poster}
        src={HERO_VIDEO.poster}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
      />

      <video
        ref={videoRef}
        className={styles.video}
        src={source}
        poster={HERO_VIDEO.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        // Decorative: the film's message is repeated in the sections below.
        aria-hidden="true"
        tabIndex={-1}
      />

      <span
        className={`${styles.seam} ${seam ? styles.seamActive : ""}`}
        style={{ ["--seam-fade" as string]: `${HERO_VIDEO.seamFadeMs}ms` }}
        aria-hidden="true"
      />
      <span className={styles.veil} aria-hidden="true" />

      {needsGesture && (
        <button
          type="button"
          className={styles.playButton}
          onClick={() => videoRef.current?.play().then(() => setNeedsGesture(false))}
        >
          Play
        </button>
      )}

      <div className={styles.foot}>
        <p className={styles.tagline}>
          <span className={`tbb-label ${styles.taglineLabel}`}>Dubai, UAE</span>
          600+ dry beverage bases and instant premixes, made for HoReCa, retail
          and private label.
        </p>

        <button type="button" className={styles.cue} onClick={scrollOn}>
          <span className={`tbb-label ${styles.cueLabel}`}>Scroll</span>
          <span className={styles.cueLine} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
