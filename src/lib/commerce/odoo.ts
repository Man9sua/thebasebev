import type { CommerceOrder } from "./types";
import { CommerceIntegrationError } from "./errors";

type JsonRecord = Record<string, unknown>;

export type OdooProductMapping = Readonly<{
  productId: number;
  defaultCode: string;
}>;

export type OdooCommerceResult = Readonly<{
  partnerId: number;
  shippingPartnerId?: number | null;
  saleOrderId: number;
  saleOrderName: string;
  mappings: readonly Readonly<{
    productKey: string;
    odooProductId: number;
    odooDefaultCode: string;
  }> [];
}>;

export interface OdooCommerceService {
  fulfill(order: CommerceOrder): Promise<OdooCommerceResult>;
  health(): Promise<{ version: string; json2: boolean }>;
}

export type OdooConfiguration = Readonly<{
  baseUrl: URL;
  apiKey: string;
  database?: string;
  productMappings: Readonly<Record<string, OdooProductMapping>>;
  shippingProduct?: OdooProductMapping;
}>;

function parseMapping(value: string | undefined) {
  if (!value?.trim()) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new CommerceIntegrationError("ODOO_PRODUCT_MAPPING_INVALID");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new CommerceIntegrationError("ODOO_PRODUCT_MAPPING_INVALID");
  }
  const mappings: Record<string, OdooProductMapping> = {};
  for (const [productKey, mapping] of Object.entries(parsed)) {
    if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) {
      throw new CommerceIntegrationError("ODOO_PRODUCT_MAPPING_INVALID");
    }
    const candidate = mapping as JsonRecord;
    if (
      !Number.isInteger(candidate.productId) ||
      Number(candidate.productId) <= 0 ||
      typeof candidate.defaultCode !== "string" ||
      !candidate.defaultCode.trim()
    ) {
      throw new CommerceIntegrationError("ODOO_PRODUCT_MAPPING_INVALID");
    }
    mappings[productKey] = {
      productId: Number(candidate.productId),
      defaultCode: candidate.defaultCode.trim(),
    };
  }
  return mappings;
}

function parseShippingProduct(environment: Record<string, string | undefined>) {
  if (!environment.ODOO_SHIPPING_PRODUCT_ID && !environment.ODOO_SHIPPING_DEFAULT_CODE) {
    return undefined;
  }
  const productId = Number(environment.ODOO_SHIPPING_PRODUCT_ID);
  const defaultCode = environment.ODOO_SHIPPING_DEFAULT_CODE?.trim();
  if (!Number.isInteger(productId) || productId <= 0 || !defaultCode) {
    throw new CommerceIntegrationError("ODOO_SHIPPING_PRODUCT_MAPPING_INVALID");
  }
  return { productId, defaultCode };
}

export function getOdooCommerceConfiguration(
  environment: Record<string, string | undefined>,
): OdooConfiguration | null {
  if (environment.ODOO_COMMERCE_ENABLED?.trim().toLowerCase() !== "true") {
    return null;
  }
  const apiKey = environment.ODOO_API_KEY?.trim();
  const rawUrl = environment.ODOO_URL?.trim();
  if (!apiKey || !rawUrl) {
    throw new CommerceIntegrationError("ODOO_COMMERCE_CREDENTIALS_MISSING");
  }
  return {
    baseUrl: new URL(rawUrl),
    apiKey,
    database: environment.ODOO_DATABASE?.trim() || undefined,
    productMappings: parseMapping(environment.ODOO_PRODUCT_MAPPING_JSON),
    shippingProduct: parseShippingProduct(environment),
  };
}

type OdooFetch = typeof fetch;

class OdooJson2Client {
  constructor(
    private readonly configuration: OdooConfiguration,
    private readonly fetcher: OdooFetch = fetch,
  ) {}

  private headers() {
    const headers: Record<string, string> = {
      Authorization: `bearer ${this.configuration.apiKey}`,
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "THE-BASE-Commerce/1.0",
    };
    if (this.configuration.database) {
      headers["X-Odoo-Database"] = this.configuration.database;
    }
    return headers;
  }

  async version() {
    const response = await this.fetcher(new URL("/web/version", this.configuration.baseUrl), {
      headers: { "User-Agent": "THE-BASE-Commerce/1.0" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) {
      throw new CommerceIntegrationError("ODOO_VERSION_UNAVAILABLE", true);
    }
    const body = (await response.json()) as JsonRecord;
    const payload =
      body.result && typeof body.result === "object" && !Array.isArray(body.result)
        ? (body.result as JsonRecord)
        : body;
    return String(
      payload.server_version ?? payload.version ?? payload.server_serie ?? "",
    );
  }

  async call<T>(model: string, method: string, body: JsonRecord = {}) {
    let response: Response;
    try {
      response = await this.fetcher(
        new URL(`/json/2/${model}/${method}`, this.configuration.baseUrl),
        {
          method: "POST",
          headers: this.headers(),
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(12_000),
        },
      );
    } catch {
      throw new CommerceIntegrationError("ODOO_REQUEST_FAILED", true);
    }
    if (!response.ok) {
      throw new CommerceIntegrationError(
        response.status >= 500 ? "ODOO_UPSTREAM_UNAVAILABLE" : "ODOO_REQUEST_REJECTED",
        response.status >= 500 || response.status === 429,
      );
    }
    return (await response.json()) as T;
  }
}

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() || null;
}

function normalizePhone(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function addressValues(order: CommerceOrder, countryId?: number | null) {
  const address = order.shippingAddress;
  return {
    street: address?.line1 || undefined,
    street2: address?.line2 || undefined,
    city: address?.city || undefined,
    state_id: undefined,
    zip: address?.postalCode || undefined,
    country_id: countryId || undefined,
  };
}

function withoutUndefined(input: JsonRecord) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}

export class Json2OdooCommerceService implements OdooCommerceService {
  private readonly client: OdooJson2Client;

