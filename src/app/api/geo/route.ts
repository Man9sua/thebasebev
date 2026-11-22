export const dynamic = "force-dynamic";

/**
 * The visitor's country as Cloudflare reports it (`CF-IPCountry`), for the
 * "Go to <market> site?" prompt. Never cached and never used to redirect;
 * outside Cloudflare (local runs) the country is simply unknown.
 */
export function GET(request: Request) {
  const raw = request.headers.get("cf-ipcountry")?.toUpperCase() ?? "";
  const country = /^[A-Z]{2}$/.test(raw) && raw !== "XX" ? raw : null;
  return Response.json({ country }, { headers: { "Cache-Control": "no-store" } });
}
