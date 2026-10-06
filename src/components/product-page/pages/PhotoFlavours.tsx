import type { CSSProperties } from "react";
import { FlavourEnquiryLink, cx, productImage, productPageStyles as styles } from "../blocks";
import local from "./PhotoFlavours.module.css";

export type PhotoFlavour = {
  name: string;
  /** `public/images/products/<slug>/flavour-<image>-{320,480}.webp` */
  image: string;
  /** What tops the serve in the photo, for the alt text. */
  garnish: string;
};

/**
 * Flavours that come with a photo of each serve: white cards, the glass above
 * the name (the Sugar Free card), closed by the own-flavour card on desktop
 * and the R&D link on a phone. The photos are prepared on one 3:4 frame with
 * the drink bottom-aligned, so the glasses stand on one line.
 */
export function PhotoFlavours({
  slug,
  drink,
  items,
  columns = 5,
}: {
  slug: string;
  /** Used in the alt text: "<name> <drink> with <garnish>". */
  drink: string;
  items: readonly PhotoFlavour[];
  columns?: number;
}) {
  return (
    <>
      <div className={local.flavours} style={{ "--cols": columns } as CSSProperties}>
        {items.map((flavour) => (
          <div key={flavour.name} className={local.flavour}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              {...productImage(slug, `flavour-${flavour.image}`, [320, 480])}
              sizes={`(max-width: 1023px) 45vw, ${Math.round(1248 / columns)}px`}
              alt={`${flavour.name} ${drink} with ${flavour.garnish}`}
              width={480}
              height={640}
              loading="lazy"
              decoding="async"
            />
            <span className={local.name}>{flavour.name}</span>
          </div>
        ))}
        <div className={cx(local.own, styles.desktopOnly)}>
          <span className={local.ownName}>Your own flavour</span>
          <FlavourEnquiryLink />
        </div>
      </div>
      <FlavourEnquiryLink className={cx(styles.textLink, styles.mobileOnly)}>
        Your own flavour: talk to R&amp;D →
      </FlavourEnquiryLink>
    </>
  );
}
