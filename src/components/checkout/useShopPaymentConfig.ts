"use client";

import { useEffect, useState } from "react";
import type { StripeMode } from "@/lib/stripe-mode";

export function useShopPaymentConfig() {
  const [config, setConfig] = useState<{ ready: boolean; mode: StripeMode | null; loaded: boolean }>({ ready: false, mode: null, loaded: false });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/checkout/stripe/config", { cache: "no-store", signal: controller.signal });
        const body = await response.json();
        if (!response.ok || body?.ok !== true) throw new Error("Payment configuration unavailable");
        const mode = body.payment?.mode;
        setConfig({ ready: body.payment?.ready === true && (mode === "test" || mode === "live"),
          mode: mode === "test" || mode === "live" ? mode : null, loaded: true });
      } catch {
        if (!controller.signal.aborted) setConfig({ ready: false, mode: null, loaded: true });
      }
    }
    void load();
    return () => controller.abort();
  }, []);
  return config;
}
