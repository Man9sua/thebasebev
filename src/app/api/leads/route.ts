import { validateLeadPayload } from "@/lib/leads";

const FORWARD_TIMEOUT_MS = 10_000;

function apiError(status: number, code: string, message: string, details?: unknown) {
  return Response.json(
    { ok: false, error: { code, message, details } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return apiError(400, "INVALID_JSON", "The request body must be valid JSON.");
  }

  const validation = validateLeadPayload(input);
  if (!validation.ok) {
    return apiError(
      422,
      "INVALID_LEAD_PAYLOAD",
      "Please check the required fields.",
      validation.issues,
    );
  }

  const endpoint = process.env.LEAD_API_URL?.trim();
  const apiKey = process.env.LEAD_API_KEY?.trim();

  if (!endpoint || !apiKey) {
    return apiError(
      503,
      "LEAD_BACKEND_NOT_CONFIGURED",
      "Lead delivery is temporarily unavailable. Please contact us directly.",
    );
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(endpoint);
  } catch {
    return apiError(
      503,
      "LEAD_BACKEND_MISCONFIGURED",
      "Lead delivery is temporarily unavailable. Please contact us directly.",
    );
  }

  if (targetUrl.protocol !== "https:" && targetUrl.hostname !== "localhost") {
    return apiError(
      503,
      "LEAD_BACKEND_MISCONFIGURED",
      "Lead delivery is temporarily unavailable. Please contact us directly.",
    );
  }

  const currentUrl = new URL(request.url);
  if (
    targetUrl.origin === currentUrl.origin &&
    targetUrl.pathname.replace(/\/$/, "") ===
      currentUrl.pathname.replace(/\/$/, "")
  ) {
    return apiError(
      503,
      "LEAD_BACKEND_RECURSIVE_URL",
      "Lead delivery is temporarily unavailable. Please contact us directly.",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FORWARD_TIMEOUT_MS);

  try {
    const upstream = await fetch(targetUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validation.data),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!upstream.ok) {
      return apiError(
        502,
        "LEAD_BACKEND_REJECTED",
        "Lead delivery failed. Please try again.",
        { upstreamStatus: upstream.status },
      );
    }

    return Response.json(
      { ok: true },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(
      502,
      error instanceof Error && error.name === "AbortError"
        ? "LEAD_BACKEND_TIMEOUT"
        : "LEAD_BACKEND_UNAVAILABLE",
      "Lead delivery failed. Please try again.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
