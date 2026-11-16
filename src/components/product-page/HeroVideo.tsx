"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HeroVideo.module.css";

export function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (preference.matches) video.current?.pause();
      else void video.current?.play().catch(() => {});
    };
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  return <>
    <video className={styles.video} ref={video} muted loop playsInline preload="metadata" poster="/images/electrolyte-poster.webp"
      onPlay={() => setPaused(false)} onPause={() => setPaused(true)} aria-hidden="true">
      <source src="/videos/electrolyte-hero.mp4" type="video/mp4" />
    </video>
    <button className={styles.toggle} type="button" aria-label={paused ? "Play background video" : "Pause background video"}
      onClick={() => { if (paused) void video.current?.play().catch(() => {}); else video.current?.pause(); }}>
      {paused ? "Play video" : "Pause video"}
    </button>
  </>;
}
