import assert from "node:assert/strict";
import test from "node:test";
import { SHOP_PRODUCTS } from "../src/data/shop";
import { MAX_MESSAGE_LENGTH } from "../src/lib/leads";
import { toTildaLeadPayload } from "../src/lib/lead-forms";
import { submitShopSampleRequest } from "../src/lib/shop-lead";

const choices = SHOP_PRODUCTS.flatMap(product => product.flavors.map(flavor => ({ slug: product.slug, flavor, quantity: 1 })));
const customer = { name: "Shop QA", email: "qa@example.com", phone: "+971500000000", company: "QA cafe", city: "Riyadh", street: "QA street" };

async function withBrowser(run: (capture: unknown[]) => Promise<void>, status = 200) {
  const saved = new Map(["window", "document", "fetch"].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const storage = new Map<string, string>();
  const capture: unknown[] = [];
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location: { href: "https://the-base-staging.mansua.workers.dev/checkout?country=SA&kind=samples&utm_source=chatgpt.com" },
    sessionStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) },
  } });
  Object.defineProperty(globalThis, "document", { configurable: true, value: { referrer: "https://chatgpt.com/" } });
  Object.defineProperty(globalThis, "fetch", { configurable: true, value: async (url: string, init: RequestInit) => {
    assert.equal(url, "/api/leads");
    capture.push(JSON.parse(String(init.body)));
    return Response.json({ ok: status === 200 }, { status });
  } });
  try { await run(capture); }
  finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
}

test("sample requests preserve more than six flavours and all quantities through the lead mapper", async () => {
  await withBrowser(async capture => {
    const items = choices.slice(0, 8).map((item, index) => ({ ...item, quantity: index + 2 }));
    assert.deepEqual(await submitShopSampleRequest({ country: "SA", items, customer, consent: true }), { ok: true });
    assert.equal(capture.length, 1);
    const payload = capture[0] as Parameters<typeof toTildaLeadPayload>[0] & { order: { items: { quantity: number }[] }; utm_source: string };
    assert.deepEqual(payload.order.items.map(item => item.quantity), items.map(item => item.quantity));
    assert.equal(payload.utm_source, "chatgpt.com");
    const upstream = toTildaLeadPayload(payload);
    assert.deepEqual(JSON.parse(upstream.order_json).items.map((item: { quantity: number }) => item.quantity), items.map(item => item.quantity));
  });
});

test("large sample selections fit lead text limits without dropping structured order lines", async () => {
  await withBrowser(async capture => {
    const items = [...choices].sort((a, b) => b.flavor.length - a.flavor.length).slice(0, 100).map(item => ({ ...item, quantity: 123456 }));
    const result = await submitShopSampleRequest({ country: "SA", items, customer: { ...customer, notes: "N".repeat(500), street: "S".repeat(240), city: "C".repeat(120), unit: "U".repeat(120), website: "W".repeat(240) }, consent: true });
    assert.equal(result.ok, true);
    const payload = capture[0] as { message: string; order: { items: { quantity: number }[] } };
    assert.ok(payload.message.length <= MAX_MESSAGE_LENGTH);
    assert.equal(payload.order.items.length, 100);
    assert.ok(payload.order.items.every(item => item.quantity === 123456));
  });
});

test("invalid sample quantities never submit and delivery failures remain failures", async () => {
  await withBrowser(async capture => {
    const result = await submitShopSampleRequest({ country: "SA", items: [{ ...choices[0], quantity: 0 }], customer, consent: true });
    assert.equal(result.ok, false);
    assert.equal(capture.length, 0);
  });
  await withBrowser(async capture => {
    const result = await submitShopSampleRequest({ country: "SA", items: [{ ...choices[0], quantity: 3 }], customer, consent: true });
    assert.equal(result.ok, false);
    assert.equal(capture.length, 1);
  }, 503);
});
