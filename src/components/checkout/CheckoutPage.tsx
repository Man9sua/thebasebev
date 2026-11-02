"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";
import { useCart, useSampleCart } from "@/components/cart/useCart";
import { ShopPackImage } from "@/components/shop/ShopPackImage";
import { BrandLogo } from "@/components/site/BrandLogo";
import { SiteLink } from "@/components/site/SiteLink";
import { useCountryCode } from "@/components/site/useCountryCode";
import { getCheckoutProductId } from "@/data/catalog";
import { DISTRIBUTOR_MARKETS } from "@/data/distributor-markets";
import { getShopProduct, SHOP_MAX_QUANTITY } from "@/data/shop";
import {
  removeSubmittedSamples,
  removeCartItem,
  removeSampleCartItem,
  setCartItemQuantity,
  setSampleCartItemQuantity,
} from "@/lib/cart-store";
import { rememberPendingCheckout } from "@/lib/checkout-session";
import { submitShopQuoteRequest, submitShopSampleRequest } from "@/lib/shop-lead";
import { formatShopMoney, getShopQuote, getShopUnitAmount, getShopPackLabel, hasPayableVariants, SHOP_ORDER_PAYMENTS_READY, UAE_DELIVERY_TIMING } from "@/lib/shop-payment";
import { combineShopBaskets, shopBasketKey } from "@/lib/shop-basket";
import { getFirstTouchAttribution } from "@/components/forms/first-touch";
import styles from "./CheckoutPage.module.css";

type Fields = {
  name: string;
  phone: string;
  email: string;
  company: string;
  website: string;
  city: string;
  street: string;
  postalCode: string;
  unit: string;
  notes: string;
  dhlAccount: string;
};
type FieldDefinition = {
  key: keyof Fields;
  label: string;
  required?: boolean;
  type?: "email" | "tel";
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
};
type FieldErrors = Partial<Record<keyof Fields | "consent", string>>;

const INITIAL_FIELDS: Fields = {
  name: "", phone: "", email: "", company: "", website: "", city: "",
  street: "", postalCode: "", unit: "", notes: "", dhlAccount: "",
};
const CONTACT_FIELDS: readonly FieldDefinition[] = [
  { key: "name", label: "Full name", required: true, autoComplete: "name", maxLength: 120 },
  { key: "phone", label: "Mobile", type: "tel", required: true, autoComplete: "tel", placeholder: "+971", maxLength: 40 },
  { key: "email", label: "Email", type: "email", required: true, autoComplete: "email", placeholder: "name@cafe.com", maxLength: 254 },
  { key: "company", label: "Company and TRN (optional)", autoComplete: "organization", placeholder: "For tax invoice" },
];
const BUSINESS_FIELDS: readonly FieldDefinition[] = [
  { key: "company", label: "Company name", required: true, autoComplete: "organization" },
  { key: "website", label: "Website or Instagram", required: true, placeholder: "@yourcafe", maxLength: 240 },
  { key: "name", label: "Contact name", required: true, autoComplete: "name", maxLength: 120 },
  { key: "phone", label: "Mobile / WhatsApp", type: "tel", required: true, autoComplete: "tel", maxLength: 40 },
  { key: "email", label: "Email", type: "email", required: true, autoComplete: "email", maxLength: 254 },
];
const ADDRESS_FIELDS: readonly FieldDefinition[] = [
  { key: "city", label: "Area", required: true, placeholder: "Al Quoz", autoComplete: "address-level2" },
  { key: "street", label: "Street, building", required: true, autoComplete: "address-line1", maxLength: 240 },
  { key: "unit", label: "Unit or shop no. (optional)", autoComplete: "address-line2", maxLength: 120 },
];
const SAMPLE_ADDRESS_FIELDS: readonly FieldDefinition[] = [
  { key: "city", label: "City", required: true, autoComplete: "address-level2" },
  { key: "street", label: "Street and building", required: true, autoComplete: "address-line1", maxLength: 240 },
  { key: "postalCode", label: "Postal code (if applicable)", autoComplete: "postal-code", maxLength: 32 },
  { key: "unit", label: "Unit, floor (optional)", autoComplete: "address-line2", maxLength: 120 },
];
const DHL_FIELD: FieldDefinition = { key: "dhlAccount", label: "DHL account number", required: true, maxLength: 64 };
const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];
const BUSINESS_TYPES = ["Café", "Restaurant", "Hotel", "Distributor", "Other"];
const COUNTRY_NAMES = new Map(DISTRIBUTOR_MARKETS.map(({ code, name }) => [code, name]));
const SHIPPING_METHODS = [
  { id: "standard", name: "Standard", description: "Delivery time and cost confirmed before payment" },
  { id: "express", name: "Express", description: "Availability and cost confirmed for your address" },
] as const;
const DHL_OPTIONS = [
  { id: "link", name: "Pay by link", description: "After approval we send the exact DHL cost and a card payment link" },
  { id: "dhl-account", name: "Use my DHL account", description: "DHL bills your account directly" },
] as const;

