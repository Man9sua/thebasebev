"use client";

import { useEffect, useState } from "react";
import { isLoadingGateOpen, openLoadingGate } from "./loading-gate";
import styles from "./LoadingScreen.module.css";

/**
 * The loading screen.
 *
 * A paper panel over the whole viewport with one big count from 0 to 100. When
 * it lands, the number lifts up out of its mask and the panel opens downwards,
 * so the hero is uncovered from the top edge down and plays its own entrance
 * into the space as it appears.
 *
 * The count is driven by real signals — fonts, the window load event and the
 * critical hero art decoding — not a fake timer, because the point of holding
 * the first paint back is that the type and key visual have actually arrived by
 * the time anyone sees them. `MAX_MS` caps the whole thing regardless, so a
 * slow image can never strand a visitor behind a blank screen.
 *
 * It renders on the server too, but the CSS keeps it invisible unless the
 * inline gate script has armed it. So no-JS visitors and reduced-motion users
 * get the page directly, with no flash and nothing to dismiss. Every full
 * homepage document load is armed; client-side navigation does not execute the
 * head script again and therefore does not create an extra curtain.
 */

/** Hard ceiling. Nothing may hold the page longer than this. */
const MAX_MS = 2600;
/** Maximum critical hero images to wait for. */
const WATCHED_IMAGES = 3;

const LIFT_MS = 520;
const OPEN_MS = 1000;
/** A brief readable hold for the completed 100% state before the number lifts. */
const COMPLETE_FRAME_MS = 320;

type Phase = "counting" | "lifting" | "opening";

export function LoadingScreen() {
  // Whether this visit is gated at all was decided before paint by the inline
  // script, so the component only reads the result. Doing it in the initialiser
  // rather than an effect is safe here because it changes no markup — the panel
  // is rendered either way and CSS alone decides whether it is on screen.
  const [armed, setArmed] = useState(
    () => typeof document !== "undefined" && !isLoadingGateOpen(),
  );
  const [phase, setPhase] = useState<Phase>("counting");
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!armed) return;

    let frame = 0;
    let shown = 0;
    const scheduled: number[] = [];

    // ---- real progress signals ----
    const signals = { fonts: false, load: false, art: false };
    const settle = (key: keyof typeof signals) => () => {
      signals[key] = true;
    };

    if (document.fonts) document.fonts.ready.then(settle("fonts"), settle("fonts"));
    else settle("fonts")();

    const markLoaded = settle("load");
    if (document.readyState === "complete") signals.load = true;
    else window.addEventListener("load", markLoaded, { once: true });

    const art = [
      ...document.querySelectorAll<HTMLImageElement>(
        "[data-hero] img[fetchpriority='high'], [data-hero-tile] img",
      ),
    ]
      .slice(0, WATCHED_IMAGES)
      .map((image) =>
        image.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
      );
    Promise.all(art).then(settle("art"), settle("art"));

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(deadMansSwitch);
      setValue(100);
      scheduled.push(
        window.setTimeout(() => {
          setPhase("lifting");
          scheduled.push(
            window.setTimeout(() => {
              setPhase("opening");
              // The hero starts arriving as the panel begins to move, so the
              // two read as one gesture rather than a screen leaving and a
              // page starting.
              openLoadingGate();
            },
            LIFT_MS),
          );
        }, COMPLETE_FRAME_MS),
      );
    };

    const tick = () => {
      const done = Object.values(signals).filter(Boolean).length;

      /**
       * The target advances only when a real readiness signal resolves. The
       * easing is presentation, not a minimum wait: on a warm cache the count
       * catches up immediately and exits, while a slow critical image holds
       * only its own share of progress.
       */
      const target = 0.08 + 0.92 * (done / 3);

      // Ease towards the target rather than snapping to it, so a signal
      // resolving mid-count reads as the number catching up, not jumping.
      shown += (target * 100 - shown) * 0.18;
      setValue(Math.min(99, Math.round(shown)));

      if (target >= 1 && shown > 97) {
        finish();
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    /**
     * The one thing this screen must never do is stay up.
     *
     * `tick` runs on rAF, and rAF is not serviced while a tab is in the
     * background — open the site in a background tab and the count would sit at
     * zero behind a curtain that nothing removes. Timers keep running (throttled,
     * but running), so this fires the exit no matter what the animation frames
     * are doing.
     */
    const deadMansSwitch = window.setTimeout(finish, MAX_MS + 400);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(deadMansSwitch);
      window.removeEventListener("load", markLoaded);
      for (const timer of scheduled) window.clearTimeout(timer);
    };
  }, [armed]);

  // Once the panel has finished opening it is invisible but still a fixed
  // element over the whole page; drop it out of the tree rather than leave it
  // sitting there for the rest of the session.
  useEffect(() => {
    if (phase !== "opening") return;
    const timer = window.setTimeout(() => setArmed(false), OPEN_MS + 80);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (!armed && phase === "opening") return null;

  return (
    <div
      className={`${styles.screen} ${phase === "opening" ? styles.open : ""}`}
      // Purely a curtain: it never takes a click, so an impatient visitor
      // reaches the page underneath and automation is never blocked by it.
      role="progressbar"
      aria-label="Loading THE BASE"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      data-loading-screen
    >
      <div className={styles.mask}>
        <div className={`${styles.count} ${phase === "counting" ? "" : styles.lift}`}>
          <span className={styles.number}>{value}</span>
          <span className={styles.percent}>%</span>
        </div>
      </div>

      <span
        className={styles.rule}
        style={{ ["--progress" as string]: `${phase === "counting" ? value : 100}%` }}
      />
    </div>
  );
}
