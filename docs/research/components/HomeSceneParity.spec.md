# Homepage responsive and interaction specification

## Stable content order

The public homepage keeps one semantic section order at every viewport:

1. Real-signal `0-100` loading curtain.
2. Cream Latte product hero.
3. Bestsellers product carousel.
4. Manufacturing collage.
5. Reading carousel.
6. Company/About section.
7. Shared footer.

The browser owns vertical document scrolling. Animations enhance the sections
but must never be required for their content to exist or remain visible.

## Desktop composition

Desktop is not the mobile layout enlarged inside a narrow centred column.
Starting at `1024px`, preserve the designed wide composition:

- Bestsellers is a three-column `copy / product stage / controls` grid.
- The manufacturing collage uses its asymmetric twelve-column mosaic.
- The Reading heading and arrow controls share one horizontal row.
- The About body uses its two-column editorial layout.
- The footer uses `brand / products / company / resources` columns.

Do not add `min-width` media rules that replace these grids with `1fr` or cap
the entire section at a mobile reading width. Required desktop references are
`1366x768`, `1440x900` and `1920x1080`.

## Mobile composition

Below the existing component breakpoints, the same content is deliberately
restacked for a narrow screen. Bestsellers becomes `stage / copy / controls`,
the collage uses six columns, About becomes one column and the footer collapses
progressively. Required mobile references are `320`, `375`, `390` and `430px`.

## Bestsellers input contract

One `goTo` function owns the active product. It is used by:

- previous/next buttons;
- product dots;
- autoplay while the section is visible;
- keyboard left/right arrows;
- pointer drag in both directions;
- touch swipe in both directions;
- dominant horizontal trackpad wheel gestures in both directions.

Vertical touch and wheel input must continue to scroll the document. A drag
must suppress the underlying product click, while a click without movement must
still select the card.

## Loading and accessibility

- A full homepage document load exposes progress from `0` through `100` before
  revealing the Hero without an extra blank delay.
- Critical Hero media is eager; below-the-fold media remains lazy.
- `prefers-reduced-motion` and no-JavaScript paths expose readable content.
- Exactly one carousel slide is active to assistive technology.
- Every verified viewport has no document-level horizontal overflow.

## Automated regression contract

`npm run smoke:home-scenes -- <url>` must verify:

- desktop grid column counts listed above;
- pointer and trackpad movement next and previous on desktop;
- touch swipe next and previous on mobile;
- active product image decoding;
- intro completion, natural document scroll and section visibility;
- zero horizontal document overflow;
- screenshots at `390x844`, `1440x900` and `1920x1080`.
