"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckoutPage } from "./CheckoutPage";
import { useCart, useSampleCart } from "@/components/cart/useCart";
import { BrandLogo } from "@/components/site/BrandLogo";
import { SiteLink } from "@/components/site/SiteLink";
import { clearCart, clearSampleCart } from "@/lib/cart-store";
import { consumePendingCheckout } from "@/lib/checkout-session";
import { formatShopMoney, isShopCountry } from "@/lib/shop-payment";
import type { ShopKind } from "@/data/shop";
import { combineShopBaskets } from "@/lib/shop-basket";
import styles from "./CheckoutReturn.module.css";

type VerifiedPayment = {
  sessionId: string;
  status: string;
  paymentStatus: string;
  confirmed: boolean;
  kind: ShopKind;
  country: string;
  total: number | null;
  testMode: boolean;
};

function PaymentReturn({ sessionId, requestedCountry }: { sessionId: string; requestedCountry: string }) {
  const cart = useCart();
  const sampleCart = useSampleCart();
  const [payment, setPayment] = useState<VerifiedPayment | null>(null);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const confirmed = payment?.confirmed === true && payment.status === "complete" && payment.paymentStatus === "paid";
  const country = payment && isShopCountry(payment.country) ? payment.country : requestedCountry;

  useEffect(() => {
    const controller = new AbortController();
    async function verify() {
      try {
        if (!/^cs_test_[A-Za-z0-9_]{1,200}$/.test(sessionId)) throw new Error("The payment reference is invalid.");
        const response = await fetch(`/api/checkout/stripe/session?session_id=${encodeURIComponent(sessionId)}`, {
          cache: "no-store", signal: controller.signal,
        });
        const body = await response.json().catch(() => null);
        if (!response.ok || body?.ok !== true || body.checkout?.sessionId !== sessionId || body.checkout?.testMode !== true) {
          throw new Error("We could not verify this payment. Please contact the team with your payment reference.");
        }
        setPayment(body.checkout as VerifiedPayment);
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "We could not verify this payment.");
      } finally {
        if (!controller.signal.aborted) setChecked(true);
      }
    }
    void verify();
    return () => controller.abort();
  }, [sessionId]);

  useEffect(() => {
    if (!confirmed || !payment || !cart.ready || !sampleCart.ready) return;
    const items = combineShopBaskets(payment.kind === "samples" ? "international" : payment.country, cart.items, sampleCart.items);
    if (consumePendingCheckout(sessionId, payment.kind, items)) {
      if (payment.kind === "products") clearCart();
      clearSampleCart();
    }
  }, [confirmed, payment, sessionId, cart, sampleCart]);

  return <div className={`tbb ${styles.page}`}>
    <header className={styles.header}><SiteLink href={`/${country.toLowerCase()}/catalog`} aria-label="The Base shop"><BrandLogo /></SiteLink></header>
    <main className={styles.content} aria-live="polite">
      <p className={styles.label}>Secure checkout · Test mode</p>
      <h1>{!checked ? "Checking payment" : confirmed ? "Payment received" : "Payment not confirmed"}</h1>
      <p>{!checked ? "Checking the payment status with Stripe…" : confirmed
        ? "Your test payment is confirmed. Our team will review the order and delivery details before dispatch."
        : error || "Your payment has not completed. The items remain in your basket."}</p>
      {confirmed && typeof payment?.total === "number" && <strong className={styles.amount}>{formatShopMoney(payment.total)}</strong>}
      <div className={styles.actions}>
        <SiteLink href={`/${country.toLowerCase()}/catalog`}>Back to shop</SiteLink>
        <SiteLink href={`/${country.toLowerCase()}/contacts`}>Contact the team</SiteLink>
      </div>
    </main>
  </div>;
}

export function CheckoutFlow() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const requestedCountry = (params.get("country") ?? "AE").toUpperCase();
  return sessionId ? <PaymentReturn key={sessionId} sessionId={sessionId} requestedCountry={isShopCountry(requestedCountry) ? requestedCountry : "AE"} /> : <CheckoutPage />;
}
