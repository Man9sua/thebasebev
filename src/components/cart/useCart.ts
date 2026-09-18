"use client";

import { useSyncExternalStore } from "react";
import {
  getCartServerSnapshot,
  getCartSnapshot,
  subscribeCart,
} from "@/lib/cart-store";

export function useCart() {
  return useSyncExternalStore(subscribeCart, getCartSnapshot, getCartServerSnapshot);
}
