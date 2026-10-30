import type { CartItem } from "./cart-store";
import type { ShopKind } from "@/data/shop";

const KEY = "thebase:checkout-pending:v1";

function signature(items: readonly CartItem[]) {
  return JSON.stringify(items.map(({ slug, flavor, quantity }) => [slug, flavor, quantity])
    .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))));
}

/** A verified return may clear only the unchanged basket sent to that session. */
export function rememberPendingCheckout(sessionId: string, kind: ShopKind, items: readonly CartItem[]) {
  if (!/^cs_test_[A-Za-z0-9_]+$/.test(sessionId)) return;
  try { window.sessionStorage.setItem(KEY, JSON.stringify({ sessionId, kind, items: signature(items) })); }
  catch { /* Payment can proceed without browser storage; the return keeps the basket. */ }
}

export function consumePendingCheckout(sessionId: string, kind: ShopKind, items: readonly CartItem[]): boolean {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return false;
    const pending = JSON.parse(raw);
    if (pending?.sessionId !== sessionId || pending.kind !== kind || pending.items !== signature(items)) return false;
    window.sessionStorage.removeItem(KEY);
    return true;
  } catch { return false; }
}
