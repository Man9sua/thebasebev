import fs from "node:fs";
import { parseEnv } from "node:util";

export function paymentEnvironment() {
  const values = {};
  for (const file of [".env", ".env.local"]) {
    if (fs.existsSync(file)) Object.assign(values, parseEnv(fs.readFileSync(file, "utf8")));
  }
  return { ...values, ...process.env };
}

export function saveLivePaymentValues(values) {
  const file = ".env.local";
  let text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  for (const [name, value] of Object.entries(values)) {
    if (!/^(?:STRIPE_LIVE_(?:ACCOUNT_ID|SECRET_KEY|RESTRICTED_KEY|WEBHOOK_SECRET|UAE_VAT_RATE_ID)|SHOP_LIVE_(?:ORIGIN|ADDITIONAL_ORIGINS)|ODOO_LIVE_ACTION_ID)$/.test(name)
      || typeof value !== "string" || /[\r\n]/.test(value)) throw new Error("INVALID_LIVE_CONFIGURATION");
    const pattern = new RegExp(`^${name}=.*$`, "m");
    const line = `${name}=${JSON.stringify(value)}`;
    text = pattern.test(text) ? text.replace(pattern, () => line) : text.replace(/\s*$/, "\n") + line + "\n";
  }
  fs.writeFileSync(file, text);
}

export function reportPaymentSetupFailure(error) {
  console.error(JSON.stringify({ ok: false,
    code: /^[A-Z_0-9]+$/.test(error?.message ?? "") ? error.message : "PAYMENT_SETUP_FAILED",
    status: Number.isInteger(error?.statusCode) ? error.statusCode : null,
    providerCode: typeof error?.code === "string" && /^[a-z_]+$/.test(error.code) ? error.code : null,
    requiredPermissions: [...new Set((error?.message ?? "").match(/rak_[a-z_:]+/g) ?? [])],
    secretsPrinted: false,
  }));
  process.exitCode = 1;
}

export function odooClient(environment) {
  if (!environment.ODOO_API_KEY || new URL(environment.ODOO_URL ?? "https://invalid.example").origin !== "https://odoo.thebasebev.com") throw new Error("ODOO_NOT_CONFIGURED");
  return async (model, method, data) => {
    const response = await fetch(`https://odoo.thebasebev.com/json/2/${model}/${method}`, {
      method: "POST", redirect: "manual", signal: AbortSignal.timeout(25000),
      headers: { Authorization: `bearer ${environment.ODOO_API_KEY}`, "Content-Type": "application/json",
        ...(environment.ODOO_DATABASE ? { "X-Odoo-Database": environment.ODOO_DATABASE } : {}) },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`ODOO_HTTP_${response.status}`);
    return response.json();
  };
}
