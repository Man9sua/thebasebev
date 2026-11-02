import Stripe from "stripe";

export function createStripeTestClient(secretKey: string) {
  const stripe = new Stripe(secretKey, {
    httpClient: Stripe.createFetchHttpClient(), maxNetworkRetries: 1, timeout: 10_000,
  });
  return {
    createSession: (params: Stripe.Checkout.SessionCreateParams, options: Stripe.RequestOptions) =>
      stripe.checkout.sessions.create(params, options),
    retrieveSession: (sessionId: string) => stripe.checkout.sessions.retrieve(sessionId),
    retrieveTaxRate: (id: string) => stripe.taxRates.retrieve(id),
    listLineItems: (id: string) => stripe.checkout.sessions.listLineItems(id, { limit: 100, expand: ["data.price.product"] }),
    retrievePaymentIntent: (id: string) => stripe.paymentIntents.retrieve(id, { expand: ["latest_charge"] }),
  };
}
