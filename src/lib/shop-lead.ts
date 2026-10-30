import { getFirstTouchAttribution } from "@/components/forms/first-touch";
import { getShopProduct, SHOP_SAMPLE_LIMIT, type ShopKind } from "@/data/shop";
import type { CartItem } from "./cart-store";
import { defaultFormName } from "./lead-forms";
import { validateLeadPayload } from "./leads";

export type ShopCustomer = {
  name: string; email: string; phone: string;
  businessType?: string; company?: string; website?: string; emirate?: string;
  city?: string; street?: string; postalCode?: string; unit?: string; trn?: string; notes?: string;
};
export type ShopQuoteRequest = {
  kind: ShopKind; country: string; items: readonly CartItem[]; customer: ShopCustomer; consent: boolean;
  deliveryPayment?: "link" | "dhl-account"; dhlAccount?: string; shippingMethod?: "standard" | "express";
};

/** Checkout enquiries share the lead API and its sole server-side Tilda field mapper. */
export async function submitShopQuoteRequest(input: ShopQuoteRequest): Promise<{ ok: boolean; message?: string }> {
  if (!input.consent) return { ok: false, message: "Please agree to the Privacy Policy." };
  if (!input.items.length || (input.kind === "samples" && input.items.length > SHOP_SAMPLE_LIMIT)) {
    return { ok: false, message: "Please review the items in your basket." };
  }
  const items = input.items.map((item) => ({ item, product: getShopProduct(item.slug) }));
  if (items.some(({ item, product }) => !product?.flavors.includes(item.flavor))) {
    return { ok: false, message: "A selected flavour is no longer available. Please review your basket." };
  }
  if (input.deliveryPayment === "dhl-account" && !input.dhlAccount?.trim()) {
    return { ok: false, message: "Please enter your DHL account number." };
  }
  const customer = input.customer;
  const formType = input.kind === "samples" ? "sample" : "order";
  const delivery = input.deliveryPayment === "dhl-account"
    ? `Customer DHL account: ${input.dhlAccount!.trim()}`
    : "Confirm delivery cost and send a secure payment link before dispatch.";
  const message = [
    input.kind === "samples" ? "Shop sample delivery request. Samples are free." : "Shop product and delivery quotation. Prices require confirmation.",
    ...items.map(({ item, product }) => `${product!.name} — ${item.flavor} × ${input.kind === "samples" ? 1 : item.quantity}`),
    `Business: ${customer.businessType ?? ""}`, `Website / Instagram: ${customer.website ?? ""}`,
    `Delivery address: ${[customer.emirate, customer.city, customer.street, customer.unit, customer.postalCode, input.country].filter(Boolean).join(", ")}`,
    `Delivery: ${input.shippingMethod ?? "standard"}. ${delivery}`,
    customer.trn ? `TRN: ${customer.trn}` : "", customer.notes ?? "",
  ].filter(Boolean).join("\n");
  const payload = {
    ...getFirstTouchAttribution(), formType, formName: defaultFormName(formType),
    name: customer.name, email: customer.email, phone: customer.phone, company: customer.company, country: input.country,
    product: [...new Set(items.map(({ product }) => product!.name))].join(", "), message, consent: input.consent,
    order: { currency: "AED", items: items.map(({ item, product }) => ({
      name: `${product!.name} — ${item.flavor}`, sku: `${item.slug}::${item.flavor}`, quantity: input.kind === "samples" ? 1 : item.quantity,
    })) },
    submissionPage: window.location.href, clientTimestamp: new Date().toISOString(),
  };
  const validation = validateLeadPayload(payload);
  if (!validation.ok) return { ok: false, message: "Please check your contact details and address." };
  try {
    const response = await fetch("/api/leads", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(validation.data),
    });
    const result = await response.json().catch(() => null) as { ok?: boolean } | null;
    return response.ok && result?.ok === true ? { ok: true }
      : { ok: false, message: "Your request could not be delivered. Please try again or contact info@thebasebev.com." };
  } catch {
    return { ok: false, message: "Your request could not be delivered. Please check your connection and try again." };
  }
}

export function submitShopSampleRequest(input: Omit<ShopQuoteRequest, "kind">) {
  return submitShopQuoteRequest({ ...input, kind: "samples" });
}
