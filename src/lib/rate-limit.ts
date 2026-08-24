/**
 * Best-effort in-process rate limiting for `/api/leads`.
 *
 * This is deliberately a thin abstraction rather than a guarantee. On
 * Cloudflare Workers each isolate keeps its own counters, so a determined
 * attacker spread across colos is not stopped here. It exists to absorb the
 * common case — a stuck retry loop or a naive script hammering one endpoint —
 * and to give us a single place to swap in a real backend later.
 *
 * Planned production rule (not yet configured, see LEAD_PIPELINE.md):
 *   Cloudflare → Security → WAF → Rate limiting rules
 *   expression: (http.request.uri.path eq "/api/leads" and http.request.method eq "POST")
 *   characteristics: ip.src
 *   rate: 5 requests / 60 seconds → managed challenge
 */

export type RateLimitDecision = {
  allowed: boolean;
  /** Seconds the caller should wait before retrying. */
  retryAfterSeconds: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;
/** Cap the map so a spray of unique keys cannot grow it without bound. */
const MAX_TRACKED_KEYS = 10_000;

const buckets = new Map<string, Bucket>();

function evictExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

/**
 * Derive a rate-limit key from the request. Cloudflare sets `cf-connecting-ip`;
 * everything else is a fallback so local development still exercises the path.
 */
export function getRateLimitKey(request: Request): string {
  const headers = request.headers;
  const ip =
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  return ip;
}

export function checkRateLimit(
  key: string,
  now = Date.now(),
): RateLimitDecision {
  if (buckets.size > MAX_TRACKED_KEYS) {
    evictExpired(now);
    if (buckets.size > MAX_TRACKED_KEYS) {
      buckets.clear();
    }
  }

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;

  if (bucket.count > MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Test hook — the audit suite needs a clean slate between cases. */
export function resetRateLimits() {
  buckets.clear();
}
