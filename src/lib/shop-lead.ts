import { getFirstTouchAttribution } from "@/components/forms/first-touch";
import { getShopProduct, type ShopKind } from "@/data/shop";
import { isShopQuantity, SHOP_MAX_LINES } from "./shop-limits";
import type { CartItem } from "./cart-store";
import { defaultFormName } from "./lead-forms";
import { MAX_MESSAGE_LENGTH, MAX_SHORT_TEXT_LENGTH, validateLeadPayload } from "./leads";

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
  if (!input.items.length || input.items.length > SHOP_MAX_LINES) {
    return { ok: false, message: "Please review the items in your basket." };
  }
  const items = input.items.map((item) => ({ item, product: getShopProduct(item.slug) }));
  if (items.some(({ item, product }) => !product?.flavors.includes(item.flavor) || !isShopQuantity(item.quantity))) {
    return { ok: false, message: "Please review your selected flavours and quantities." };
  }
  if (input.deliveryPayment === "dhl-account" && !input.dhlAccount?.trim()) {
    return { ok: false, message: "Please enter your DHL account number." };
  }
  const customer = input.customer;
  const formType = input.kind === "samples" ? "sample" : "order";
  const delivery = input.deliveryPayment === "dhl-account"
    ? `Customer DHL account: ${input.dhlAccount!.trim()}`
    : "Confirm delivery cost and send a secure payment link before dispatch.";
  const introduction = input.kind === "samples" ? "Shop sample delivery request. Samples are free." : "Shop product and delivery quotation. Prices require confirmation.";
  const details = [
    `Business: ${customer.businessType ?? ""}`, `Website / Instagram: ${customer.website ?? ""}`,
    `Delivery address: ${[customer.emirate, customer.city, customer.street, customer.unit, customer.postalCode, input.country].filter(Boolean).join(", ")}`,
    `Delivery: ${input.shippingMethod ?? "standard"}. ${delivery}`,
    customer.trn ? `TRN: ${customer.trn}` : "", customer.notes ?? "",
  ].filter(Boolean).join("\n");
  const selection = items.map(({ item, product }) => `${product!.name} — ${item.flavor} × ${item.quantity}`).join("\n");
  const detailedMessage = [introduction, selection, details].join("\n");
  // Large baskets retain every line in order_json without exceeding the lead note limit.
  const message = detailedMessage.length <= MAX_MESSAGE_LENGTH ? detailedMessage : [
    introduction,
    `${items.length} flavours, ${input.items.reduce((total, item) => total + item.quantity, 0)} units. Full selection and quantities are included in the order details.`,
    details,
  ].join("\n");
  const productNames = [...new Set(items.map(({ product }) => product!.name))];
  const productSummary = productNames.join(", ");
  const payload = {
    ...getFirstTouchAttribution(), formType, formName: defaultFormName(formType),
    name: customer.name, email: customer.email, phone: customer.phone, company: customer.company, country: input.country,
    product: productSummary.length <= MAX_SHORT_TEXT_LENGTH ? productSummary : `${productNames.length} product ranges`, message, consent: input.consent,
    order: { currency: "AED", items: items.map(({ item, product }) => ({
      name: `${product!.name} — ${item.flavor}`, sku: `${item.slug}::${item.flavor}`, quantity: item.quantity,
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
