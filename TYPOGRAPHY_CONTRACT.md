# THE BASE typography contract

The main page is the reference for typography across the site. This contract
applies to native components, retained Tilda content, new pages and future edits.

## Font source

`src/app/layout.tsx` self-hosts Exo 2 through `next/font/google`, exposes
`--tbb-font-exo` on `<html>` and loads weights 300 through 900. There is no runtime
Google Fonts request. The shared family includes the matching Next.js fallback;
Arial/Helvetica are last-resort fallbacks, never a component's first choice.

`src/styles/design-tokens.css` is the single source of font roles:

| Role | Family token | Weight token | Reference |
| --- | --- | --- | --- |
| Main and section headings | `--tbb-font-heading` | `--tbb-font-weight-heading` = 900 | Home hero and section titles |
| Smaller card/product names and article subheads | `--tbb-font-heading` | `--tbb-font-weight-subheading` = 800 | Card and product names |
| Body copy and form inputs | `--tbb-font-body` | `--tbb-font-weight-body` = 400 | Introductory and product copy |
| CTA buttons and functional controls | `--tbb-font-button` | `--tbb-font-weight-button` = 600 | Home Request samples / Explore the shop |
| Medium body emphasis | `--tbb-font-body` | `--tbb-font-weight-medium` = 500 | Supporting copy |

All three family roles resolve to the same Exo 2 stack. Existing `--tbb-font-sans`
and `--tbb-font-display` aliases remain for compatibility. Prices, statistics and
functional metadata can keep their existing emphasis; they do not become large
display headings just because their element is a label.

## Applying the roles

The owner's final instruction on 15 October 2026 applies to every page:
main and section headings use Exo 2 Black (900), uppercase; subheadings, card
names and FAQ questions use ExtraBold (800). Buttons use SemiBold (600),
uppercase with 0.1em tracking. Body copy uses Regular (400) or Medium (500).
Numerical display statistics retain their display role. Card names keep their
reference casing.

- Use the named family and weight tokens in the owning CSS module. Do not add
  Roboto, Jost, Montserrat, Georgia or a system font as a page-specific substitute.
- Preserve the component's responsive sizes, line height,
  content hierarchy and heading tags unless a design change explicitly requests
  different values. The font contract does not flatten all text to one size.
- Native controls inherit the shared family; a CTA or interactive text control
  declares the button role. Form inputs remain body text. Legal text links remain
  text links rather than being promoted to CTA headings.
- The Home hero's primary button reference is 14px, weight 600, uppercase and
  0.1em tracking. Existing compact controls retain their responsive size and
  touch target while sharing that family and weight.
- Brand wordmarks and packaging lettering are artwork, not UI font roles. Keep
  their SVG/image assets intact. Emoji flags and icon fonts retain their required
  glyph families. Do not override them with a universal `html body *` rule.
- Retained Tilda content uses `src/styles/legacy-typography.css`. Keep its font
  overrides scoped to legacy records and Tilda popups. Do not modify the source
  export or reintroduce a reset that changes native headings after navigation.

## Review before shipping

Check computed font family and weight on Home and the edited pages, including
headings, paragraph text, CTA buttons, inputs and accordion triggers at desktop
and mobile widths. Wait for `document.fonts.ready` before reading the results.
Check both a fresh visit and navigation from a retained Tilda route, because its
stylesheets load later. Verify no missing glyphs, clipped headings, horizontal
overflow or changed form behavior. A CSS family name alone does not prove the
self-hosted font loaded: inspect the actual rendered page.
