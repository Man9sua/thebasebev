import Stripe from "stripe";
import type { CommerceAddress } from "./types";

export type StripeCommerceLineItem = Readonly<{
  productKey?: string | null;
  websiteProductId?: string | null;
  websiteSku?: string | null;
  quantity: number;
  unitAmount: number;
  amountSubtotal: number;
  amountDiscount: number;
  amountTax: number;
  amountTotal: number;
  currency: string;
}>;

export type StripeCommerceSession = Readonly<{
  id: string;
  livemode: boolean;
  mode: string;
  status?: string | null;
  paymentStatus: string;
  currency?: string | null;
  clientReferenceId?: string | null;
  internalOrderId?: string | null;
  paymentIntentId?: string | null;
  customerId?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  billingAddress?: CommerceAddress | null;
  shippingAddress?: CommerceAddress | null;
  amountSubtotal: number;
  amountDiscount: number;
  amountShipping: number;
  amountTax: number;
  amountTotal: number;
  createdAt: string;
  lineItems: readonly StripeCommerceLineItem[];
}>;

export interface StripeCommerceClient {
  retrieveSession(sessionId: string): Promise<StripeCommerceSession>;
}

function objectId(value: string | { id: string } | null) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function address(
  value:
    | {
        line1: string | null;
        line2: string | null;
        city: string | null;
        state: string | null;
        postal_code: string | null;
        country: string | null;
      }
    | null
    | undefined,
): CommerceAddress | null {
  if (!value) return null;
  return {
    line1: value.line1,
    line2: value.line2,
    city: value.city,
    state: value.state,
    postalCode: value.postal_code,
    country: value.country,
  };
}

export function createStripeCommerceClient(secretKey: string): StripeCommerceClient {
  const stripe = new Stripe(secretKey, {
    httpClient: Stripe.createFetchHttpClient(),
    maxNetworkRetries: 2,
    timeout: 12_000,
  });

  return {
    async retrieveSession(sessionId) {
      const [session, lineItems] = await Promise.all([
        stripe.checkout.sessions.retrieve(sessionId),
        stripe.checkout.sessions.listLineItems(sessionId, { limit: 100 }),
      ]);
      const details = session.customer_details;
      const shipping = session.collected_information?.shipping_details;

      return {
        id: session.id,
        livemode: session.livemode,
        mode: session.mode,
        status: session.status,
        paymentStatus: session.payment_status,
        currency: session.currency,
        clientReferenceId: session.client_reference_id,
        internalOrderId: session.metadata?.tb_order_id ?? null,
        paymentIntentId: objectId(session.payment_intent),
        customerId: objectId(session.customer),
        customerEmail: details?.email ?? session.customer_email,
        customerName: details?.name,
        customerPhone: details?.phone,
        billingAddress: address(details?.address),
        shippingAddress: address(shipping?.address),
        amountSubtotal: session.amount_subtotal ?? 0,
        amountDiscount: session.total_details?.amount_discount ?? 0,
        amountShipping: session.total_details?.amount_shipping ?? 0,
        amountTax: session.total_details?.amount_tax ?? 0,
        amountTotal: session.amount_total ?? 0,
        createdAt: new Date(session.created * 1000).toISOString(),
        lineItems: lineItems.data.map((item) => ({
          productKey: item.metadata?.tb_product_key ?? null,
          websiteProductId: item.metadata?.tb_website_product_id ?? null,
          websiteSku: item.metadata?.tb_website_sku ?? null,
          quantity: item.quantity ?? 0,
          unitAmount: item.price?.unit_amount ?? 0,
          amountSubtotal: item.amount_subtotal,
          amountDiscount: item.amount_discount,
          amountTax: item.amount_tax,
          amountTotal: item.amount_total,
          currency: item.currency,
        })),
      };
    },
  };
}
