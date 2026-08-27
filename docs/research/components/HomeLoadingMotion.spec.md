# Home loading and motion specification

## Initial gate

- Show once per tab only when JavaScript and normal motion are available.
- Progress weights fonts, document readiness and the first three hero images.
- No artificial minimum duration; a hard timeout only prevents deadlock.
- On completion, the count reaches 100 and the curtain/reveal overlap as one
  transition. There is no second empty pause.
- The screen exposes a semantic loading status while present.

## Progressive enhancement

- Hero and below-fold content are visible in server/default CSS.
- JavaScript may temporarily arm entrance styles only while the loading gate or
  an observer is confirmed operational.
- Observer failure, disabled JavaScript or a component exception cannot leave
  content transparent.
- Reduced motion skips the intro and all nonessential transforms.

## Resource policy

- First three hero rail images: eager; first image: high priority.
- Remaining hero and below-fold images: lazy.
- Loader never waits for every image on the page.
