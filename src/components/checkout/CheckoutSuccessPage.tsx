"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearCart } from "@/lib/cart-store";
import { shouldClearCartAfterVerification } from "@/lib/commerce/checkout-status";
import { BrandLogo } from "@/components/site/BrandLogo";
import styles from "./CheckoutSuccessPage.module.css";

type PublicOrderStatus = Readonly<{
  paymentConfirmed: boolean;
  paymentStatus: string;
  fulfillmentStatus: string;
  orderReference: string;
  amountTotal: number;
  currency: string;
  odooOrderReference?: string | null;
}>;

export function CheckoutSuccessPage({ sessionId }: { sessionId: string }) {
  const [order, setOrder] = useState<PublicOrderStatus | null>(null);
  const [error, setError] = useState("");
  const visibleError = sessionId ? error : "This checkout link is incomplete.";

  useEffect(() => {
    if (!sessionId) return;
    const controller = new AbortController();
    fetch(`/api/checkout/session/${encodeURIComponent(sessionId)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = (await response.json().catch(() => null)) as
          | { order?: PublicOrderStatus; error?: { message?: string } }
          | null;
        if (!response.ok || !body?.order) {
          throw new Error(body?.error?.message || "Order status is temporarily unavailable.");
        }
        setOrder(body.order);
        if (shouldClearCartAfterVerification(body.order)) clearCart();
      })
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "Order status is unavailable.");
      });
    return () => controller.abort();
  }, [sessionId]);

  return (
    <main className={styles.page}>
      <Link href="/" className={styles.logo} aria-label="THE BASE — home" prefetch={false}>
        <BrandLogo />
      </Link>
      <section className={styles.card} aria-live="polite">
        {!order && !visibleError && (
          <>
            <p className={styles.eyebrow}>Secure verification</p>
            <h1>Confirming your payment…</h1>
            <p>We are checking the paid Stripe session with the server.</p>
          </>
        )}
        {visibleError && (
          <>
            <p className={styles.eyebrow}>Order status</p>
            <h1>We could not verify this payment</h1>
            <p>{visibleError}</p>
            <Link className={styles.action} href="/checkout" prefetch={false}>
              Return to checkout
            </Link>
          </>
        )}
        {order && (
          <>
            <p className={styles.eyebrow}>Order status</p>
            <h1>{order.paymentConfirmed ? "Payment confirmed" : "Payment pending"}</h1>
            <dl className={styles.details}>
              <div><dt>Order</dt><dd>{order.orderReference}</dd></div>
              <div><dt>Amount</dt><dd>{(order.amountTotal / 100).toFixed(2)} {order.currency}</dd></div>
              <div><dt>Fulfillment</dt><dd>{order.fulfillmentStatus.replaceAll("_", " ")}</dd></div>
              {order.odooOrderReference && (
                <div><dt>Sales order</dt><dd>{order.odooOrderReference}</dd></div>
              )}
            </dl>
            <p>
              {order.fulfillmentStatus === "fulfilled"
                ? "Your order has been registered. Our team will continue with delivery coordination."
                : "Your payment is safely recorded. Order processing may take a moment; refreshing this page will only check status and will not create another order."}
            </p>
            <Link className={styles.action} href="/catalog" prefetch={false}>
              Continue shopping
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
