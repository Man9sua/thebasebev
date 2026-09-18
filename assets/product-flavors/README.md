# Flavour shots

One photograph per flavour, per product. `build-flavor-shots.mjs` turns whatever
is here into the square shots the product pages show, and writes
`src/data/flavor-shots.json`.

## Where a file goes

```
assets/product-flavors/<product-slug>/<Flavour Name>.<ext>
```

- `<product-slug>` is the product's URL without the slash — `matcha`,
  `raf-coffee`, `sugar-free`.
- `<Flavour Name>` is the flavour exactly as `src/data/product-details.json`
  lists it for that product. Case and spacing do not have to match — `classic.png`
  finds `Classic` — but the spelling does. A file that matches nothing is
  reported by name and not built, so a typo shows up at the console rather than
  as a picture that never appears.
- `png`, `jpg`, `webp`, `avif` and `tiff` are all read. Send the largest version
  there is; the script does the resizing.

## What the script does with it

- **A cut-out on transparency** is trimmed and set on a wash of the product's own
  colour, so it matches the rest of the page. This is the better one to send.
- **A photograph with its own background** is cropped square to its subject.

Either way the page gets one square per flavour and the grid stays a grid.

## Nothing has to be finished

A product with no shots keeps the field of names it has today; a product with
some shows those and lists the rest. Add one product, run the script, and only
that product changes.

```bash
node scripts/build-flavor-shots.mjs
```

Sources are committed. The built shots land in `public/images/` as
`flavor-<slug>-<flavour>.webp`.
