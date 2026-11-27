# Home hero

The input for the homepage's first screen, and an input only: nothing here is
served and nothing here is committed. Run

```bash
node scripts/build-home-hero.mjs
```

and the served files are written to `public/images` as `home-hero-room.webp`
and `home-hero-room-mobile.webp`, each at 1x and 2x.

## Where it came from

`showroom.jpg` is `uploads/shoowroomsimple-6.jpg` from the owner's
`Site review workspace setup.zip` (2026-09-23), the photograph the hero
redesign document places behind the first screen: THE BASE's own showroom, with
WHERE TASTE BEGINS on the wall above the stair.

It is 5184 x 3888 and 8.5 MB, which is why it stays out of the repository. The
crops the build takes from it are the design's own placement numbers, written
down at the top of the script, so the framing survives the photograph being
re-exported or replaced.
