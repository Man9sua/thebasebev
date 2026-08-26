# Homepage scene parity specification

## Overview

- **Target files:** `src/components/home/HomeExperience.tsx` and existing home sections.
- **Reference:** current homepage at `390x844`.
- **Interaction model:** one ordered scroll-driven scene system, with native touch
  scrolling and horizontal product swipe on touch, plus debounced scene/product
  stepping for wheel, trackpad and keyboard input.
- **QA artifacts:** ignored `.audit-artifacts/home-sequence/` and
  `.visual-artifacts/home-scenes/` screenshots.

## Audited mobile sequence

| State | Surface | Content and behavior |
| --- | --- | --- |
| Intro | Loading curtain | Real-signal `0%` to `100%`, then one clean hero reveal. |
| Scene 0 | Hero | Cream Latte hierarchy, CTA, badges and moving product-card rail. |
| Scene 1 | Bestsellers | Product stage first, copy second, controls third; one active product with adjacent cards. |
| Scene 2 | Manufacturing collage | Eyebrow, heading and lede before the asymmetric six-column image sequence. |
| Scene 3 | Reading | Heading before a native horizontal snap rail with one card and the next card edge visible. |
| Scene 4 | About | Overlapping image plates before company copy, stats and CTA. |
| Scene 5 | Footer | Dark shared footer; header changes to its dark-surface state. |

Scene order and content are invariant across viewport widths.

## Root causes

### A. Bestsellers desktop composition diverges

- Base CSS uses a three-column `copy / stage / controls` grid and a right-hand
  colour field.
- The correct vertical `stage / copy / controls` composition exists only below
  `1024px`.
- Safe fix: make the vertical composition the base at every width; desktop may
  increase stage width, type size and visible adjacent-card area only.

### B. About and Reading desktop compositions diverge

- About is two columns on desktop, while mobile correctly puts the image plates
  before the copy.
- Reading exposes four narrow cards and a side-by-side header on desktop, while
  mobile is a horizontal rail with one active visual and a partial neighbour.
- Safe fix: preserve mobile DOM order and flex/grid direction at all widths;
  change dimensions and spacing only.

### C. There is no shared scene state machine

- `StackReveal` supplies the same sticky surface transition, but active scene,
  active product and transition lock are not coordinated.
- `SmoothScroll` handles desktop wheel as continuous document movement and is
  disabled for coarse pointers; the header runs separate observers.
- Safe fix: one `HomeExperience` client owns `activeScene`, `activeProduct` and
  `isTransitioning`. Input adapters call the same transition functions. Mobile
  keeps native vertical touch scrolling; desktop wheel/trackpad and keyboard
  step the same DOM scenes.

### D. Product interaction is not input-parity complete

- Product arrows, dots and autoplay share `goTo`, but horizontal swipe is not
  implemented.
- Safe fix: keep one controlled active-product index and route arrows, dots,
  autoplay, pointer swipe and desktop scene-wheel steps through the same setter.

## State contract

```text
activeScene: 0..5
activeProduct: 0..N-1
isTransitioning: boolean
headerTheme: hero | light | dark
```

- Scene 0 uses transparent hero header treatment.
- Scenes 1-4 use the light solid treatment.
- Scene 5 uses the dark footer treatment.
- At Scene 1, forward/back wheel steps active products before leaving the scene.
- At first/last scene, outward wheel input is released instead of trapped.
- `prefers-reduced-motion` keeps content visible and uses native non-animated
  navigation without forcing scene transitions.

## Responsive contract

- Breakpoints may change only sizes, width, gaps, padding and the amount of a
  neighbouring card visible.
- Breakpoints must not reorder scenes, replace a carousel with a grid, hide a
  scene, or disable the shared scene observer/state.
- Mobile `390x844` remains the regression reference.
- Required desktop references: `1440x900` and `1920x1080`.

## Acceptance tests

- Initial scene is 0 after the loading gate.
- Desktop wheel moves 0 to 1 and does not skip scenes during its lock.
- While Scene 1 is active, wheel changes the product before advancing to 2.
- Reverse wheel restores the previous product and scene.
- Keyboard arrows use the same transitions.
- Horizontal pointer/touch swipe changes the active product.
- Native mobile vertical scroll updates the same `activeScene` state.
- Final scene activates the footer header theme.
- Every state has zero document-level horizontal overflow.
