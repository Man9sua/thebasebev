import type { ReactNode } from "react";
import styles from "./StackReveal.module.css";

/**
 * Scroll stacking.
 *
 * A wrapped section pins at the top of the viewport and the next one rides up
 * over it, arriving on a rounded, shadowed edge. It is `position: sticky` and
 * nothing else — no scroll listener, no transform, no measured heights — which
 * is why it survives the inertial scroller, the fixed header and every
 * `IntersectionObserver` already on the page.
 *
 * The last surface must be passed `pinned={false}`. A sticky final element has
 * nothing to be covered by, so it either glues itself to the viewport or leaves
 * bare page beneath it; it still gets the edge, because it is still the thing
 * arriving over what came before.
 *
 * The wrapper must not be given `overflow` and must stay in the scrolling flow:
 * a clipping ancestor between a sticky element and the viewport silently turns
 * it back into a static one.
 */
export function StackReveal({
  children,
  pinned = true,
  scene,
  sceneIndex,
}: {
  children: ReactNode;
  pinned?: boolean;
  scene?: string;
  sceneIndex?: number;
}) {
  return (
    <div
      className={pinned ? styles.layer : styles.edge}
      data-home-scene={scene}
      data-scene-index={sceneIndex}
    >
      {children}
    </div>
  );
}
