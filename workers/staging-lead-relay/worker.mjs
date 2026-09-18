const MAX_BODY_BYTES = 64 * 1024;
const ODOO_TIMEOUT_MS = 10_000;

function json(body, status) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

/**
 * Compare a bearer value without an early-exit byte comparison. The relay is
 * public on workers.dev, but it must only forward requests from our staging
 * website which owns the matching server-only secret.
 */
function tokenMatches(received, expected) {
  const encoder = new TextEncoder();
  const left = encoder.encode(received);
  const right = encoder.encode(expected);
  const length = Math.max(left.length, right.length);
  let mismatch = left.length ^ right.length;

  for (let index = 0; index < length; index += 1) {
    mismatch |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }

  return mismatch === 0;
}

function requestId() {
  return crypto.randomUUID();
}

/** Keep observability useful without putting personal data in Worker logs. */
function logDelivery(id, outcome, upstreamStatus = null) {
  console.info(
    JSON.stringify({
      at: new Date().toISOString(),
      scope: "staging-lead-relay",
      requestId: id,
      outcome,
      upstreamStatus,
    }),
  );
}

function unauthorized(id) {
  logDelivery(id, "unauthorized");
  return json({ ok: false, error: "unauthorized", requestId: id }, 401);
}

const relay = {
  async fetch(request, env) {
    const id = requestId();

    if (request.method !== "POST") {
      return new Response(null, {
        status: 405,
        headers: { Allow: "POST", "Cache-Control": "no-store" },
      });
    }

    const authorization = request.headers.get("Authorization") ?? "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : "";

    if (!env.LEAD_RELAY_AUTH_TOKEN || !token || !tokenMatches(token, env.LEAD_RELAY_AUTH_TOKEN)) {
      return unauthorized(id);
    }

    const declaredLength = Number(request.headers.get("Content-Length") ?? "0");
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
      logDelivery(id, "payload_too_large");
      return json({ ok: false, error: "payload_too_large", requestId: id }, 413);
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_BYTES) {
      logDelivery(id, "payload_too_large");
      return json({ ok: false, error: "payload_too_large", requestId: id }, 413);
    }

    try {
      const body = JSON.parse(rawBody);
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new TypeError("Expected JSON object");
      }
    } catch {
      logDelivery(id, "invalid_payload");
      return json({ ok: false, error: "invalid_payload", requestId: id }, 400);
    }

    if (!env.ODOO_WEBHOOK) {
      logDelivery(id, "upstream_not_configured");
      return json({ ok: false, error: "upstream_unavailable", requestId: id }, 503);
    }

    let endpoint;
    try {
      endpoint = new URL(env.ODOO_WEBHOOK);
      if (endpoint.protocol !== "https:") throw new TypeError("Expected HTTPS endpoint");
    } catch {
      logDelivery(id, "upstream_misconfigured");
      return json({ ok: false, error: "upstream_unavailable", requestId: id }, 503);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ODOO_TIMEOUT_MS);

    try {
      const upstream = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: rawBody,
        cache: "no-store",
        signal: controller.signal,
      });

      if (!upstream.ok) {
        logDelivery(id, "upstream_rejected", upstream.status);
        return json({ ok: false, error: "upstream_rejected", requestId: id }, 502);
      }

      logDelivery(id, "delivered", upstream.status);
      return json({ ok: true, requestId: id }, 200);
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "AbortError";
      logDelivery(id, timedOut ? "upstream_timeout" : "upstream_unreachable");
      return json(
        { ok: false, error: timedOut ? "upstream_timeout" : "upstream_unreachable", requestId: id },
        timedOut ? 504 : 502,
      );
    } finally {
      clearTimeout(timeout);
    }
  },
};

export default relay;
