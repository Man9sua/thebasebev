# Header surface transition specification

## Overview

- Targets: `SiteHeader.tsx`, `SiteHeader.module.css`, `BrandLogo.tsx`.
- Interaction model: scroll-driven `IntersectionObserver` state with CSS interpolation.

## States

- Light: paper background, black controls, black `the`, red BASE block.
- Dark: black background, white controls, white `the`, unchanged red BASE block.
- Trigger: a `[data-surface="dark"]` element intersects the fixed header band.
- Transition: background, border and text colour interpolate over 560-720 ms with `--tbb-ease`; the header does not jump or translate.

## Cleanup contract

- No Tilda zoom controls may be visible outside an intentional open gallery.
- Shared header uses the native cart store; no `window.tcart` polling or `tcart__openCart` call remains.
