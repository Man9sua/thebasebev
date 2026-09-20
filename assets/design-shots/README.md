# Design shots and scenes

Inputs for the homepage redesign, and inputs only: nothing here is served and
nothing here is committed. Run

```bash
node scripts/build-design-shots.mjs
```

and the served files are written to `public/images` as `shot-<slug>.webp` and
`home-<name>.webp`.

## Where they came from

Both folders were unpacked from the design file the owner supplied
(`Untitled.fig`, 2026-09-11). A `.fig` is a ZIP: `images/` holds every source
at full size, keyed by SHA-1, and `canvas.fig` holds the scene — a Kiwi v106
stream under Zstandard — which is what says who each image belongs to.

`assets/design-shots/<slug>.png` are the sixteen drinks, all cut-outs on
transparency at 1000x1500. The slug is the catalogue slug, so the shelf and the
homepage grid pick the same picture up:

```
milkshake  frappe     iced-tea    cordial
raf-coffee chai-latte matcha      chocolate
cream-latte jam       topping     garnish
sugar-syrup tea       sugar-free  vending
```

`assets/design-scenes/<name>.png` are the photographs and the two composed
offer cards:

| file | drawn at | used by |
| --- | --- | --- |
| `hero-desktop.png` | 1269x653 | the hero band, wide |
| `hero-mobile.png` | 374x670 | the hero band, narrow |
| `signature-card.png` | 700x413 @2x | "Want a Unique Flavor for Your Brand?" |
| `signature-mobile.png` | 622x1038 | the same card stacked |
| `sample-card.png` | 395x413 @2x | "Try Before You Buy" |
| `team.png` | 1582x883 | "WHO WE ARE?" |

The two `*-card.png` files are node exports rather than source photographs:
they are the whole card as the design composes it, corners and all. The sample
card is a collage of three packs at 20, 21 and 41 degrees over a gradient, and
one exported picture is both smaller and truer than five rotated CSS layers.

## What is deliberately not here

Two images sit on the hero in the design file and are not built: a rasterised
"Получить прайс" button and a phone number reading `8 961 164 64 11`. Both are
screenshots of another site pasted onto the canvas — Russian copy on an English
page, and a Russian mobile number where THE BASE's own is +971 50 989 0429.
They are reference material, not content.
