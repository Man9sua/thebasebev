import fs from "node:fs";
import { paymentEnvironment, saveLivePaymentValues, odooClient, reportPaymentSetupFailure } from "./lib/payment-environment.mjs";

async function main() {
  const mode = process.argv[process.argv.indexOf("--mode") + 1];
  if (mode !== "test" && mode !== "live") throw new Error("EXPLICIT_RECEIVER_MODE_REQUIRED");
  const apply = process.argv.includes("--apply");
  const test = mode === "test";
  const odoo = odooClient(paymentEnvironment());
  const name = `THE BASE Stripe ${test ? "Test" : "Live"} — paid draft quotation`;
  const template = fs.readFileSync("integrations/odoo/stripe-quotation.py", "utf8");
  if (template.split("receiver_test_mode = True").length !== 2) throw new Error("RECEIVER_TEMPLATE_INVALID");
  const code = test ? template : template.replace("receiver_test_mode = True", "receiver_test_mode = False");
  const models = await odoo("ir.model", "search_read", { domain: [["model", "=", "sale.order"]], fields: ["id"], limit: 1 });
  if (models.length !== 1) throw new Error("SALE_MODEL_NOT_FOUND");
  const actions = await odoo("ir.actions.server", "search_read", { domain: [["name", "=", name]], fields: ["id", "name", "code", "model_id", "binding_model_id"], limit: 2 });
  if (actions.length > 1) throw new Error("DUPLICATE_RECEIVER_ACTIONS");
  const existing = actions[0];
  if (existing && (existing.model_id[0] !== models[0].id || existing.binding_model_id || existing.code !== code)) throw new Error("EXISTING_RECEIVER_REVIEW_REQUIRED");
  let id = existing?.id;
  if (apply && !id) {
    const created = await odoo("ir.actions.server", "create", { vals_list: [{ name, model_id: models[0].id, state: "code", code }] });
    id = Array.isArray(created) ? created[0] : created;
  }
  if (apply && !test && Number.isSafeInteger(id) && id > 0) saveLivePaymentValues({ ODOO_LIVE_ACTION_ID: String(id) });
  console.log(JSON.stringify({ mode, apply, installed: Boolean(id), actionId: id ?? null, automaticTriggers: false, quotationsCreated: 0 }));
}

main().catch(reportPaymentSetupFailure);
