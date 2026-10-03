import fs from "node:fs";

function loadIgnoredEnvironment() {
  const values = {};
  for (const file of [".env", ".env.local"]) {
    if (!fs.existsSync(file)) continue;
    for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator < 1) continue;
      const key = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      values[key] = value;
    }
  }
  return { ...values, ...process.env };
}

const environment = loadIgnoredEnvironment();
const requestId = environment.ODOO_TEST_LEAD_REQUEST_ID?.trim();
const expectedEmail = environment.ODOO_TEST_LEAD_EMAIL?.trim().toLowerCase();

if (!requestId || !/^[0-9a-f-]{36}$/i.test(requestId)) {
  throw new Error("ODOO_TEST_LEAD_REQUEST_ID must be the UUID returned by the controlled lead test.");
}
if (!expectedEmail) {
  throw new Error("ODOO_TEST_LEAD_EMAIL is required for a boolean field-mapping check.");
}
if (!environment.ODOO_URL || !environment.ODOO_API_KEY) {
  throw new Error("Read-only Odoo API credentials are unavailable.");
}

const baseUrl = new URL(environment.ODOO_URL);
const headers = {
  Authorization: `bearer ${environment.ODOO_API_KEY}`,
  "Content-Type": "application/json; charset=utf-8",
  "User-Agent": "THE-BASE-Controlled-Lead-Verification/1.0",
};
if (environment.ODOO_DATABASE) {
  headers["X-Odoo-Database"] = environment.ODOO_DATABASE;
}

const response = await fetch(new URL("/json/2/crm.lead/search_read", baseUrl), {
  method: "POST",
  headers,
  body: JSON.stringify({
    domain: [["description", "ilike", requestId]],
    fields: [
      "create_date",
      "name",
      "contact_name",
      "email_from",
      "phone",
      "description",
      "source_id",
    ],
    order: "create_date desc",
    limit: 3,
  }),
});

if (!response.ok) {
  throw new Error(`Read-only Odoo lead verification failed with HTTP ${response.status}.`);
}

const records = await response.json();
const lead = Array.isArray(records) ? records[0] : null;
const description = String(lead?.description ?? "").toLowerCase();
const createdAt = lead?.create_date ? Date.parse(`${lead.create_date}Z`) : Number.NaN;
const sourceName = Array.isArray(lead?.source_id) ? String(lead.source_id[1] ?? "") : "";

const checks = {
  exactlyOneMatchingRecord: Array.isArray(records) && records.length === 1,
  createdRecently:
    Number.isFinite(createdAt) && Math.abs(Date.now() - createdAt) < 30 * 60 * 1_000,
  nameMapped:
    /test next migration/i.test(String(lead?.name ?? "")) ||
    /test next migration/i.test(String(lead?.contact_name ?? "")),
  emailMapped: String(lead?.email_from ?? "").trim().toLowerCase() === expectedEmail,
  phoneMapped: String(lead?.phone ?? "").replace(/\D/g, "").endsWith("500000000"),
  sourceMappedToTilda: /^tilda$/i.test(sourceName),
  markerPreserved: description.includes("staging next.js odoo test"),
  requestIdPreserved: description.includes(requestId.toLowerCase()),
  formNamePreserved: description.includes("form_name: contact us"),
  landingPagePreserved: description.includes("landing_page:") && description.includes("/matcha"),
  submissionPagePreserved: description.includes("submission_page:") && description.includes("/contacts"),
  referrerPreserved: description.includes("referrer: https://chatgpt.com/"),
  chatgptSourcePreserved: description.includes("utm_source: chatgpt.com"),
  utmMediumPreserved: description.includes("utm_medium: referral"),
  utmCampaignPreserved: description.includes("utm_campaign: migration-test"),
  timestampsPreserved:
    description.includes("server_timestamp:") && description.includes("client_timestamp:"),
};

console.log(JSON.stringify({ matchCount: Array.isArray(records) ? records.length : 0, checks }, null, 2));

if (!Object.values(checks).every(Boolean)) {
  process.exitCode = 1;
}
