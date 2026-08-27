import { getCheckoutProductId } from "@/data/catalog";

export type CartItem = Readonly<{ slug: string; quantity: number }>;
export type CartState = Readonly<{
  ready: boolean;
  items: readonly CartItem[];
}>;

const STORAGE_KEY = "thebase:cart:v1";
const MAX_QUANTITY = 10;
const SERVER_STATE: CartState = Object.freeze({ ready: false, items: Object.freeze([]) });

let state = SERVER_STATE;
let hydrated = false;
let storageListenerInstalled = false;
const listeners = new Set<() => void>();

function validItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  const bySlug = new Map<string, number>();
  for (const item of value) {
    if (
      typeof item !== "object" ||
      item === null ||
      !("slug" in item) ||
      !("quantity" in item) ||
      typeof item.slug !== "string" ||
      typeof item.quantity !== "number" ||
      !Number.isInteger(item.quantity) ||
      !getCheckoutProductId(item.slug)
    ) {
      continue;
    }

    const quantity = Math.min(Math.max(item.quantity, 1), MAX_QUANTITY);
    bySlug.set(item.slug, Math.min((bySlug.get(item.slug) ?? 0) + quantity, MAX_QUANTITY));
  }

  return Array.from(bySlug, ([slug, quantity]) => ({ slug, quantity }));
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

export function addCartItem(slug: string) {
  if (!getCheckoutProductId(slug)) return;
  hydrate();
  const existing = state.items.find((item) => item.slug === slug);
  const items = existing
    ? state.items.map((item) =>
        item.slug === slug
          ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
          : item,
      )
    : [...state.items, { slug, quantity: 1 }];
  persist(items);
}

export function setCartItemQuantity(slug: string, quantity: number) {
  hydrate();
  if (!Number.isInteger(quantity) || quantity <= 0) {
    removeCartItem(slug);
    return;
  }
  persist(
    state.items.map((item) =>
      item.slug === slug ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) } : item,
    ),
  );
}

export function removeCartItem(slug: string) {
  hydrate();
  persist(state.items.filter((item) => item.slug !== slug));
}

export function clearCart() {
  if (typeof window === "undefined") return;
  persist([]);
}