  constructor(
    private readonly configuration: OdooConfiguration,
    fetcher: OdooFetch = fetch,
  ) {
    this.client = new OdooJson2Client(configuration, fetcher);
  }

  async health() {
    const version = await this.client.version();
    if (!/^19\./.test(version)) {
      throw new CommerceIntegrationError("ODOO_JSON2_VERSION_UNSUPPORTED");
    }
    await this.client.call("res.users", "context_get");
    return { version, json2: true };
  }

  private async validateMappings(order: CommerceOrder) {
    const mappings = order.items.map((item) => {
      const mapping = this.configuration.productMappings[item.productKey];
      if (!mapping) {
        throw new CommerceIntegrationError("ODOO_PRODUCT_MAPPING_INCOMPLETE");
      }
      return { productKey: item.productKey, ...mapping };
    });
    const products = await this.client.call<JsonRecord[]>(
      "product.product",
      "search_read",
      {
        domain: [["id", "in", mappings.map((mapping) => mapping.productId)]],
        fields: ["id", "name", "default_code", "active", "sale_ok"],
        limit: mappings.length,
      },
    );
    const byId = new Map(products.map((product) => [Number(product.id), product]));
    for (const mapping of mappings) {
      const product = byId.get(mapping.productId);
      if (
        !product ||
        product.active !== true ||
        product.sale_ok !== true ||
        String(product.default_code ?? "") !== mapping.defaultCode
      ) {
        throw new CommerceIntegrationError("ODOO_PRODUCT_MAPPING_MISMATCH");
      }
    }
    return mappings.map((mapping) => ({
      productKey: mapping.productKey,
      odooProductId: mapping.productId,
      odooDefaultCode: mapping.defaultCode,
    }));
  }

  private async countryId(countryCode: string | null | undefined) {
    if (!countryCode) return null;
    const countries = await this.client.call<JsonRecord[]>(
      "res.country",
      "search_read",
      {
        domain: [["code", "=", countryCode.toUpperCase()]],
        fields: ["id"],
        limit: 1,
      },
    );
    return countries.length === 1 ? Number(countries[0].id) : null;
  }

  private async findOrCreatePartner(order: CommerceOrder) {
    const email = normalizeEmail(order.customerEmail);
    const phone = normalizePhone(order.customerPhone);
    const domain = email
      ? [["email", "=ilike", email]]
      : phone
        ? [["phone", "=", phone]]
        : null;
    if (!domain) {
      throw new CommerceIntegrationError("ODOO_CUSTOMER_IDENTITY_MISSING");
    }
    const existing = await this.client.call<JsonRecord[]>(
      "res.partner",
      "search_read",
      {
        domain,
        fields: ["id", "name", "email", "phone"],
        order: "id asc",
        limit: 2,
      },
    );
    if (existing.length) return Number(existing[0].id);

    const countryId = await this.countryId(order.billingAddress?.country);
    const partnerId = await this.client.call<number>("res.partner", "create", {
      vals_list: [
        withoutUndefined({
          name: order.customerName?.trim() || email || phone || order.internalReference,
          email: email || undefined,
          phone: phone || undefined,
          country_id: countryId || undefined,
          type: "contact",
          customer_rank: 1,
        }),
      ],
    });
    return Number(partnerId);
  }

  private async findOrCreateShippingPartner(order: CommerceOrder, partnerId: number) {
    const address = order.shippingAddress;
    if (!address?.line1 && !address?.city && !address?.postalCode) return null;
    const domain: unknown[] = [
      ["parent_id", "=", partnerId],
      ["type", "=", "delivery"],
      ["street", "=", address.line1 || false],
      ["zip", "=", address.postalCode || false],
    ];
    const existing = await this.client.call<JsonRecord[]>(
      "res.partner",
      "search_read",
      { domain, fields: ["id"], order: "id asc", limit: 1 },
    );
    if (existing.length) return Number(existing[0].id);

    const countryId = await this.countryId(address.country);
    const shippingId = await this.client.call<number>("res.partner", "create", {
      vals_list: [
        withoutUndefined({
          parent_id: partnerId,
          type: "delivery",
          name: order.customerName?.trim() || "Delivery address",
          ...addressValues(order, countryId),
        }),
      ],
    });
    return Number(shippingId);
  }

