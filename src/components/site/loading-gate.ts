/**
 * The gate between the loading screen and the first section's entrance.
 *
 * `LoadingScreen` closes the gate synchronously, before first paint, by setting
 * `data-tbb-loading` on `<html>`; it opens it again when the panel starts
 * wiping away. Anything with an entrance animation waits on
 * `whenLoadingGateOpens` instead of animating behind a screen nobody can see.
 *
 * The attribute lives on `<html>` rather than in React state on purpose: it has
 * to exist before the first paint, and only an inline script can manage that.
 */

const GATE_ATTRIBUTE = "data-tbb-loading";

export const LOADING_GATE_EVENT = "tbb:loading-gate-open";

/**
 * True when nothing is covering the page — no JS, a repeat visit in the same
 * tab, reduced motion, or the loading screen has already finished.
 */
export function isLoadingGateOpen(): boolean {
  if (typeof document === "undefined") return true;
  return document.documentElement.getAttribute(GATE_ATTRIBUTE) !== "1";
}

export function openLoadingGate(): void {
  document.documentElement.removeAttribute(GATE_ATTRIBUTE);
  window.dispatchEvent(new Event(LOADING_GATE_EVENT));
}

/**
 * Calls `run` once the gate is open — immediately if it already is. Returns a
 * cleanup function, so it drops straight into a `useEffect`.
 *
 * `timeoutMs` is a dead-man's switch: if the loading screen ever fails to
 * finish, the section still animates in rather than staying invisible.
 */
export function whenLoadingGateOpens(run: () => void, timeoutMs = 6000): () => void {
  if (isLoadingGateOpen()) {
    const frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }

  const fire = () => {
    window.removeEventListener(LOADING_GATE_EVENT, fire);
    window.clearTimeout(timer);
    run();
  };

  const timer = window.setTimeout(fire, timeoutMs);
  window.addEventListener(LOADING_GATE_EVENT, fire);

  return () => {
    window.removeEventListener(LOADING_GATE_EVENT, fire);
    window.clearTimeout(timer);
  };
}

/**
 * Runs in `<head>`, before any of the page's own markup is parsed, so the
 * screen is either already armed or never shows at all — there is no frame in
 * between where the wrong thing is on screen.
 *
 * It stays quiet for anyone the animation would be wrong for: no JavaScript
 * (the script never runs, and the screen's CSS keeps it hidden without the
 * attribute) or reduced-motion. A full homepage document load always arms the
 * curtain; client-side route changes do not rerun this head script.
 *
 * The path test is what keeps this in the shared layout without leaking: only
 * the homepage renders a loading screen, and arming the gate anywhere else
 * would stall that page's entrances waiting for a screen that never exists.
 */
export const LOADING_GATE_SCRIPT = `(function(){try{
if(location.pathname!=='/')return;
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
document.documentElement.setAttribute('${GATE_ATTRIBUTE}','1');
}catch(e){}})();`;
