/**
 * Page heads for the two parity pages whose own opening block had to go.
 *
 * Both are Tilda template pages whose top was template debris rather than
 * content — see `REMOVED_BODY_RECORDS` in `lib/site-pages.ts` for what was
 * dropped and why. Dropping it took each page's `h1` with it, so the heading
 * is written down here and rendered by `PageIntro` instead.
 *
 * The wording is the page's own wherever the page had any: `/private-labeling`
 * keeps its heading and its opening sentence character for character, and only
 * moves them to the top of the page from the bottom, where they were sitting
 * under nothing. `/rnd` is the one place a heading is new — its only `h1` was
 * the Russian calorie calculator that came with the template, and the wording
 * below is that page's own `<title>`, which is the phrase it has been
 * optimised for all along.
 *
 * Anything here is SEO surface. Change it deliberately, not in passing.
 */

export type PageIntro = {
  /** Small label above the heading. */
  eyebrow: string;
  /** The page's `h1`. */
  title: string;
  /** Optional statement between the heading and the lead. */
  tagline?: string;
  lead: string;
  /** Optional background film, muted and looping. */
  video?: string;
  /**
   * Set on a page whose own first block is dark, so the head reads as the top
   * of that page rather than as a white strip resting on it.
   */
  tone?: "dark";
};

export const PAGE_INTROS: Record<string, PageIntro> = {
  "/private-labeling": {
    eyebrow: "Private label",
    title: "Wholesale and Private Labeling",
    tagline: "Your Brand. Our Craft.",
    lead:
      "We design and manufacture exclusive beverage formulations for brands who refuse to " +
      "compromise — from concept to finished product, made in the UAE.",
    video: "/images/vide6532-6533-4465-b562-656236323061__11900460_1920_1080_2.mp4",
  },
  "/rnd": {
    eyebrow: "R&D lab",
    tone: "dark",
    title: "Beverage R&D and Product Development in Dubai",
    lead:
      "Custom beverage R&D in Dubai: recipe development, flavour matching and pilot batches " +
      "for HORECA and private label brands across the UAE and GCC.",
  },
};

export function getPageIntro(route: string) {
  return PAGE_INTROS[route];
}
