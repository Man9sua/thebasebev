import legacyImageVariants from "@/data/legacy-image-variants.json";

/**
 * The delivery-sized copy of an exported image, when there is one.
 *
 * `scripts/build-legacy-image-variants.mjs` writes a WebP beside every heavy
 * original and records it in `legacy-image-variants.json`, keyed by the
 * original's file name. Parity pages get the swap applied to their markup as
 * they are served; React surfaces that render the same artwork call this.
 *
 * Returns the input unchanged when no variant exists, so it is safe to wrap any
 * image path in it.
 */
export function resizedImage(source: string | null | undefined): string | null {
  if (!source) return null;

  const file = source.split("/").pop() ?? "";
  const variant = (legacyImageVariants as Record<string, string>)[file];

  return variant ? `/images/${variant}` : source;
}
