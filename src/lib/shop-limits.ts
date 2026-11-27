export const SHOP_MAX_LINES = 100;
export const SHOP_MAX_QUANTITY = 999_999;

export function isShopQuantity(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 1 && value <= SHOP_MAX_QUANTITY;
}
