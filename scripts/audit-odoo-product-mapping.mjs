import fs from "node:fs";

const PRODUCTS = [
  ["sugar-free", "194500823312", "Sugar Free"],
  ["frappe", "207187094752", "Frappe"],
  ["iced-tea", "293702296702", "Iced Tea"],
  ["chocolate", "296069682122", "Chocolate"],
  ["garnish", "316933484392", "Garnish"],
  ["jam", "324849428612", "Jam"],
  ["milkshake", "389328196132", "Milkshake"],
  ["raf-coffee", "466013811412", "Raf Coffee"],
  ["cordial", "778280145182", "Cordial"],
  ["cream-latte", "781170478702", "Cream Latte"],
  ["chai-latte", "827401503212", "Chai Latte"],
  ["sugar-syrup", "888812727292", "Sugar Syrup"],
  ["matcha", "975474893862", "Matcha"],
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
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      values[key] = value;
    }
  }
  return { ...values, ...process.env };
}

function parseMappings(raw) {
  if (!raw?.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

const environment = loadIgnoredEnvironment();
const mappings = parseMappings(environment.ODOO_PRODUCT_MAPPING_JSON);
const canVerify = Boolean(environment.ODOO_URL && environment.ODOO_API_KEY);
let mappedProducts = [];

if (canVerify && Object.keys(mappings).length) {
  const headers = {
    Authorization: `bearer ${environment.ODOO_API_KEY}`,
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "THE-BASE-Commerce-Mapping-Audit/1.0",
  };
  if (environment.ODOO_DATABASE) headers["X-Odoo-Database"] = environment.ODOO_DATABASE;
  const ids = Object.values(mappings)
    .map((mapping) => Number(mapping?.productId))
    .filter((value) => Number.isInteger(value) && value > 0);
  if (ids.length) {
    const response = await fetch(new URL("/json/2/product.product/search_read", environment.ODOO_URL), {
      method: "POST",
      headers,
      body: JSON.stringify({
        domain: [["id", "in", ids]],
        fields: ["id", "name", "default_code", "active", "sale_ok"],
        limit: ids.length,
      }),
    });
    if (!response.ok) throw new Error(`Odoo mapping audit failed with HTTP ${response.status}.`);
    mappedProducts = await response.json();
  }
}

const byId = new Map(mappedProducts.map((product) => [Number(product.id), product]));
const rows = PRODUCTS.map(([productKey, websiteProductId, websiteName]) => {
  const mapping = mappings[productKey];
  const product = mapping ? byId.get(Number(mapping.productId)) : null;
  const matches = Boolean(
    mapping &&
      product &&
      product.active === true &&
      product.sale_ok === true &&
      String(product.default_code ?? "") === String(mapping.defaultCode ?? ""),
  );
  return {
    websiteProduct: websiteName,
    websiteSku: `web:${websiteProductId}`,
    odooProductId: mapping?.productId ?? null,
    odooProductName: product?.name ?? null,
    mappingStatus: matches ? "PASS" : mapping ? "MISMATCH_OR_UNVERIFIED" : "UNMAPPED",
  };
});

console.log(JSON.stringify({
  mode: "READ_ONLY",
  overall: rows.every((row) => row.mappingStatus === "PASS") ? "PASS" : "BLOCKED",
  credentialsAvailable: canVerify,
  products: rows,
  secretsPrinted: false,
  writesAttempted: false,
}, null, 2));

if (!rows.every((row) => row.mappingStatus === "PASS")) process.exitCode = 2;
