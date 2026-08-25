import { toTildaLeadPayload } from "@/lib/lead-forms";
import { validateLeadPayload } from "@/lib/leads";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

/**
 * Server-side proxy from the Next.js clone to the existing Odoo pipeline.
 *
 *   Next.js form → POST /api/leads → LEAD_API_URL (tilda-odoo Worker) → Odoo
 *
 * The upstream Worker is production infrastructure serving live Tilda traffic;
 * it is never modified from here, and its URL never reaches the browser.
 */

const FORWARD_TIMEOUT_MS = 10_000;
const MAX_BODY_BYTES = 64 * 1024;

type ErrorCode =
  | "method_not_allowed"
  | "payload_too_large"
  | "invalid_payload"
  | "rate_limited"
  | "lead_backend_unavailable"
  | "lead_delivery_failed"
  | "lead_delivery_timeout";

const USER_MESSAGES: Record<ErrorCode, string> = {
  method_not_allowed: "Something went wrong. Please try again.",
  payload_too_large: "Your message is too long. Please shorten it.",
  invalid_payload: "Please check the required fields.",
  rate_limited: "Too many attempts. Please wait a moment and try again.",
  // Wording matches the existing site copy asserted by `smoke:browser`.
  lead_backend_unavailable:
    "Lead delivery is temporarily unavailable. Please contact us directly.",
  lead_delivery_failed: "Something went wrong. Please try again.",
  lead_delivery_timeout: "Something went wrong. Please try again.",
};

function newRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Diagnostic log line. Deliberately carries no name, email, phone or message —
 * only the routing and outcome fields needed to trace a submission.
 */
function logLead(entry: {
  requestId: string;
  formType: string | null;
  route: string | null;
  outcome: string;
  upstreamStatus: number | null;
  durationMs: number;
}) {
  console.info(
    JSON.stringify({
      at: new Date().toISOString(),
      scope: "api/leads",
      ...entry,
    }),
  );
}

function fail(
  status: number,
  error: ErrorCode,
  requestId: string,
  extraHeaders?: Record<string, string>,
) {
  return Response.json(
    { ok: false, error, message: USER_MESSAGES[error], requestId },
    {
      status,
      headers: { "Cache-Control": "no-store", ...extraHeaders },
    },
  );
}

/** Only same-origin form posts belong here; nothing else is routed through. */
function methodNotAllowed() {
  return Response.json(
    { ok: false, error: "method_not_allowed" },
    {
      status: 405,
      headers: { Allow: "POST", "Cache-Control": "no-store" },
    },
  );
}

export function GET() {
  return methodNotAllowed();
}

export const HEAD = GET;
export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;

export async function POST(request: Request) {
  const requestId = newRequestId();
  const startedAt = Date.now();
  const receivedAt = new Date().toISOString();
  const done = (
    outcome: string,
    upstreamStatus: number | null,
    formType: string | null,
    route: string | null,
  ) =>
    logLead({
      requestId,
      formType,
      route,
      outcome,
      upstreamStatus,
      durationMs: Date.now() - startedAt,
    });

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    done("payload_too_large", null, null, null);
    return fail(413, "payload_too_large", requestId);
  }

  const rateLimit = checkRateLimit(getRateLimitKey(request));
  if (!rateLimit.allowed) {
    done("rate_limited", null, null, null);
    return fail(429, "rate_limited", requestId, {
      "Retry-After": String(rateLimit.retryAfterSeconds),
    });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    done("payload_too_large", null, null, null);
    return fail(413, "payload_too_large", requestId);
  }

  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    done("invalid_json", null, null, null);
    return fail(400, "invalid_payload", requestId);
  }

  const validation = validateLeadPayload(input);
  if (!validation.ok) {
    done("invalid_payload", null, null, null);
    return fail(400, "invalid_payload", requestId);
  }

  const lead = validation.data;
  const route = new URL(lead.submissionPage).pathname;

  // A filled decoy field means a bot. Accept the request so it learns nothing,
  // but never forward it to Odoo.
  if (lead.honeypotTripped) {
    done("honeypot", null, lead.formType, route);
    return Response.json(
      { ok: true, requestId },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  }

  const endpoint = process.env.LEAD_API_URL?.trim();
  if (!endpoint) {
    done("backend_not_configured", null, lead.formType, route);
    return fail(503, "lead_backend_unavailable", requestId);
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(endpoint);
  } catch {
    done("backend_misconfigured", null, lead.formType, route);
    return fail(503, "lead_backend_unavailable", requestId);
  }

  if (targetUrl.protocol !== "https:" && targetUrl.hostname !== "localhost") {
    done("backend_insecure", null, lead.formType, route);
    return fail(503, "lead_backend_unavailable", requestId);
  }

  const currentUrl = new URL(request.url);
  if (
    targetUrl.origin === currentUrl.origin &&
    targetUrl.pathname.replace(/\/$/, "") === currentUrl.pathname.replace(/\/$/, "")
  ) {
    done("backend_recursive", null, lead.formType, route);
    return fail(503, "lead_backend_unavailable", requestId);
  }

  // Translate to the legacy Tilda field names the Odoo webhook already parses.
  const upstreamPayload = toTildaLeadPayload(lead, { requestId, receivedAt });

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  // The tilda-odoo Worker accepts unauthenticated posts today. A key is sent
  // only when one is configured, so a future authenticated upstream needs no
  // code change here.
  const apiKey = process.env.LEAD_API_KEY?.trim();
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FORWARD_TIMEOUT_MS);

  try {
    const upstream = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(upstreamPayload),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!upstream.ok) {
      done("upstream_rejected", upstream.status, lead.formType, route);
      return fail(502, "lead_delivery_failed", requestId);
    }

    done("delivered", upstream.status, lead.formType, route);
    return Response.json(
      { ok: true, requestId },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    done(timedOut ? "upstream_timeout" : "upstream_unreachable", null, lead.formType, route);
    return fail(
      timedOut ? 504 : 502,
      timedOut ? "lead_delivery_timeout" : "lead_delivery_failed",
      requestId,
    );
  } finally {
    clearTimeout(timeout);
  }
}
