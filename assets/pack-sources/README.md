# Pack sources

Drop product photography here, one file per catalogue slug, and run:

```bash
node scripts/build-pack-shots.mjs
```

A file here wins over the render named in the script's `SOURCES` table, and a
slug without one keeps the render it already has — so the set can be replaced a
few products at a time rather than all sixteen at once.

**Naming.** The file name is the slug, the extension is whatever you have:
`.png`, `.webp`, `.jpg`, `.tif`.

```
milkshake  frappe    iced-tea   cordial
raf-coffee chai-latte matcha    chocolate
cream-latte jam      topping    garnish
sugar-syrup tea      sugar-free vending
```

**What makes a good source.** A cut-out on transparency is ideal; a shot on a
plain white sweep works too, because the trim measures against white when there
is no alpha. The pouch should be upright and uncropped, and the bigger the file
the better — everything else is done by the script: it trims to the product's
own edges, scales it to one box, stands every pack on one baseline, and writes
`public/images/pack-<slug>.webp` at 720x960.

Files in this folder are inputs, not assets: nothing here is served. Keep them
if you want the build reproducible, or delete them once the packs are written.
