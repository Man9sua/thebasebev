import assert from "node:assert/strict";
import relay from "../workers/staging-lead-relay/worker.mjs";

const env = {
  LEAD_RELAY_AUTH_TOKEN: "audit-token",
  ODOO_WEBHOOK: "https://odoo.example.test/web/hook/audit",
};

function request({ token = "audit-token", body = { name: "Audit" } } = {}) {
  return new Request("https://the-base-staging-leads.example.workers.dev", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

const originalFetch = globalThis.fetch;
let forwarded = null;

try {
  const unauthorized = await relay.fetch(request({ token: "wrong" }), env);
  assert.equal(unauthorized.status, 401, "rejects unauthorised relay callers");

  const invalid = await relay.fetch(request({ body: [] }), env);
  assert.equal(invalid.status, 400, "rejects non-object JSON bodies");

  globalThis.fetch = async (url, init) => {
    forwarded = { url: String(url), init };
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };

  const delivered = await relay.fetch(request({ body: { name: "Audit", email: "audit@example.test" } }), env);
  assert.equal(delivered.status, 200, "confirms a successful Odoo response");
  assert.equal(forwarded.url, env.ODOO_WEBHOOK, "forwards only to the configured Odoo webhook");
  assert.equal(forwarded.init.method, "POST", "forwards using POST");

  globalThis.fetch = async () => new Response("Odoo failed", { status: 500 });
  const rejected = await relay.fetch(request(), env);
  assert.equal(rejected.status, 502, "does not report delivery when Odoo rejects it");

  console.log("Staging lead relay audit passed: authentication, validation, forwarding, and Odoo failure propagation.");
} finally {
  globalThis.fetch = originalFetch;
}
