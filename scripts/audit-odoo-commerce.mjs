import fs from "node:fs";

const PRODUCT_NAMES = [
  "Sugar Free",
  "Frappe",
  "Iced Tea",
  "Chocolate",
  "Garnish",
  "Jam",
  "Milkshake",
  "Raf",
  "Cordial",
  "Cream Latte",
  "Chai Latte",
  "Syrup",
  "Matcha",
];

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
if (!environment.ODOO_URL || !environment.ODOO_API_KEY) {
  throw new Error("Read-only Odoo API credentials are unavailable.");
}

const baseUrl = new URL(environment.ODOO_URL);
const headers = {
  Authorization: `bearer ${environment.ODOO_API_KEY}`,
  "Content-Type": "application/json; charset=utf-8",
  "User-Agent": "THE-BASE-Commerce-Read-Only-Audit/1.0",
};
if (environment.ODOO_DATABASE) {
  headers["X-Odoo-Database"] = environment.ODOO_DATABASE;
}

async function json2(model, method, body = {}) {
  const response = await fetch(new URL(`/json/2/${model}/${method}`, baseUrl), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Odoo read-only ${model}.${method} failed with HTTP ${response.status}.`);
  }
  return response.json();
}

const versionResponse = await fetch(new URL("/web/version", baseUrl), {
  headers: { "User-Agent": headers["User-Agent"] },
});
if (!versionResponse.ok) {
  throw new Error(`Odoo version check failed with HTTP ${versionResponse.status}.`);
}
const version = await versionResponse.json();
const versionPayload =
  version?.result && typeof version.result === "object"
    ? version.result
    : version;
const context = await json2("res.users", "context_get");

const products = [];
for (const requestedName of PRODUCT_NAMES) {
  const candidates = await json2("product.product", "search_read", {
    domain: [
      ["name", "ilike", requestedName],
      ["sale_ok", "=", true],
      ["active", "=", true],
    ],
    fields: ["id", "name", "default_code", "sale_ok", "active"],
    order: "id asc",
    limit: 12,
  });
  products.push({
    requestedName,
    candidates: Array.isArray(candidates)
      ? candidates.map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          defaultCode: candidate.default_code || null,
          active: Boolean(candidate.active),
          saleOk: Boolean(candidate.sale_ok),
        }))
      : [],
  });
}

async function optionalRead(model, body) {
  try {
    return await json2(model, "search_read", body);
  } catch {
    return null;
  }
}

const modules = await optionalRead("ir.module.module", {
  domain: [
    ["name", "in", ["sale", "sale_management", "account", "stock", "payment", "payment_stripe"]],
    ["state", "=", "installed"],
  ],
  fields: ["name", "shortdesc", "state"],
  order: "name asc",
  limit: 20,
});
const stripeProviders = await optionalRead("payment.provider", {
  domain: [["code", "=", "stripe"]],
  fields: ["id", "code", "state"],
  order: "id asc",
  limit: 10,
});

console.log(
  JSON.stringify(
    {
      mode: "READ_ONLY",
      version:
        versionPayload.server_version ??
        versionPayload.version ??
        versionPayload.server_serie ??
        null,
      json2Authenticated: Number.isInteger(context?.uid),
      databaseHeaderConfigured: Boolean(environment.ODOO_DATABASE),
      productCandidates: products,
      capabilities: {
        installedModules: Array.isArray(modules)
          ? modules.map((module) => ({ name: module.name, state: module.state }))
          : null,
        stripeProviders: Array.isArray(stripeProviders)
          ? stripeProviders.map((provider) => ({
              id: provider.id,
              code: provider.code,
              state: provider.state,
            }))
          : null,
      },
      secretsPrinted: false,
      piiRead: false,
      writesAttempted: false,
    },
    null,
    2,
  ),
);
