import Stripe from "stripe";
import { paymentEnvironment, saveLivePaymentValues, odooClient, reportPaymentSetupFailure } from "./lib/payment-environment.mjs";

async function main() {
  const environment = paymentEnvironment();
  const key = environment.STRIPE_LIVE_SECRET_KEY;
  if (!/^(?:sk|rk)_live_/.test(key ?? "")) throw new Error("STRIPE_LIVE_KEY_REQUIRED");
  const stripe = new Stripe(key, { httpClient: Stripe.createFetchHttpClient(), maxNetworkRetries: 1, timeout: 20000 });
  const account = await stripe.accounts.retrieve();
  let expected = environment.STRIPE_LIVE_ACCOUNT_ID;
  if (!expected && /^(?:sk|rk)_test_/.test(environment.STRIPE_SECRET_KEY ?? "")) {
    const testStripe = new Stripe(environment.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient(), timeout: 20000, maxNetworkRetries: 1 });
    expected = (await testStripe.accounts.retrieve()).id;
  }
  if (!expected || expected !== account.id) throw new Error("STRIPE_ACCOUNT_MISMATCH");
  const active = account.charges_enabled === true && account.capabilities?.card_payments === "active";
  console.log(JSON.stringify({ authenticated: true, mode: "live", accountId: account.id, businessName: account.business_profile?.name ?? null,
    country: account.country, chargesEnabled: account.charges_enabled, payoutsEnabled: account.payouts_enabled, cardsActive: account.capabilities?.card_payments === "active", secretsPrinted: false }));
  if (!active) throw new Error("STRIPE_LIVE_ACCOUNT_NOT_READY");
  const originIndex = process.argv.indexOf("--origin");
  if (!process.argv.includes("--apply")) return;
  const origin = originIndex < 0 ? undefined : process.argv[originIndex + 1];
  const url = new URL(origin ?? "https://invalid.example");
  if (!origin || url.origin !== origin || url.protocol !== "https:" || url.username || url.password || url.port
    || ["the-base-staging.mansua.workers.dev", "localhost", "127.0.0.1"].includes(url.hostname)) throw new Error("APPROVED_LIVE_ORIGIN_REQUIRED");
  const actionId = Number(environment.ODOO_LIVE_ACTION_ID);
  if (!Number.isSafeInteger(actionId) || actionId <= 0 || actionId === 1629) throw new Error("LIVE_ODOO_RECEIVER_REQUIRED");
  const actions = await odooClient(environment)("ir.actions.server", "read", { ids: [actionId], fields: ["name", "code", "binding_model_id"] });
  if (actions.length !== 1 || actions[0].name !== "THE BASE Stripe Live — paid draft quotation"
    || !actions[0].code.includes("receiver_test_mode = False") || actions[0].binding_model_id) throw new Error("LIVE_ODOO_RECEIVER_INVALID");
  const rates = await stripe.taxRates.list({ active: true, limit: 100 });
  let tax = rates.data.find(rate => rate.livemode && rate.country === "AE" && !rate.inclusive && rate.percentage === 5);
  if (!tax) tax = await stripe.taxRates.create({ display_name: "VAT", description: "UAE VAT 5% — THE BASE website", percentage: 5, inclusive: false, country: "AE",
    metadata: { integration: "the_base_shop_live" } }, { idempotencyKey: "the_base_shop_live_uae_vat_5_v1" });
  saveLivePaymentValues({ STRIPE_LIVE_ACCOUNT_ID: account.id, STRIPE_LIVE_UAE_VAT_RATE_ID: tax.id, SHOP_LIVE_ORIGIN: origin });
  const webhookUrl = origin + "/api/stripe/webhook";
  const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
  const matching = endpoints.data.filter(endpoint => endpoint.url === webhookUrl);
  if (matching.length > 1) throw new Error("DUPLICATE_LIVE_WEBHOOKS");
  let endpoint = matching[0];
  if (endpoint && (endpoint.metadata.integration !== "the_base_shop_live" || endpoint.status !== "enabled"
    || !endpoint.enabled_events.includes("checkout.session.completed"))) throw new Error("EXISTING_LIVE_WEBHOOK_REVIEW_REQUIRED");
  if (!endpoint) {
    endpoint = await stripe.webhookEndpoints.create({ url: webhookUrl, enabled_events: ["checkout.session.completed", "checkout.session.async_payment_succeeded"],
      description: "THE BASE website — verified paid draft quotations", metadata: { integration: "the_base_shop_live" } }, { idempotencyKey: "the_base_shop_live_webhook_" + url.hostname });
    if (!endpoint.secret) throw new Error("WEBHOOK_SECRET_NOT_RETURNED");
    saveLivePaymentValues({ STRIPE_LIVE_WEBHOOK_SECRET: endpoint.secret });
  } else if (!environment.STRIPE_LIVE_WEBHOOK_SECRET) throw new Error("LIVE_WEBHOOK_SECRET_REQUIRED");
  console.log(JSON.stringify({ configured: true, taxRateId: tax.id, webhookId: endpoint.id, origin, paymentsEnabled: false, secretsPrinted: false }));
}

main().catch(reportPaymentSetupFailure);
