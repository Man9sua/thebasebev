import { BRAND_VIDEO } from "@/lib/site-config";

/**
 * The brand film, played inside the About frame.
 *
 * **A player, not a loop.** It used to be ambient footage: armed on
 * intersection, muted, looping, no controls. The film it carries now is a
 * forty-seven second piece to camera with speech and burned-in subtitles —
 * played silently on repeat that is someone mouthing words at a visitor who
 * cannot hear them, and who has no way to start it, stop it or turn it up. So
 * the poster stands until it is pressed, and pressing it plays the film once,
 * with sound and with a scrubber.
 *
 * That also settles what the ambient version had to work around. `preload` is
 * "none" and nothing is armed on intersection, so the 7 MB is fetched when a
 * visitor asks for it and never otherwise — which is why this no longer needs
 * to be a client component at all, and why reduced motion needs no special
 * case: nothing moves until it is asked to.
 */
export function BrandFilm({ className }: { className?: string }) {
  return (
    <video
      className={className}
      src={BRAND_VIDEO.desktop}
      poster={BRAND_VIDEO.poster}
      controls
      playsInline
      preload="none"
      aria-label="THE BASE — an introduction to the range"
    />
  );
}
