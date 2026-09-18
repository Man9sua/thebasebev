/**
 * The attributes Tilda's popup runtime writes onto a link that opens a popup.
 *
 * `public/js/tilda-popup-1.0.min.js` runs
 * `t_popup__addAttributesForAccessibility(hook)` once per popup on the page. It
 * takes every `a[href="<hook>"]` in the whole document and sets `role="button"`
 * and `aria-haspopup="dialog"` on it — React's own links included, because the
 * popups they open are still the export's four lead forms and nothing has
 * replaced them yet.
 *
 * That pass runs at `DOMContentLoaded`, which is a different task from React's
 * hydration and can land before it. When it does, React finds two attributes on
 * nodes it owns that its own markup never wrote and reports the whole tree as
 * mismatched.
 *
 * Rendering the same two attributes server-side removes the difference instead
 * of the behaviour: the runtime still finds the links and still sets them, to
 * the values they already carry. It is also what the markup should have said in
 * the first place — these links do open a dialog, and before hydration they
 * announced themselves as ordinary in-page links.
 *
 * Scoping the runtime away from React's nodes is deliberately not the fix here:
 * `tilda-popup` is Tilda's own file, it is the thing that opens the popups these
 * links exist for, and live production depends on it. The export's own
 * hand-written image pass is a different case and is scoped instead — see
 * `scopeLegacyImagePasses` in `site-pages.ts`.
 */

/**
 * The popup hooks React links point at. `#sample` is the free-sample form,
 * `#form` the partner enquiry, `#flavor` the custom-flavour enquiry. Anything
 * else — an ordinary in-page anchor such as `#faq` — is left alone, because
 * Tilda leaves it alone too.
 */
const POPUP_HOOKS = new Set(["#sample", "#form", "#flavor", "#brand-flavor"]);

type PopupAnchorProps = {
  role?: "button";
  "aria-haspopup"?: "dialog";
};

export function popupAnchorProps(href: string): PopupAnchorProps {
  if (!POPUP_HOOKS.has(href)) return {};
  return { role: "button", "aria-haspopup": "dialog" };
}
