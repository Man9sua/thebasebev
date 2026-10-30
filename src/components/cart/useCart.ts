"use client";

import { useSyncExternalStore } from "react";
import {
  getCartServerSnapshot,
  getCartSnapshot,
  subscribeCart,
  getSampleCartSnapshot,
  subscribeSampleCart,
} from "@/lib/cart-store";

export function useCart() {
  return useSyncExternalStore(subscribeCart, getCartSnapshot, getCartServerSnapshot);
}

export function useSampleCart() {
  return useSyncExternalStore(subscribeSampleCart, getSampleCartSnapshot, getCartServerSnapshot);
}
