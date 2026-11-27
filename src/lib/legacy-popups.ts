const POPUP_HOOKS = new Set(["#sample", "#form", "#flavor", "#brand-flavor"]);

type PopupAnchorProps = {
  role?: "button";
  "aria-haspopup"?: "dialog";
};

export function popupAnchorProps(href: string): PopupAnchorProps {
  if (!POPUP_HOOKS.has(href)) return {};
  return { role: "button", "aria-haspopup": "dialog" };
}
