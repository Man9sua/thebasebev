const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const MAX_KEYS = 5_000;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkStripeTestCheckoutRateLimit(request: Request) {
  const now = Date.now();
  if (buckets.size > MAX_KEYS) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
    if (buckets.size > MAX_KEYS) buckets.clear();
  }

  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const bucket = buckets.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 } as const;
  }

  bucket.count += 1;
  return bucket.count <= MAX_REQUESTS
    ? ({ allowed: true, retryAfterSeconds: 0 } as const)
    : ({
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1_000)),
      } as const);
}