function validateFields(values: Fields, definitions: readonly FieldDefinition[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of definitions) {
    if (field.required && !values[field.key].trim()) errors[field.key] = "This field is required.";
  }
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  const phoneDigits = values.phone.replace(/\D/g, "");
  if (values.phone.trim() && (!/^\+?[\d\s().-]+$/.test(values.phone.trim()) ||
    phoneDigits.length < 7 || phoneDigits.length > 15)) {
    errors.phone = "Enter a valid phone number, including the country code.";
  }
  return errors;
}

function stripeCheckoutUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "checkout.stripe.com" &&
      !url.username && !url.password && !url.port ? url.href : null;
  } catch {
    return null;
  }
}

function CheckoutField({ field, value, error, disabled, onChange }: {
  field: FieldDefinition;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (key: keyof Fields, value: string) => void;
}) {
  const id = `checkout-${field.key}`;
  return (
    <label className={styles.field} htmlFor={id}>
      <span>{field.label}</span>
      <input
        id={id}
        name={field.key}
        type={field.type ?? "text"}
        value={value}
        required={field.required}
        autoComplete={field.autoComplete}
        placeholder={field.placeholder}
        maxLength={field.maxLength ?? 160}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(field.key, event.target.value)}
      />
      {error && <span id={`${id}-error`} className={styles.fieldError}>{error}</span>}
    </label>
  );
}

