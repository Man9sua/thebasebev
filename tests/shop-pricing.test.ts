import assert from "node:assert/strict";
import test from "node:test";
import { getShopQuote, getShopUnitAmount, SHOP_PAYMENT_PRICING, type ShopPaymentPricing } from "../src/lib/shop-payment";
import { combineShopBaskets } from "../src/lib/shop-basket";
import priceList from "../src/data/shop-prices.json";

const variant = (unitAmount: number) => ({ slug: "milkshake", flavor: "Vanilla", sku: "MS-001-f500", unitAmount, packGrams: 500, sampleWeightGrams: 50 });
const pricing = (unitAmount: number): ShopPaymentPricing => ({ ...SHOP_PAYMENT_PRICING, variants: [variant(unitAmount)] });
const paid = { slug: "milkshake", flavor: "Vanilla", quantity: 1, kind: "products" as const };
const sample = { ...paid, kind: "samples" as const };
const quote = (unitAmount: number, samples = 0) => getShopQuote({ kind: "products", country: "AE", shippingMethod: "standard", items: [paid, ...(samples ? [{ ...sample, quantity: samples }] : [])] }, pricing(unitAmount));

test("approved Excel prices preserve variant, pack size and two-decimal AED amounts", () => {
  assert.equal(priceList.records.length, 89);
  assert.equal(new Set(priceList.records.map(item => `${item.slug}::${item.flavor}`)).size, 89);
  assert.ok(priceList.records.every(item => Number.isSafeInteger(item.unitAmount) && item.unitAmount > 0));
  assert.equal(getShopUnitAmount("milkshake", undefined, "Vanilla"), 2800);
  assert.equal(getShopUnitAmount("milkshake", undefined, "Banana"), 2706);
  assert.equal(getShopUnitAmount("milkshake", undefined, "Strawberry"), 2835);
  assert.equal(getShopUnitAmount("at-home", undefined, "Milkshake Cookies & Cream"), 1315);
  assert.equal(getShopUnitAmount("milkshake", undefined, "Cookies & Cream"), 3733);
  assert.equal(getShopUnitAmount("raf-coffee", undefined, "Banana Ice Cream"), null);
  assert.equal(getShopUnitAmount("puree", undefined, "Mango"), null);
});

test("UAE free delivery starts at exactly AED 500 before VAT", () => {
  assert.deepEqual(quote(48_000), { ready: true, subtotal: 48_000, shipping: 3000, vat: 2550, total: 53_550, reason: null, currency: "aed" });
  assert.equal(quote(49_999).shipping, 3000);
  assert.equal(quote(50_000).shipping, 0);
  assert.equal(quote(50_000).total, 52_500);
  assert.equal(quote(50_001).shipping, 0);
});

test("goods and samples share one delivery; samples never qualify an order for free delivery", () => {
  assert.equal(quote(49_999, 3).subtotal, 49_999);
  assert.equal(quote(49_999, 3).shipping, 3000);
  assert.equal(quote(50_000, 3).shipping, 0);
  assert.equal(quote(50_000, 3).total, 52_500);
  assert.equal(quote(2800, 4).total, 6090);
});

test("sample-only flat delivery includes VAT and applies through 5 kg, not beyond", () => {
  const input = { kind: "samples" as const, country: "AE", shippingMethod: "standard" as const, items: [{ ...sample, quantity: 100 }] };
  assert.deepEqual(getShopQuote(input, pricing(2800)), { ready: true, subtotal: 0, shipping: 3000, vat: 150, total: 3150, reason: null, currency: "aed" });
  const tooHeavy = getShopQuote({ ...input, items: [{ ...sample, quantity: 101 }] }, pricing(2800));
  assert.equal(tooHeavy.ready, false);
  assert.equal(tooHeavy.shipping, null);
  assert.match(tooHeavy.reason!, /over 5 kg/);
  const unknownWeight = getShopQuote(input, { ...pricing(2800), variants: [{ ...variant(2800), sampleWeightGrams: null }] });
  assert.equal(unknownWeight.ready, false);
  assert.equal(unknownWeight.total, null);
});

test("VAT rounds per line plus delivery and never mutates a net price", () => {
  const input = { kind: "products" as const, country: "AE", shippingMethod: "standard" as const, items: [{ ...paid, quantity: 3 }] };
  const result = getShopQuote(input, pricing(2835));
  assert.equal(result.subtotal, 8505);
  assert.equal(result.vat, 575);
  assert.equal(result.total, 12_080);
});

test("unknown variants, non-UAE delivery and unapproved express fees stay on quotation", () => {
  assert.equal(getShopQuote({ kind: "products", country: "AE", shippingMethod: "standard", items: [{ ...paid, flavor: "Pecan" }] }).ready, false);
  assert.equal(getShopQuote({ kind: "products", country: "SA", shippingMethod: "standard", items: [paid] }).ready, false);
  assert.equal(getShopQuote({ kind: "products", country: "AE", shippingMethod: "express", items: [paid] }).ready, false);
});

test("combining baskets preserves identical product/sample flavours and country separation", () => {
  const saved = [{ slug: "milkshake", flavor: "Vanilla", quantity: 2 }];
  assert.deepEqual(combineShopBaskets("AE", saved, saved), [{ ...saved[0], kind: "products" }, { ...saved[0], kind: "samples" }]);
  assert.deepEqual(combineShopBaskets("SA", saved, saved), [{ ...saved[0], kind: "samples" }]);
  assert.equal(saved[0].quantity, 2);
});
