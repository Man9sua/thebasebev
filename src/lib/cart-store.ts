import { getShopProduct, SHOP_MAX_QUANTITY, SHOP_MAX_LINES, SHOP_SAMPLE_LIMIT } from "@/data/shop";

export type CartItem = Readonly<{ slug: string; flavor: string; quantity: number }>;
export type CartState = Readonly<{ ready: boolean; items: readonly CartItem[] }>;
const SERVER_STATE: CartState = Object.freeze({ ready: false, items: Object.freeze([]) });

export function cartLineKey(slug: string, flavor: string): string { return `${slug}::${flavor}`; }
function sameLine(item: CartItem, slug: string, flavor: string) { return item.slug === slug && item.flavor === flavor; }

/** Independent product baskets and six-flavour sample boxes share persistence rules. */
function createCartStore(storageKey: string, samples: boolean) {
  let state = SERVER_STATE;
  let hydrated = false;
  const listeners = new Set<() => void>();

  function normalize(value: unknown): CartItem[] {
    if (!Array.isArray(value)) return [];
    const byLine = new Map<string, CartItem>();
    for (const entry of value) {
      if (!entry || typeof entry !== "object" || typeof entry.slug !== "string" ||
        typeof entry.flavor !== "string" || !Number.isInteger(entry.quantity) || entry.quantity < 1 ||
        !getShopProduct(entry.slug)?.flavors.includes(entry.flavor)) continue;
      const key = cartLineKey(entry.slug, entry.flavor);
      if (!byLine.has(key) && byLine.size >= (samples ? SHOP_SAMPLE_LIMIT : SHOP_MAX_LINES)) continue;
      byLine.set(key, { slug: entry.slug, flavor: entry.flavor,
        quantity: samples ? 1 : Math.min((byLine.get(key)?.quantity ?? 0) + entry.quantity, SHOP_MAX_QUANTITY) });
    }
    return [...byLine.values()];
  }

  function read(): CartItem[] {
    try {
      const stored = window.localStorage.getItem(storageKey);
      return stored ? normalize(JSON.parse(stored)) : [];
    } catch { return []; }
  }
  function emit(items: readonly CartItem[]) {
    state = { ready: true, items };
    listeners.forEach((listener) => listener());
  }
  function hydrate() {
    if (typeof window === "undefined" || hydrated) return;
    hydrated = true;
    emit(read());
    window.addEventListener("storage", (event) => { if (event.key === storageKey || event.key === null) emit(read()); });
  }
  function persist(items: readonly CartItem[]) {
    hydrate();
    try { window.localStorage.setItem(storageKey, JSON.stringify(items)); }
    catch { /* Private browsing can deny storage; this document's basket still works. */ }
    emit(items);
  }
  function add(slug: string, flavor: string, quantity = 1): boolean {
    if (!getShopProduct(slug)?.flavors.includes(flavor) || !Number.isInteger(quantity) || quantity < 1) return false;
    hydrate();
    const existing = state.items.find((item) => sameLine(item, slug, flavor));
    if (!existing && state.items.length >= (samples ? SHOP_SAMPLE_LIMIT : SHOP_MAX_LINES)) return false;
    persist(existing ? state.items.map((item) => sameLine(item, slug, flavor)
      ? { ...item, quantity: samples ? 1 : Math.min(item.quantity + quantity, SHOP_MAX_QUANTITY) } : item)
      : [...state.items, { slug, flavor, quantity: samples ? 1 : Math.min(quantity, SHOP_MAX_QUANTITY) }]);
    return true;
  }
  function remove(slug: string, flavor: string) {
    hydrate();
    persist(state.items.filter((item) => !sameLine(item, slug, flavor)));
  }
  function setQuantity(slug: string, flavor: string, quantity: number) {
    hydrate();
    if (!Number.isInteger(quantity) || quantity <= 0) return remove(slug, flavor);
    persist(state.items.map((item) => sameLine(item, slug, flavor)
      ? { ...item, quantity: samples ? 1 : Math.min(quantity, SHOP_MAX_QUANTITY) } : item));
  }
  function removeSubmitted(items: readonly CartItem[]) {
    hydrate();
    const sent = new Set(items.map((item) => cartLineKey(item.slug, item.flavor)));
    persist(state.items.filter((item) => !sent.has(cartLineKey(item.slug, item.flavor))));
  }
  return {
    subscribe(listener: () => void) {
      listeners.add(listener); hydrate();
      return () => { listeners.delete(listener); };
    },
    getSnapshot: () => state, add, remove, setQuantity, removeSubmitted,
    clear() { if (typeof window !== "undefined") persist([]); },
  };
}

// Keep existing paid baskets while samples use their own limit and storage.
const cart = createCartStore("thebase:cart:v2", false);
const sampleCart = createCartStore("thebase:sample-cart:v1", true);
export const subscribeCart = cart.subscribe;
export const getCartSnapshot = cart.getSnapshot;
export const getCartServerSnapshot = () => SERVER_STATE;
export const addCartItem = cart.add;
export const setCartItemQuantity = cart.setQuantity;
export const removeCartItem = cart.remove;
export const clearCart = cart.clear;
export const subscribeSampleCart = sampleCart.subscribe;
export const getSampleCartSnapshot = sampleCart.getSnapshot;
export const addSampleCartItem = sampleCart.add;
export const removeSampleCartItem = sampleCart.remove;
export const clearSampleCart = sampleCart.clear;
export const removeSubmittedSamples = sampleCart.removeSubmitted;