  private async aedPricelistId() {
    const currencies = await this.client.call<JsonRecord[]>(
      "res.currency",
      "search_read",
      { domain: [["name", "=", "AED"]], fields: ["id"], limit: 1 },
    );
    if (currencies.length !== 1) {
      throw new CommerceIntegrationError("ODOO_AED_CURRENCY_NOT_FOUND");
    }
    const pricelists = await this.client.call<JsonRecord[]>(
      "product.pricelist",
      "search_read",
      {
        domain: [
          ["currency_id", "=", Number(currencies[0].id)],
          ["active", "=", true],
        ],
        fields: ["id"],
        order: "id asc",
        limit: 2,
      },
    );
    if (pricelists.length !== 1) {
      throw new CommerceIntegrationError("ODOO_AED_PRICELIST_AMBIGUOUS");
    }
    return Number(pricelists[0].id);
  }

  private async findExistingOrder(order: CommerceOrder) {
    const records = await this.client.call<JsonRecord[]>(
      "sale.order",
      "search_read",
      {
        domain: [["client_order_ref", "=", order.internalReference]],
        fields: ["id", "name", "state", "amount_total", "currency_id"],
        order: "id asc",
        limit: 2,
      },
    );
    if (records.length > 1) {
      throw new CommerceIntegrationError("ODOO_DUPLICATE_SALE_ORDER_DETECTED");
    }
    return records[0] ?? null;
  }

  async fulfill(order: CommerceOrder): Promise<OdooCommerceResult> {
    await this.health();
    const mappings = await this.validateMappings(order);
    if (order.amountDiscount || order.amountTax) {
      throw new CommerceIntegrationError("ODOO_DISCOUNT_TAX_MAPPING_NOT_CONFIGURED");
    }
    if (order.amountShipping && !this.configuration.shippingProduct) {
      throw new CommerceIntegrationError("ODOO_SHIPPING_PRODUCT_NOT_CONFIGURED");
    }

    const partnerId = await this.findOrCreatePartner(order);
    const shippingPartnerId = await this.findOrCreateShippingPartner(order, partnerId);
    const pricelistId = await this.aedPricelistId();
    const existing = await this.findExistingOrder(order);
    let saleOrderId: number;

    if (existing) {
      saleOrderId = Number(existing.id);
    } else {
      const mappingByKey = new Map(mappings.map((mapping) => [mapping.productKey, mapping]));
      const orderLines = order.items.map((item) => {
        const mapping = mappingByKey.get(item.productKey);
        if (!mapping) throw new CommerceIntegrationError("ODOO_PRODUCT_MAPPING_INCOMPLETE");
        return [
          0,
          0,
          {
            product_id: mapping.odooProductId,
            product_uom_qty: item.quantity,
            price_unit: item.unitAmount / 100,
          },
        ];
      });
      if (order.amountShipping && this.configuration.shippingProduct) {
        orderLines.push([
          0,
          0,
          {
            product_id: this.configuration.shippingProduct.productId,
            product_uom_qty: 1,
            price_unit: order.amountShipping / 100,
          },
        ]);
      }
      saleOrderId = Number(
        await this.client.call<number>("sale.order", "create", {
          vals_list: [
            {
              partner_id: partnerId,
              partner_shipping_id: shippingPartnerId || partnerId,
              pricelist_id: pricelistId,
              client_order_ref: order.internalReference,
              origin: `Stripe ${order.stripeSessionId ?? "checkout"}`,
              note: `THE BASE website order ${order.internalReference}`,
              order_line: orderLines,
            },
          ],
        }),
      );
    }

    const [saleOrder] = await this.client.call<JsonRecord[]>(
      "sale.order",
      "read",
      {
        ids: [saleOrderId],
        fields: ["id", "name", "state", "amount_total", "currency_id"],
      },
    );
    if (!saleOrder) throw new CommerceIntegrationError("ODOO_SALE_ORDER_NOT_FOUND");
    const amountMinor = Math.round(Number(saleOrder.amount_total) * 100);
    if (Math.abs(amountMinor - order.amountTotal) > 1) {
      throw new CommerceIntegrationError("ODOO_STRIPE_AMOUNT_MISMATCH");
    }

    if (saleOrder.state !== "sale" && saleOrder.state !== "done") {
      await this.client.call("sale.order", "action_confirm", { ids: [saleOrderId] });
    }
    const [confirmed] = await this.client.call<JsonRecord[]>("sale.order", "read", {
      ids: [saleOrderId],
      fields: ["id", "name", "state"],
    });
    if (!confirmed || (confirmed.state !== "sale" && confirmed.state !== "done")) {
      throw new CommerceIntegrationError("ODOO_SALE_ORDER_CONFIRMATION_FAILED");
    }

    return {
      partnerId,
      shippingPartnerId,
      saleOrderId,
      saleOrderName: String(confirmed.name ?? saleOrderId),
      mappings,
    };
  }
}

export function createOdooCommerceService(
  environment: Record<string, string | undefined>,
  fetcher: OdooFetch = fetch,
) {
  const configuration = getOdooCommerceConfiguration(environment);
  return configuration
    ? new Json2OdooCommerceService(configuration, fetcher)
    : null;
}
