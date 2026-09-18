import { getCheckoutProductId } from "@/data/catalog";

/**
 * A line is a product **and a flavour**, not a product.
 *
 * Every product THE BASE sells comes in flavours — fourteen for Milkshake,
 * nineteen for Cordial — and an order that names only the product is an order
 * the factory cannot fill. So the flavour is part of a line's identity: two
 * flavours of one product are two lines, and stepping one does not touch the
 * other.
 */
export type CartItem = Readonly<{
  slug: string;
  flavor: string;
  quantity: number;
}>;
export type CartState = Readonly<{
  ready: boolean;
  items: readonly CartItem[];
}>;

/**
 * v2 because a v1 line has no flavour and there is no way to guess which one
 * the visitor had meant. Choosing for them would put a flavour in the cart that
 * nobody picked, so a cart saved before this is left behind rather than
 * migrated; the reader simply starts empty.
 */
const STORAGE_KEY = "thebase:cart:v2";
const MAX_QUANTITY = 10;
/** Long enough for "Base No Added Sugar" and every other name on the pages. */
const MAX_FLAVOR_LENGTH = 48;
const SERVER_STATE: CartState = Object.freeze({ ready: false, items: Object.freeze([]) });

let state = SERVER_STATE;
let hydrated = false;
let storageListenerInstalled = false;
const listeners = new Set<() => void>();

/**
 * A line's identity, for keying React lists and for looking one up.
 *
 * The separator is a pair neither half can contain — slugs are kebab-case and
 * flavour names are words — so "Mango" on `iced-tea` cannot collide with some
 * other pair that happens to concatenate the same way.
 */
export function cartLineKey(slug: string, flavor: string): string {
  return `${slug}::${flavor}`;
}

function sameLine(item: CartItem, slug: string, flavor: string): boolean {
  return item.slug === slug && item.flavor === flavor;
}

function validItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  const byLine = new Map<string, CartItem>();
  for (const item of value) {
    if (
      typeof item !== "object" ||
      item === null ||
      !("slug" in item) ||
      !("flavor" in item) ||
      !("quantity" in item) ||
      typeof item.slug !== "string" ||
      typeof item.flavor !== "string" ||
      typeof item.quantity !== "number" ||
      !Number.isInteger(item.quantity) ||
      item.flavor.length === 0 ||
      item.flavor.length > MAX_FLAVOR_LENGTH ||
      !getCheckoutProductId(item.slug)
    ) {
      continue;
    }

    const key = cartLineKey(item.slug, item.flavor);
    const quantity = Math.min(Math.max(item.quantity, 1), MAX_QUANTITY);
    const existing = byLine.get(key);
    byLine.set(key, {
      slug: item.slug,
      flavor: item.flavor,
      quantity: Math.min((existing?.quantity ?? 0) + quantity, MAX_QUANTITY),
    });
  }

  return Array.from(byLine.values());
}

function readStoredItems(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? validItems(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

function emit(nextItems: readonly CartItem[]) {
  state = { ready: true, items: nextItems };
  listeners.forEach((listener) => listener());
}

function hydrate() {
  if (typeof window === "undefined" || hydrated) return;
  hydrated = true;
  emit(readStoredItems());

  if (!storageListenerInstalled) {
    storageListenerInstalled = true;
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) emit(readStoredItems());
    });
  }
}

function persist(items: readonly CartItem[]) {
  hydrate();
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage can be unavailable in hardened/private contexts. Keep the cart
    // usable for the current document instead of turning an Add button into an
    // uncaught exception; a reload simply returns to an empty cart.
  }
  emit(items);
}

export function subscribeCart(listener: () => void) {
  listeners.add(listener);
  hydrate();
  return () => listeners.delete(listener);
}

export function getCartSnapshot() {
  return state;
}

export function getCartServerSnapshot() {
  return SERVER_STATE;
}

/** Adds `quantity` of one flavour, up to the per-line ceiling. */
export function addCartItem(slug: string, flavor: string, quantity = 1) {
  if (!getCheckoutProductId(slug)) return;
  if (flavor.length === 0 || flavor.length > MAX_FLAVOR_LENGTH) return;
  if (!Number.isInteger(quantity) || quantity < 1) return;

  hydrate();
  const existing = state.items.find((item) => sameLine(item, slug, flavor));
  const items = existing
    ? state.items.map((item) =>
        sameLine(item, slug, flavor)
          ? { ...item, quantity: Math.min(item.quantity + quantity, MAX_QUANTITY) }
          : item,
      )
    : [...state.items, { slug, flavor, quantity: Math.min(quantity, MAX_QUANTITY) }];
  persist(items);
}

export function setCartItemQuantity(slug: string, flavor: string, quantity: number) {
  hydrate();
  if (!Number.isInteger(quantity) || quantity <= 0) {
    removeCartItem(slug, flavor);
    return;
  }
  persist(
    state.items.map((item) =>
      sameLine(item, slug, flavor)
        ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }
        : item,
    ),
  );
}

export function removeCartItem(slug: string, flavor: string) {
  hydrate();
  persist(state.items.filter((item) => !sameLine(item, slug, flavor)));
}

export function clearCart() {
  if (typeof window === "undefined") return;
  persist([]);
}
