import assert from "node:assert/strict";
import test from "node:test";
import { consumePendingCheckout, rememberPendingCheckout } from "../src/lib/checkout-session";
import type { CartItem } from "../src/lib/cart-store";

const KEY = "thebase:checkout-pending:v1";
const SESSION = "cs_test_pendingShop123";
const basket: readonly CartItem[] = [
  { slug: "milkshake", flavor: "Banana", quantity: 2 },
  { slug: "iced-tea", flavor: "Peach", quantity: 1 },
];

test("paid and sample versions of one flavour cannot swap in a pending checkout", () => {
  withStorage(() => {
    const mixed = [{ ...basket[0], kind: "products" }, { ...basket[1], kind: "samples" }];
    rememberPendingCheckout(SESSION, "products", mixed);
    assert.equal(consumePendingCheckout(SESSION, "products", mixed.map(item => ({ ...item, kind: item.kind === "samples" ? "products" : "samples" }))), false);
    assert.equal(consumePendingCheckout(SESSION, "products", [...mixed].reverse()), true);
  });
});

class MemoryStorage {
  readonly values = new Map<string, string>();
  denied: "read" | "write" | "remove" | null = null;
  getItem(key: string) { if (this.denied === "read") throw new Error("Storage denied"); return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { if (this.denied === "write") throw new Error("Storage denied"); this.values.set(key, value); }
  removeItem(key: string) { if (this.denied === "remove") throw new Error("Storage denied"); this.values.delete(key); }
}

function withStorage(run: (storage: MemoryStorage) => void) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, "window", { value: { sessionStorage: storage }, configurable: true });
  try { run(storage); }
  finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
}

// Server payment verification is the caller's responsibility. These tests only
// exercise the browser marker that protects the basket after a verified return.
test("matching session, kind and basket consume the pending marker once", () => {
  withStorage((storage) => {
    rememberPendingCheckout(SESSION, "products", basket);
    assert.ok(storage.getItem(KEY));
    assert.equal(consumePendingCheckout(SESSION, "products", basket), true);
    assert.equal(storage.getItem(KEY), null);
    assert.equal(consumePendingCheckout(SESSION, "products", basket), false);
    assert.equal(basket[0].quantity, 2, "the marker helper must not mutate basket lines");
  });
});

test("another session or checkout kind cannot consume a matching basket's marker", () => {
  withStorage((storage) => {
    rememberPendingCheckout(SESSION, "products", basket);
    const original = storage.getItem(KEY);
    assert.equal(consumePendingCheckout("cs_test_someOtherSession", "products", basket), false);
    assert.equal(consumePendingCheckout(SESSION, "samples", basket), false);
    assert.equal(storage.getItem(KEY), original);
    assert.equal(consumePendingCheckout(SESSION, "products", basket), true);
  });
});

test("quantity, flavour, product and line additions or removals preserve a changed basket", () => {
  const changes: readonly (readonly CartItem[])[] = [
    [{ ...basket[0], quantity: 3 }, basket[1]],
    [{ ...basket[0], flavor: "Mango" }, basket[1]],
    [{ ...basket[0], slug: "frappe" }, basket[1]],
    [...basket, { slug: "matcha", flavor: "Classic", quantity: 1 }],
    [basket[0]],
  ];
  for (const changed of changes) withStorage((storage) => {
    rememberPendingCheckout(SESSION, "products", basket);
    const original = storage.getItem(KEY);
    assert.equal(consumePendingCheckout(SESSION, "products", changed), false);
    assert.equal(storage.getItem(KEY), original);
  });
});

test("reordering unchanged lines still identifies the same sample box", () => {
  withStorage((storage) => {
    const samples = basket.map((line) => ({ ...line, quantity: 1 }));
    rememberPendingCheckout(SESSION, "samples", samples);
    assert.equal(consumePendingCheckout(SESSION, "samples", [...samples].reverse()), true);
    assert.equal(storage.getItem(KEY), null);
  });
});

test("invalid or live session IDs cannot overwrite a pending Test Mode checkout", () => {
  withStorage((storage) => {
    rememberPendingCheckout(SESSION, "products", basket);
    const original = storage.getItem(KEY);
    for (const sessionId of ["", "cs_test_", "cs_live_other", "cs_test_has-dash", "https://example.com/cs_test_other"]) {
      rememberPendingCheckout(sessionId, "products", basket);
      assert.equal(storage.getItem(KEY), original);
    }
  });
});

test("missing, corrupt or denied browser storage never authorizes basket clearing", () => {
  withStorage((storage) => {
    assert.equal(consumePendingCheckout(SESSION, "products", basket), false);
    for (const raw of ["{broken", "null", "{}", '"wrong shape"']) {
      storage.values.set(KEY, raw);
      assert.equal(consumePendingCheckout(SESSION, "products", basket), false);
    }
    storage.values.clear();
    storage.denied = "write";
    assert.doesNotThrow(() => rememberPendingCheckout(SESSION, "products", basket));
    assert.equal(consumePendingCheckout(SESSION, "products", basket), false);
    storage.denied = null;
    rememberPendingCheckout(SESSION, "products", basket);
    storage.denied = "read";
    assert.equal(consumePendingCheckout(SESSION, "products", basket), false);
    assert.ok(storage.values.get(KEY));
  });
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  Reflect.deleteProperty(globalThis, "window");
  try {
    assert.doesNotThrow(() => rememberPendingCheckout(SESSION, "products", basket));
    assert.equal(consumePendingCheckout(SESSION, "products", basket), false);
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
  }
});

test("failed marker removal refuses consumption and preserves the pending basket identity", () => {
  withStorage((storage) => {
    rememberPendingCheckout(SESSION, "products", basket);
    const original = storage.getItem(KEY);
    storage.denied = "remove";
    assert.equal(consumePendingCheckout(SESSION, "products", basket), false);
    assert.equal(storage.values.get(KEY), original);
    storage.denied = null;
    assert.equal(consumePendingCheckout(SESSION, "products", basket), true);
  });
});
