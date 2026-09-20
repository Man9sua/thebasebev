"use client";

import { useEffect, useRef, useState } from "react";
import { BRAND_VIDEO } from "@/lib/site-config";

/**
 * The brand film, played inside the About frame.
 *
 * It is 3.9 MB and sits well below the fold, so nothing is fetched until the
 * frame is actually approaching the viewport: `src` is attached on first
 * intersection and playback follows once React has applied it. Calling `play()`
 * in the same tick as arming does not work — the element has no source yet and
 * the promise is rejected — which is why the two live in separate effects.
 *
 * Reduced motion gets the poster and nothing else: an autoplaying loop is
 * exactly the kind of ambient movement that setting asks to be spared.
 */
export function BrandFilm({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setArmed(true);
      },
      { threshold: 0.2 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !armed) return;

    if (!visible) {
      video.pause();
      return;
    }

    // `play()` is what starts the fetch under `preload="none"`, so it is called
    // unconditionally rather than waiting on `loadeddata` — that event never
    // arrives while nothing has asked for the bytes.
    //
    // Autoplay can still be refused by the browser; the poster stays underneath
    // either way, so a rejection costs the motion and nothing else.
    void video.play().catch(() => {});
  }, [armed, visible]);

  return (
    <video
      ref={videoRef}
      className={className}
      // Attached late, so the poster is the only request until the frame is near.
      src={armed ? BRAND_VIDEO.desktop : undefined}
      poster={BRAND_VIDEO.poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label="THE BASE brand film"
    />
  );
}