export function CheckoutPage() {
  const searchParams = useSearchParams();
  const routeCountry = useCountryCode();
  const requestedCountry = searchParams.get("country")?.toUpperCase();
  const country = requestedCountry && COUNTRY_NAMES.has(requestedCountry) ? requestedCountry : routeCountry;
  const countryName = COUNTRY_NAMES.get(country) ?? country;
  const paidCart = useCart();
  const sampleCart = useSampleCart();
  const items = useMemo(() => combineShopBaskets(country, paidCart.items, sampleCart.items), [country, paidCart.items, sampleCart.items]);
  const isSample = country !== "AE" || (items.length > 0 && items.every(item => item.kind === "samples"));
  const kind = isSample ? "samples" : "products";
  const cart = { ready: paidCart.ready && sampleCart.ready, items };
  const totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [businessType, setBusinessType] = useState("Café");
  const [emirate, setEmirate] = useState("Dubai");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [deliveryPayment, setDeliveryPayment] = useState<"link" | "dhl-account">("link");
  const [consent, setConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const checkoutAttempt = useRef<{ payload: string; key: string } | null>(null);

  const lines = useMemo(() => cart.items.flatMap((item) => {
    const product = getShopProduct(item.slug);
    return product ? [{ ...item, product, unitAmount: getShopUnitAmount(item.slug, undefined, item.flavor) }] : [];
  }), [cart.items]);
  const quote = useMemo(() => getShopQuote({ kind, country, shippingMethod, items: cart.items }),
    [kind, country, shippingMethod, cart.items]);
  const quoteNeeded = !SHOP_ORDER_PAYMENTS_READY || !quote.ready || !hasPayableVariants(kind, items)
    || items.length + (quote.shipping ? 1 : 0) > 100 || (quote.total ?? 0) > 99_999_999 || (isSample && deliveryPayment === "dhl-account");
  const shopHref = `/${country.toLowerCase()}/catalog`;
  const contactFields = isSample ? BUSINESS_FIELDS : CONTACT_FIELDS;
  const addressFields = isSample ? SAMPLE_ADDRESS_FIELDS : ADDRESS_FIELDS;
  const empty = cart.ready && lines.length === 0;
  const cancelled = searchParams.get("canceled") === "1" || searchParams.get("stripe_checkout") === "cancelled";
  const subtotalLabel = isSample ? "Free"
    : quote.subtotal === null ? "To be confirmed" : formatShopMoney(quote.subtotal);
  const shippingLabel = isSample && deliveryPayment === "dhl-account" ? "Your DHL account"
    : quote.shipping === null ? isSample ? "Quote, then pay by link" : "To be confirmed"
      : quote.shipping === 0 ? "Free" : formatShopMoney(quote.shipping);
  const ownDhlAccount = isSample && deliveryPayment === "dhl-account";
  const totalLabel = ownDhlAccount || quote.total === null ? "Awaiting quote" : formatShopMoney(quote.total);
  const submitLabel = pending ? "Please wait…"
    : quoteNeeded ? isSample ? "Send request" : "Request order quote"
      : isSample ? "Pay delivery securely" : "Continue to secure payment";
  const caption = !quoteNeeded
    ? isSample ? "Samples are free. You pay only the confirmed delivery charge on Stripe."
      : "You will continue to secure payment on Stripe."
    : isSample ? `For ${countryName}. If we have a distributor there, they may contact you too.`
      : "Our team confirms your order before payment.";

  function updateField(key: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !cart.ready) return;
    const form = event.currentTarget;
    const requiredFields = [...contactFields, ...addressFields,
      ...(isSample && deliveryPayment === "dhl-account" ? [DHL_FIELD] : [])];
    const errors = validateFields(fields, requiredFields);
    if (!consent) errors.consent = "Please agree to the Privacy Policy.";
    setFieldErrors(errors);
    setError("");
    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) {
      const control = form.elements.namedItem(firstInvalid);
      if (control instanceof HTMLElement) control.focus();
      setError("Please check the highlighted fields.");
      return;
    }
    if (empty || lines.length !== cart.items.length) {
      setError(empty ? "Add products before continuing." : "Please review the products in your basket.");
      return;
    }

    const customer = {
      name: fields.name.trim(), phone: fields.phone.trim(), email: fields.email.trim(),
      company: fields.company.trim(), website: fields.website.trim(),
      businessType: isSample ? businessType : undefined,
      emirate: isSample ? undefined : emirate, city: fields.city.trim(),
      street: fields.street.trim(), postalCode: fields.postalCode.trim(),
      unit: fields.unit.trim(), notes: fields.notes.trim(),
    };
    setPending(true);
    try {
      if (quoteNeeded) {
        const request = {
          country, items: cart.items, customer, consent,
          shippingMethod,
          ...(isSample ? { deliveryPayment, dhlAccount: fields.dhlAccount.trim() || undefined } : {}),
        };
        const result = isSample
          ? await submitShopSampleRequest(request)
          : await submitShopQuoteRequest({ ...request, kind: "products" });
        if (!result.ok) throw new Error(result.message || "Your request could not be sent. Please try again.");
        if (isSample) removeSubmittedSamples(request.items);
        setCompleted(true);
      } else {
        const payload = JSON.stringify({
          kind, country, currency: "aed", shippingMethod, email: customer.email, customer, consent,
          attribution: { ...getFirstTouchAttribution(), currentPage: window.location.href },
          items: cart.items.map((item) => ({ productId: getCheckoutProductId(item.slug) ?? item.slug,
            flavor: item.flavor, quantity: item.quantity, kind: item.kind })),
        });
        if (checkoutAttempt.current?.payload !== payload) checkoutAttempt.current = { payload, key: crypto.randomUUID() };
        const response = await fetch("/api/checkout/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": checkoutAttempt.current.key },
          body: payload,
        });
        const body = await response.json().catch(() => null);
        const url = stripeCheckoutUrl(body?.checkout?.url);
        const sessionId = body?.checkout?.sessionId;
        if (["CHECKOUT_KEY_REUSED", "CHECKOUT_EXPIRED"].includes(body?.error?.code)) checkoutAttempt.current = null;
        if (!response.ok || body?.ok !== true || body.checkout?.testMode !== true || !url || typeof sessionId !== "string" ||
          !/^cs_test_[a-zA-Z0-9_]+$/.test(sessionId)) {
          throw new Error(body?.error?.message || "Secure checkout is temporarily unavailable. Your cart has been kept.");
        }
        rememberPendingCheckout(sessionId, kind, cart.items);
        window.location.assign(url);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your request could not be sent. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={`tbb ${styles.page}`}>
      <header className={styles.header}>
        <SiteLink href={shopHref} className={styles.logo} aria-label="the Base — shop"><BrandLogo /></SiteLink>
        <SiteLink href={shopHref} className={styles.back}><span aria-hidden="true">←</span> Back to shop</SiteLink>
      </header>
      {completed ? (
        <main className={styles.success} aria-live="polite">
          <span className={styles.successMark} aria-hidden="true">✓</span>
          <h1 className={styles.title}>Request received</h1>
          <p>{isSample
            ? deliveryPayment === "dhl-account"
              ? "A manager will review your business and confirm the sample shipment using your DHL account."
              : "A manager will review your business, then confirm the exact DHL cost and send a payment link. The parcel ships after approval and payment."
            : "A manager will confirm product prices and delivery for your address before payment. Your products remain in your cart."}</p>
          <SiteLink href={shopHref} className={styles.backButton}>Back to shop</SiteLink>
        </main>
      ) : (
        <main className={styles.main}>
          <div className={styles.heading}>
            <h1 className={styles.title}>{isSample ? "Request samples" : "Checkout"}</h1>
            {isSample && <p>Samples are free for cafés, restaurants, hotels and distributors. A manager checks your business, then confirms DHL Express delivery from Dubai.</p>}
          </div>
          {cancelled && <p className={styles.quoteNote} role="status">Checkout was cancelled. Your basket has been kept.</p>}
          {!cart.ready ? <p role="status">Preparing your {isSample ? "sample box" : "cart"}…</p> : empty ? (
            <section className={styles.empty}>
              <h2>{isSample ? "Your sample box is empty" : "Your cart is empty"}</h2>
              <p>Choose products, flavours and quantities in the shop.</p>
              <SiteLink href={shopHref} className={styles.backButton}>{isSample ? "Pick flavours" : "Go to shop"}</SiteLink>
            </section>
          ) : (
            <form className={styles.grid} onSubmit={submit} noValidate aria-busy={pending}>
              <div className={styles.sections}>
                <section className={styles.section} aria-labelledby="checkout-contact-title">
                  <div className={styles.sectionHead}><span className={styles.step}>1</span><h2 id="checkout-contact-title">{isSample ? "Your business" : "Contact"}</h2></div>
                  {isSample && <div className={styles.chips} role="group" aria-label="Business type">{BUSINESS_TYPES.map((name) => (
                    <button key={name} type="button" aria-pressed={businessType === name} onClick={() => setBusinessType(name)} disabled={pending}>{name}</button>
                  ))}</div>}
                  <div className={styles.fields}>{contactFields.map((field) => <CheckoutField key={field.key} field={field} value={fields[field.key]} error={fieldErrors[field.key]} disabled={pending} onChange={updateField} />)}</div>
                </section>
                <section className={styles.section} aria-labelledby="checkout-address-title">
                  <div className={styles.sectionHead}><span className={styles.step}>2</span><h2 id="checkout-address-title">{isSample ? "Delivery address for DHL" : "Delivery address"}</h2></div>
                  {isSample ? (
                    <label className={styles.field}><span>Country</span><input value={countryName} readOnly autoComplete="country-name" /></label>
                  ) : (
                    <div className={styles.field}><span>Emirate</span><div className={styles.chips} role="group" aria-label="Emirate">{EMIRATES.map((name) => (
                      <button key={name} type="button" aria-pressed={emirate === name} onClick={() => setEmirate(name)} disabled={pending}>{name}</button>
                    ))}</div></div>
                  )}
                  <div className={styles.fields}>{addressFields.map((field) => <CheckoutField key={field.key} field={field} value={fields[field.key]} error={fieldErrors[field.key]} disabled={pending} onChange={updateField} />)}</div>
                  {!isSample && <label className={styles.field}><span>Note for courier (optional)</span><textarea name="notes" value={fields.notes} rows={2} maxLength={500} placeholder="Delivery hours, loading entrance" disabled={pending} onChange={(event) => updateField("notes", event.target.value)} /></label>}
                </section>
                <section className={styles.section} aria-labelledby="checkout-delivery-title">
                  <div className={styles.sectionHead}><span className={styles.step}>3</span><h2 id="checkout-delivery-title">{isSample ? "DHL delivery payment" : "Delivery"}</h2></div>
                  <div className={styles.choices}>
                    {isSample ? DHL_OPTIONS.map((option) => (
                      <label className={styles.choice} key={option.id}>
                        <input type="radio" name="deliveryPayment" value={option.id} checked={deliveryPayment === option.id} disabled={pending} onChange={() => setDeliveryPayment(option.id)} />
                        <span><strong>{option.name}</strong><span>{option.description}</span></span>
                      </label>
                    )) : SHIPPING_METHODS.map((option) => (
                      <label className={styles.choice} key={option.id}>
                        <input type="radio" name="shippingMethod" value={option.id} checked={shippingMethod === option.id} disabled={pending} onChange={() => setShippingMethod(option.id)} />
                        <span><strong>{option.name}</strong><span>{option.description}</span></span>
                      </label>
                    ))}
                  </div>
                  {isSample && deliveryPayment === "dhl-account" && <CheckoutField field={DHL_FIELD} value={fields.dhlAccount} error={fieldErrors.dhlAccount} disabled={pending} onChange={updateField} />}
                </section>
                {!isSample && <section className={styles.section} aria-labelledby="checkout-payment-title">
                  <div className={styles.sectionHead}><span className={styles.step}>4</span><h2 id="checkout-payment-title">Payment</h2></div>
                  <div className={styles.payment}><strong>Secure card payment</strong><p>Card details are entered on Stripe’s hosted checkout after product prices and delivery are confirmed.</p></div>
                </section>}
              </div>
              <aside className={styles.summary} aria-labelledby="order-summary-title">
                <div className={styles.summaryHead}><h2 id="order-summary-title">{isSample ? "Sample box" : "Your order"}</h2>{isSample && <span>{totalQuantity} {totalQuantity === 1 ? "sample" : "samples"}</span>}</div>
                <div className={styles.lines}>{lines.map((line) => {
                  const sample = line.kind === "samples";
                  const setQuantity = sample ? setSampleCartItemQuantity : setCartItemQuantity;
                  const remove = sample ? removeSampleCartItem : removeCartItem;
                  const label = `${line.product.name} ${line.flavor}${!isSample && sample ? " sample" : ""}`;
                  return (
                  <article key={shopBasketKey(line)} className={styles.line} data-checkout-line-kind={line.kind}>
                    <div className={styles.thumb}>
                      <ShopPackImage product={line.product} sizes="56px" />
                      <span className={styles.quantityBadge}>{line.quantity}</span>
                    </div>
                    <div className={styles.lineCopy}>
                      <h3>{line.product.name}</h3><p><span>{line.flavor}</span><span>{line.kind === "samples" ? " · Free sample" : ` · ${getShopPackLabel(line.slug, line.flavor) ?? line.product.format}`}</span></p>
                      <div className={styles.quantity} aria-label={`${label} quantity`}>
                        <button type="button" disabled={pending} aria-label={`Decrease ${label} quantity`} onClick={() => setQuantity(line.slug, line.flavor, line.quantity - 1)}>−</button>
                        <span>{line.quantity}</span>
                        <button type="button" disabled={pending || line.quantity >= SHOP_MAX_QUANTITY} aria-label={`Increase ${label} quantity`} onClick={() => setQuantity(line.slug, line.flavor, line.quantity + 1)}>+</button>
                      </div>
                      <button type="button" className={styles.remove} disabled={pending} aria-label={`Remove ${label}`} onClick={() => remove(line.slug, line.flavor)}>Remove</button>
                    </div>
                    {!isSample && <strong className={styles.linePrice}>{line.kind === "samples" ? "Free" : line.unitAmount === null ? "Price to confirm" : formatShopMoney(line.unitAmount * line.quantity)}</strong>}
                  </article>
                ); })}</div>
                <dl className={styles.totals}>
                  <div><dt>{isSample ? "Samples" : "Subtotal, excl. VAT"}</dt><dd>{subtotalLabel}</dd></div>
                  <div><dt>{isSample && country !== "AE" ? "DHL Express" : "Delivery, excl. VAT"}</dt><dd>{shippingLabel}</dd></div>
                  <div><dt>VAT (5%)</dt><dd>{ownDhlAccount || quote.vat === null ? "To be confirmed" : formatShopMoney(quote.vat)}</dd></div>
                  <div className={styles.totalLine}><dt>{isSample ? "Delivery total" : "Total"}</dt><dd>{totalLabel}</dd></div>
                </dl>
                {country === "AE" && <p className={styles.quoteNote}>{isSample ? "Sample delivery: AED 30 + VAT for parcels up to 5 kg. Larger parcels are quoted separately." : "Free UAE delivery on products from AED 500 before VAT. Below AED 500: AED 30 + VAT. Samples travel with your order at no extra delivery charge."}</p>}
                {country === "AE" && <p className={styles.quoteNote}>{UAE_DELIVERY_TIMING}</p>}
                {!quote.ready && <p className={styles.quoteNote}>{quote.reason || "Product prices and delivery must be confirmed before payment. Request an exact quote below."}</p>}
                {!quoteNeeded && <p className={styles.quoteNote}>Test checkout. Use a Stripe test card; no real payment is taken.</p>}
                <label className={styles.consent}>
                  <input type="checkbox" name="consent" checked={consent} disabled={pending} required aria-invalid={fieldErrors.consent ? true : undefined} aria-describedby={fieldErrors.consent ? "checkout-consent-error" : undefined} onChange={(event) => { setConsent(event.target.checked); setFieldErrors((current) => ({ ...current, consent: undefined })); }} />
                  <span>I agree to the <SiteLink href={`/${country.toLowerCase()}/privacy`}>Privacy Policy</SiteLink>.</span>
                </label>
                {fieldErrors.consent && <p id="checkout-consent-error" className={styles.fieldError}>{fieldErrors.consent}</p>}
                {error && <p className={styles.error} role="alert">{error}</p>}
                <button className={styles.submit} type="submit" disabled={pending}>{submitLabel}</button>
                <p className={styles.caption}>{caption}</p>
              </aside>
            </form>
          )}
        </main>
      )}
    </div>
  );
}
