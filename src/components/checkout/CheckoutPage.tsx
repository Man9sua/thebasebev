"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart/useCart";
import { BrandLogo } from "@/components/site/BrandLogo";
import { SiteLink } from "@/components/site/SiteLink";
import { CATALOG_PRODUCTS, getCheckoutProductId } from "@/data/catalog";
import catalogTiles from "@/data/catalog-tiles.json";
import { removeCartItem, setCartItemQuantity } from "@/lib/cart-store";
import styles from "./CheckoutPage.module.css";

const tiles = catalogTiles as Record<string, { image: string }>;
const priceFormatter = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  currencyDisplay: "code",
});

function priceNumber(price: string | null) {
  return price ? Number.parseFloat(price.replace(/[^\d.]/g, "")) : 0;
}

export function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const lines = useMemo(
    () =>
      cart.items.flatMap((item) => {
        const product = CATALOG_PRODUCTS.find((candidate) => candidate.slug === item.slug);
        const productId = getCheckoutProductId(item.slug);
        return product && productId ? [{ ...item, product, productId }] : [];
      }),
    [cart.items],
  );
  const total = lines.reduce(
    (sum, line) => sum + priceNumber(line.product.price) * line.quantity,
    0,
  );

  useEffect(() => {
    if (cart.ready && lines.length === 0) router.replace("/catalog");
  }, [cart.ready, lines.length, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency: "aed",
          email,
          items: lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
          })),
        }),
      });
      const body = (await response.json().catch(() => null)) as
        | { checkout?: { url?: string }; error?: { message?: string } }
        | null;

      if (!response.ok || !body?.checkout?.url) {
        throw new Error(body?.error?.message || "Secure checkout is temporarily unavailable.");
      }

      window.location.assign(body.checkout.url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Secure checkout is temporarily unavailable.");
      setPending(false);
    }
  }

  if (!cart.ready || lines.length === 0) {
    return (
      <main className={styles.redirect} aria-live="polite">
        <span className={styles.redirectMark}>THE BASE</span>
        <p>{cart.ready ? "Returning to the catalogue…" : "Preparing your cart…"}</p>
      </main>
    );
  }

  return (
    <div className={`tbb ${styles.page}`}>
      <header className={styles.header}>
        <SiteLink href="/catalog" className={styles.back}>
          <span aria-hidden="true">←</span> Back to shop
        </SiteLink>
        <SiteLink href="/" className={styles.logo} aria-label="THE BASE — home">
          <BrandLogo />
        </SiteLink>
        <span className={styles.mode}>Stripe test mode</span>
      </header>

      <main className={styles.layout}>
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.formInner}>
            <p className={styles.eyebrow}>Secure checkout</p>
            <h1 className={styles.title}>Complete your order</h1>
            <p className={styles.intro}>
              Review your THE BASE products here. Card and delivery details are entered on
              Stripe’s secure Test Mode checkout in the next step.
            </p>

            <section className={styles.section} aria-labelledby="checkout-contact">
              <div className={styles.sectionHead}>
                <span className={styles.step}>01</span>
                <h2 id="checkout-contact">Contact</h2>
              </div>
              <label className={styles.field}>
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                />
              </label>
            </section>

            <section className={styles.section} aria-labelledby="checkout-payment">
              <div className={styles.sectionHead}>
                <span className={styles.step}>02</span>
                <h2 id="checkout-payment">Delivery & payment</h2>
              </div>
              <p className={styles.note}>
                Stripe collects the billing address, supported delivery country and card
                authentication. THE BASE never receives or stores raw card details.
              </p>
            </section>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <button className={styles.submit} type="submit" disabled={pending}>
              {pending ? "Opening secure checkout…" : "Continue to secure payment"}
              <span aria-hidden="true">→</span>
            </button>
            <p className={styles.disclaimer}>Test Mode only — no live Stripe payment is created.</p>
          </div>
        </form>

        <aside className={styles.summary} aria-labelledby="order-summary-title">
          <div className={styles.summaryInner}>
            <p className={styles.eyebrow}>Your order</p>
            <h2 id="order-summary-title" className={styles.summaryTitle}>
              {lines.length} {lines.length === 1 ? "product" : "products"}
            </h2>

            <div className={styles.lines}>
              {lines.map((line) => (
                <article key={line.slug} className={styles.line}>
                  <div className={styles.thumb}>
                    <Image
                      src={tiles[line.slug]?.image ?? line.product.image ?? ""}
                      alt=""
                      fill
                      sizes="88px"
                    />
                  </div>
                  <div className={styles.lineCopy}>
                    <h3>{line.product.name}</h3>
                    <p>{line.product.categoryLabel}</p>
                    <div className={styles.quantity} aria-label={`${line.product.name} quantity`}>
                      <button
                        type="button"
                        aria-label={`Decrease ${line.product.name} quantity`}
                        onClick={() => setCartItemQuantity(line.slug, line.quantity - 1)}
                      >
                        −
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${line.product.name} quantity`}
                        onClick={() => setCartItemQuantity(line.slug, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => removeCartItem(line.slug)}
                    >
                      Remove
                    </button>
                  </div>
                  <strong>{priceFormatter.format(priceNumber(line.product.price) * line.quantity)}</strong>
                </article>
              ))}
            </div>

            <dl className={styles.total}>
              <div>
                <dt>Subtotal</dt>
                <dd>{priceFormatter.format(total)}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>Calculated securely</dd>
              </div>
              <div className={styles.totalLine}>
                <dt>Total</dt>
                <dd>{priceFormatter.format(total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </main>
    </div>
  );
}
