/**
 * Live staging lead test — sends ONE real submission through the full pipeline:
 *
 *   staging /api/leads → tilda-odoo Worker → Odoo
 *
 * This creates a real record a human has to look at. It is opt-in on purpose
 * and must never run in CI: without LEAD_LIVE_TEST=1 it refuses to do anything.
 *
 * Usage:
 *   LEAD_LIVE_TEST=1 npm run test:lead-live -- https://the-base-staging.mnsdemo.workers.dev
 */

if (process.env.CI) {
  console.error("Refusing to run a live lead test in CI.");
  process.exit(1);
}

if (process.env.LEAD_LIVE_TEST !== "1") {
  console.error(
    "Live lead test is opt-in. Re-run with LEAD_LIVE_TEST=1 once you are ready\n" +
      "to create a real record that someone must then verify in Odoo.",
  );
  process.exit(1);
}

const baseUrl = (process.argv[2] ?? "").replace(/\/$/, "");
if (!baseUrl) {
  console.error("Usage: LEAD_LIVE_TEST=1 npm run test:lead-live -- <staging-url>");
  process.exit(1);
}

const target = new URL(baseUrl);
if (["thebasebev.com", "www.thebasebev.com"].includes(target.hostname.toLowerCase())) {
  console.error("Refusing to send a test lead to the production domain.");
  process.exit(1);
}

const testEmail = process.env.LEAD_LIVE_TEST_EMAIL;
if (!testEmail) {
  console.error(
    "Set LEAD_LIVE_TEST_EMAIL to a real team mailbox so the lead is traceable.",
  );
  process.exit(1);
}

const attribution =
  "?utm_source=chatgpt.com&utm_medium=referral&utm_campaign=migration-test";

const payload = {
  name: "TEST NEXT MIGRATION",
  email: testEmail,
  phone: "+971500000000",
  message: "STAGING NEXT.JS ODOO TEST — DO NOT CONTACT",
  formType: "contact",
  formName: "Contact Us",
  consent: true,
  landingPage: `${baseUrl}/matcha${attribution}`,
  submissionPage: `${baseUrl}/contacts`,
  referrer: "https://chatgpt.com/",
  utm_source: "chatgpt.com",
  utm_medium: "referral",
  utm_campaign: "migration-test",
  utm_content: null,
  utm_term: null,
  clientTimestamp: new Date().toISOString(),
};

const sentAt = new Date().toISOString();
const response = await fetch(`${baseUrl}/api/leads`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

const body = await response.json().catch(() => null);

console.log(
  [
    "Live staging lead test",
    "----------------------",
    `target:         ${baseUrl}`,
    `sent at:        ${sentAt}`,
    `form type:      ${payload.formType}`,
    `form name:      ${payload.formName}`,
    `attribution:    utm_source=chatgpt.com utm_medium=referral utm_campaign=migration-test`,
    `HTTP status:    ${response.status}`,
    `request id:     ${body?.requestId ?? "(none returned)"}`,
    `response:       ${JSON.stringify(body)}`,
    "",
    response.ok
      ? "PENDING HUMAN CONFIRMATION — check Odoo for this lead and confirm the fields arrived."
      : "FAILED — the lead was not accepted; nothing should have reached Odoo.",
  ].join("\n"),
);

process.exitCode = response.ok ? 0 : 1;
