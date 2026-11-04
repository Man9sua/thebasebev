export type StripeMode = "test" | "live";
export type StripePolicy = Readonly<{ mode?: StripeMode; liveOrigin?: string }>;

export const STRIPE_STAGING_ORIGIN = "https://the-base-staging.mansua.workers.dev";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function validLiveOrigin(value: string | undefined): string | undefined {
  try {
    const url = new URL(value ?? "");
    if (url.protocol === "https:" && url.origin === value && !url.username && !url.password
      && !url.port && !LOCAL_HOSTS.has(url.hostname) && url.origin !== STRIPE_STAGING_ORIGIN) return url.origin;
  } catch { /* An absent or invalid origin keeps Live checkout closed. */ }
}

export function isAllowedStripeHost(url: URL, policy: StripePolicy) {
  return policy.mode === "live" ? url.origin === validLiveOrigin(policy.liveOrigin)
    : url.origin === STRIPE_STAGING_ORIGIN || LOCAL_HOSTS.has(url.hostname);
}

export function isStripeKey(secretKey: string | undefined, mode: StripeMode = "test") {
  return new RegExp(`^(?:sk|rk)_${mode}_`).test(secretKey?.trim() ?? "");
}

export function isStripeSessionId(value: string, mode: StripeMode = "test") {
  return new RegExp(`^cs_${mode}_[A-Za-z0-9_]{1,180}$`).test(value);
}

export function stripeSessionMode(value: string): StripeMode | undefined {
  if (isStripeSessionId(value, "test")) return "test";
  if (isStripeSessionId(value, "live")) return "live";
}

export function stripeIntegration(mode: StripeMode = "test") {
  return `the_base_shop_${mode}`;
}
