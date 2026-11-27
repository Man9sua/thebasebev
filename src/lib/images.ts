import legacyImageVariants from "@/data/legacy-image-variants.json";

export function resizedImage(source: string | null | undefined): string | null {
  if (!source) return null;

  const file = source.split("/").pop() ?? "";
  const variant = (legacyImageVariants as Record<string, string>)[file];

  return variant ? `/images/${variant}` : source;
}
