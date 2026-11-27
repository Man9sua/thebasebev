export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const raw = request.headers.get("cf-ipcountry")?.toUpperCase() ?? "";
  const country = /^[A-Z]{2}$/.test(raw) && raw !== "XX" ? raw : null;
  return Response.json({ country }, { headers: { "Cache-Control": "no-store" } });
}
