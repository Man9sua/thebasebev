/**
 * Pick readable ink for an arbitrary product colour.
 *
 * Product colours are data — they are sampled from artwork and meant to be
 * swapped freely — so anything painted on top of a colour field has to derive
 * its own contrast rather than assume a light background. THE BASE's own
 * palette already spans `#f1d1b4` and `#42080d`.
 */

const LIGHT = "#fdfaf5";
const DARK = "#1a1311";

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(hex: string): number {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;

  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);

  if (![r, g, b].every(Number.isFinite)) return 1;

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two luminances, 1 to 21. */
function ratio(a: number, b: number): number {
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Foreground for content sitting on `hex`.
 *
 * Comparing both candidates beats thresholding the background's luminance. A
 * mid-tone like matcha `#53a967` or cordial `#8499b3` sits near any sensible
 * cut-off, and guessing wrong there produced ~2.8:1 — below AA. Measuring picks
 * the same answer as a threshold at the extremes and the correct one in the
 * middle.
 */
export function onColor(hex: string): string {
  const background = luminance(hex);
  return ratio(background, luminance(LIGHT)) > ratio(background, luminance(DARK))
    ? LIGHT
    : DARK;
}

/** True when light ink wins on this colour. */
export function isDark(hex: string): boolean {
  return onColor(hex) === LIGHT;
}
