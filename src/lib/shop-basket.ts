import type { ShopKind } from "@/data/shop";
import { cartLineKey, type CartItem } from "./cart-store";

export type ShopBasketItem = CartItem & { kind: ShopKind };

/** UAE goods and free samples share one shipment; international shops offer samples. */
export function combineShopBaskets(country: string, products: readonly CartItem[], samples: readonly CartItem[]): ShopBasketItem[] {
  return [
    ...(country === "AE" ? products.map(item => ({ ...item, kind: "products" as const })) : []),
    ...samples.map(item => ({ ...item, kind: "samples" as const })),
  ];
}

export function shopBasketKey(item: ShopBasketItem) {
  return `${item.kind}:${cartLineKey(item.slug, item.flavor)}`;
}
