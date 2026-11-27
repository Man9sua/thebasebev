import fs from "node:fs";
import Stripe from "stripe";

function readIgnoredVariable(name) {
  for (const file of [".env.local", ".env"]) {
    if (!fs.existsSync(file)) continue;
    for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator < 1 || line.slice(0, separator).trim() !== name) continue;
      let value = line.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (value) return value;
    }
  }
  return process.env[name]?.trim();
}

const secretKey = readIgnoredVariable("STRIPE_SECRET_KEY");
if (!secretKey) throw new Error("STRIPE_SECRET_KEY is missing.");
if (secretKey.startsWith("sk_live_") || secretKey.startsWith("rk_live_")) {
  throw new Error("Refusing to authenticate with a Stripe Live key.");
}
if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("rk_test_")) {
  throw new Error("STRIPE_SECRET_KEY is not a recognized Test Mode key.");
}

const stripe = new Stripe(secretKey, {
  httpClient: Stripe.createFetchHttpClient(),
  maxNetworkRetries: 1,
  timeout: 10_000,
});
const balance = await stripe.balance.retrieve();

console.log(
  JSON.stringify(
    {
      authenticated: true,
      testModeKeyPrefixVerified: true,
      liveModeResponse: balance.livemode,
      aedBalanceBucketAvailable: [...balance.available, ...balance.pending].some(
        (entry) => entry.currency.toLowerCase() === "aed",
      ),
      secretsPrinted: false,
      customerDataRead: false,
    },
    null,
    2,
  ),
);

if (balance.livemode) process.exitCode = 1;
