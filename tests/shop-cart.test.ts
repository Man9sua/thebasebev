import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as shop from "../src/data/shop";
import type { CartItem } from "../src/lib/cart-store";

const PAID_KEY = "thebase:cart:v2";
const SAMPLE_KEY = "thebase:sample-cart:v1";
const choices = shop.SHOP_PRODUCTS.flatMap((product) =>
  product.flavors.map((flavor) => ({ slug: product.slug, flavor, quantity: 1 })),
);
const products = shop.SHOP_PRODUCTS.map((product) => ({ slug: product.slug, flavor: product.flavors[0], quantity: 1 }));
const compiled = ts.transpileModule(fs.readFileSync(new URL("../src/lib/cart-store.ts", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  clear() { this.values.clear(); }
}

class Browser extends EventTarget {
  constructor(readonly localStorage = new MemoryStorage()) { super(); }
  changed(key: string | null) {
    const event = new Event("storage");
    Object.defineProperty(event, "key", { value: key });
    this.dispatchEvent(event);
  }
}

/** Load the real module with fresh browser storage for each visitor. */
function cartFor(browser?: Browser) {
  const moduleBox = { exports: {} as typeof import("../src/lib/cart-store") };
  vm.runInNewContext(compiled, {
    module: moduleBox,
    exports: moduleBox.exports,
    ...(browser ? { window: browser } : {}),
    require(id: string) {
      if (id === "@/data/shop") return shop;
      throw new Error(`Unexpected cart dependency: ${id}`);
    },
  });
  return moduleBox.exports;
}

function items(snapshot: { items: readonly CartItem[] }): CartItem[] {
  return JSON.parse(JSON.stringify(snapshot.items));
}

test("SSR exposes a stable empty snapshot and does not access browser storage", () => {
  const cart = cartFor();
  const server = cart.getCartServerSnapshot();
  assert.equal(server.ready, false);
  assert.deepEqual(items(server), []);
  assert.strictEqual(cart.getCartServerSnapshot(), server);
  cart.subscribeCart(() => assert.fail("SSR must not emit a browser hydration"));
  cart.subscribeSampleCart(() => assert.fail("SSR must not hydrate samples"));
  cart.clearCart();
  cart.clearSampleCart();
  assert.strictEqual(cart.getCartSnapshot(), server);
  assert.strictEqual(cart.getSampleCartSnapshot(), server);
});

test("paid flavours and sample choices persist independently and survive a reload", () => {
  const browser = new Browser();
  const cart = cartFor(browser);
  const first = choices[0], second = choices[1], sample = products[1];
  assert.equal(cart.addCartItem(first.slug, first.flavor, 2), true);
  assert.equal(cart.addCartItem(second.slug, second.flavor, 3), true);
  assert.equal(cart.addSampleCartItem(sample.slug, sample.flavor), true);

  const reloaded = cartFor(new Browser(browser.localStorage));
  reloaded.subscribeCart(() => {});
  reloaded.subscribeSampleCart(() => {});
  assert.deepEqual(items(reloaded.getCartSnapshot()), [{ ...first, quantity: 2 }, { ...second, quantity: 3 }]);
  assert.deepEqual(items(reloaded.getSampleCartSnapshot()), [sample]);
  reloaded.setCartItemQuantity(first.slug, first.flavor, 1);
  assert.equal(reloaded.getCartSnapshot().items[1].quantity, 3, "editing one flavour must preserve the other");
  reloaded.clearCart();
  assert.deepEqual(items(reloaded.getSampleCartSnapshot()), [sample]);
  assert.deepEqual(JSON.parse(browser.localStorage.getItem(PAID_KEY)!), []);
  assert.deepEqual(JSON.parse(browser.localStorage.getItem(SAMPLE_KEY)!), [sample]);
  reloaded.clearSampleCart();
  assert.deepEqual(items(reloaded.getSampleCartSnapshot()), []);
});

test("only published product/flavour pairs and positive integer quantities can be added", () => {
  const cart = cartFor(new Browser());
  const valid = choices[0];
  for (const [slug, flavor] of [["not-a-product", valid.flavor], [valid.slug, "Unpublished flavour"], [valid.slug, ""], [valid.slug, valid.flavor.toUpperCase()]]) {
    assert.equal(cart.addCartItem(slug, flavor), false);
    assert.equal(cart.addSampleCartItem(slug, flavor), false);
  }
  for (const quantity of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(cart.addCartItem(valid.slug, valid.flavor, quantity), false);
    assert.equal(cart.addSampleCartItem(valid.slug, valid.flavor, quantity), false);
  }
  const atHome = products.find(({ slug }) => slug === "at-home")!;
  assert.equal(cart.addCartItem(atHome.slug, atHome.flavor), true, "new shop ranges must not be limited to the old thirteen checkout IDs");
  assert.deepEqual(items(cart.getCartSnapshot()), [atHome]);
  assert.deepEqual(items(cart.getSampleCartSnapshot()), []);
});

test("corrupt storage is ignored while valid stored lines retain their flavour and quantity limits", () => {
  for (const raw of ["{broken", "null", "{}", '"not an array"']) {
    const browser = new Browser();
    browser.localStorage.setItem(PAID_KEY, raw);
    const cart = cartFor(browser);
    cart.subscribeCart(() => {});
    assert.equal(cart.getCartSnapshot().ready, true);
    assert.deepEqual(items(cart.getCartSnapshot()), []);
  }
  const first = choices[0], second = choices[1];
  const browser = new Browser();
  browser.localStorage.setItem(PAID_KEY, JSON.stringify([
    { ...first, quantity: 2 }, { ...first, quantity: 100 }, second,
    null, { ...second, quantity: "3" }, { ...second, quantity: 1.5 },
    { ...second, flavor: "Unpublished flavour" }, { ...second, slug: "not-a-product" },
  ]));
  const cart = cartFor(browser);
  cart.subscribeCart(() => {});
  assert.deepEqual(items(cart.getCartSnapshot()), [{ ...first, quantity: 102 }, second]);
});

test("paid baskets retain quantities above ten and use only shared transport bounds", () => {
  const browser = new Browser();
  const cart = cartFor(browser);
  assert.ok(choices.length > shop.SHOP_MAX_LINES);
  for (const line of choices.slice(0, shop.SHOP_MAX_LINES)) assert.equal(cart.addCartItem(line.slug, line.flavor, 100), true);
  assert.equal(cart.getCartSnapshot().items.length, shop.SHOP_MAX_LINES);
  assert.ok(cart.getCartSnapshot().items.every(({ quantity }) => quantity === 100));
  const extra = choices[shop.SHOP_MAX_LINES], first = choices[0];
  assert.equal(cart.addCartItem(extra.slug, extra.flavor), false);
  cart.setCartItemQuantity(first.slug, first.flavor, 3);
  assert.equal(cart.addCartItem(first.slug, first.flavor, shop.SHOP_MAX_QUANTITY), true, "a full basket may still edit an existing flavour");
  assert.equal(cart.getCartSnapshot().items[0].quantity, shop.SHOP_MAX_QUANTITY);
  cart.removeCartItem(first.slug, first.flavor);
  assert.equal(cart.addCartItem(extra.slug, extra.flavor), true);
  assert.equal(cart.getCartSnapshot().items.length, shop.SHOP_MAX_LINES);
  cart.setCartItemQuantity(extra.slug, extra.flavor, 0);
  assert.equal(cart.getCartSnapshot().items.length, shop.SHOP_MAX_LINES - 1);

  browser.localStorage.setItem(PAID_KEY, JSON.stringify(choices.slice(0, shop.SHOP_MAX_LINES + 1).map((line) => ({ ...line, quantity: 30 }))));
  const reloaded = cartFor(new Browser(browser.localStorage));
  reloaded.subscribeCart(() => {});
  assert.equal(reloaded.getCartSnapshot().items.length, shop.SHOP_MAX_LINES, "restored baskets obey the same transport bound");
  assert.ok(reloaded.getCartSnapshot().items.every(({ quantity }) => quantity === 30));
});

test("samples support more than six flavours, editable quantities and restoration without truncation", () => {
  const browser = new Browser();
  const cart = cartFor(browser);
  for (const line of products.slice(0, 8)) assert.equal(cart.addSampleCartItem(line.slug, line.flavor, 3), true);
  const first = products[0];
  cart.setSampleCartItemQuantity(first.slug, first.flavor, 12);
  assert.equal(cart.getSampleCartSnapshot().items.length, 8);
  assert.equal(cart.getSampleCartSnapshot().items[0].quantity, 12);
  const restored = cartFor(new Browser(browser.localStorage));
  restored.subscribeSampleCart(() => {});
  assert.deepEqual(items(restored.getSampleCartSnapshot()), items(cart.getSampleCartSnapshot()));
  cart.setSampleCartItemQuantity(first.slug, first.flavor, 0);
  assert.equal(cart.getSampleCartSnapshot().items.length, 7);
  assert.equal(cart.addSampleCartItem(first.slug, first.flavor, 2), true);
  assert.equal(cart.getSampleCartSnapshot().items.length, 8);

  browser.localStorage.setItem(SAMPLE_KEY, JSON.stringify(choices.slice(0, 10).map((line) => ({ ...line, quantity: 30 }))));
  const reloaded = cartFor(new Browser(browser.localStorage));
  reloaded.subscribeSampleCart(() => {});
  assert.equal(reloaded.getSampleCartSnapshot().items.length, 10);
  assert.ok(reloaded.getSampleCartSnapshot().items.every(({ quantity }) => quantity === 30));
});

test("a completed sample request subtracts only the submitted quantity", () => {
  const cart = cartFor(new Browser());
  const first = products[0];
  cart.addSampleCartItem(first.slug, first.flavor, 3);
  const submitted = cart.getSampleCartSnapshot().items;
  cart.addSampleCartItem(first.slug, first.flavor, 2);
  cart.removeSubmittedSamples(submitted);
  assert.deepEqual(items(cart.getSampleCartSnapshot()), [{ ...first, quantity: 2 }]);
});

test("a completed sample request preserves choices added while delivery was pending", () => {
  const cart = cartFor(new Browser());
  const [first, second, addedLater] = products;
  cart.addSampleCartItem(first.slug, first.flavor);
  cart.addSampleCartItem(second.slug, second.flavor);
  const submitted = cart.getSampleCartSnapshot().items;

  cart.addSampleCartItem(addedLater.slug, addedLater.flavor);
  cart.removeSubmittedSamples(submitted);
  assert.deepEqual(items(cart.getSampleCartSnapshot()), [addedLater]);
});

test("cross-tab storage changes update the correct basket, including a full storage clear", () => {
  const browser = new Browser();
  const cart = cartFor(browser);
  let paidUpdates = 0;
  const stop = cart.subscribeCart(() => paidUpdates++);
  cart.subscribeSampleCart(() => {});
  const paid = { ...choices[0], quantity: 2 }, sample = products[1];
  browser.localStorage.setItem(PAID_KEY, JSON.stringify([paid]));
  browser.changed(PAID_KEY);
  assert.deepEqual(items(cart.getCartSnapshot()), [paid]);
  assert.deepEqual(items(cart.getSampleCartSnapshot()), []);
  browser.localStorage.setItem(SAMPLE_KEY, JSON.stringify([sample]));
  browser.changed(SAMPLE_KEY);
  assert.deepEqual(items(cart.getSampleCartSnapshot()), [sample]);
  assert.deepEqual(items(cart.getCartSnapshot()), [paid]);
  stop();
  const before = paidUpdates;
  browser.localStorage.clear();
  browser.changed(null);
  assert.deepEqual(items(cart.getCartSnapshot()), []);
  assert.deepEqual(items(cart.getSampleCartSnapshot()), []);
  assert.equal(paidUpdates, before, "an unsubscribed component must not receive cross-tab updates");
});

test("denied localStorage keeps both baskets usable for the current document", () => {
  const browser = new Browser();
  Object.defineProperty(browser, "localStorage", { get() { throw new Error("Storage denied"); } });
  const cart = cartFor(browser);
  cart.subscribeCart(() => {});
  cart.subscribeSampleCart(() => {});
  const paid = choices[0], sample = products[1];
  assert.equal(cart.addCartItem(paid.slug, paid.flavor), true);
  assert.equal(cart.addSampleCartItem(sample.slug, sample.flavor), true);
  assert.deepEqual(items(cart.getCartSnapshot()), [paid]);
  assert.deepEqual(items(cart.getSampleCartSnapshot()), [sample]);
  cart.clearCart();
  cart.clearSampleCart();
  assert.deepEqual(items(cart.getCartSnapshot()), []);
  assert.deepEqual(items(cart.getSampleCartSnapshot()), []);
});
