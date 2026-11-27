const LIGHT = "#fdfaf5";
const DARK = "#1a1311";

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

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

function ratio(a: number, b: number): number {
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

export function onColor(hex: string): string {
  const background = luminance(hex);
  return ratio(background, luminance(LIGHT)) > ratio(background, luminance(DARK))
    ? LIGHT
    : DARK;
}

export function isDark(hex: string): boolean {
  return onColor(hex) === LIGHT;
}
