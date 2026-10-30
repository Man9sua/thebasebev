import Stripe from "stripe";

export function createStripeTestClient(secretKey: string) {
  const stripe = new Stripe(secretKey, {
    httpClient: Stripe.createFetchHttpClient(), maxNetworkRetries: 1, timeout: 10_000,
  });
  return {
    createSession: (params: Stripe.Checkout.SessionCreateParams, options: Stripe.RequestOptions) =>
      stripe.checkout.sessions.create(params, options),
    retrieveSession: (sessionId: string) => stripe.checkout.sessions.retrieve(sessionId),
  };
}
