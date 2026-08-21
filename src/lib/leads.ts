export const LEAD_UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type LeadUtmKey = (typeof LEAD_UTM_KEYS)[number];

export type FirstTouchAttribution = {
  landingPage: string;
  referrer: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
};

export type LeadOrderItem = {
  name: string;
  sku?: string;
  quantity?: number;
  unitPrice?: number;
};

export type LeadOrderContext = {
  cartId?: string;
  currency?: string;
  total?: number;
  items?: LeadOrderItem[];
};

export type LeadPayload = FirstTouchAttribution & {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  message?: string;
  formName: string;
  consent: boolean | null;
  submissionPage: string;
  order?: LeadOrderContext;
  clientTimestamp: string;
};

export type LeadValidationIssue = {
  field: string;
  message: string;
};

export type LeadValidationResult =
  | { ok: true; data: LeadPayload }
  | { ok: false; issues: LeadValidationIssue[] };

const MAX_URL_LENGTH = 4_096;
const MAX_TEXT_LENGTH = 4_000;
const MAX_SHORT_TEXT_LENGTH = 255;
const MAX_UTM_LENGTH = 512;
const MAX_ORDER_ITEMS = 100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredString(
  source: Record<string, unknown>,
  field: string,
  maxLength: number,
  issues: LeadValidationIssue[],
): string {
  const value = source[field];

  if (typeof value !== "string" || value.trim() === "") {
    issues.push({ field, message: `${field} is required` });
    return "";
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    issues.push({ field, message: `${field} is too long` });
  }

  return normalized.slice(0, maxLength);
}

function readOptionalString(
  source: Record<string, unknown>,
  field: string,
  maxLength: number,
  issues: LeadValidationIssue[],
): string | undefined {
  const value = source[field];

  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    issues.push({ field, message: `${field} must be a string` });
    return undefined;
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    issues.push({ field, message: `${field} is too long` });
  }

  return normalized.slice(0, maxLength) || undefined;
}

function readNullableUtm(
  source: Record<string, unknown>,
  field: LeadUtmKey,
  issues: LeadValidationIssue[],
): string | null {
  const value = source[field];

  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    issues.push({ field, message: `${field} must be a string or null` });
    return null;
  }

  const normalized = value.trim();
  if (normalized.length > MAX_UTM_LENGTH) {
    issues.push({ field, message: `${field} is too long` });
  }

  return normalized.slice(0, MAX_UTM_LENGTH) || null;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function readOptionalNumber(
  source: Record<string, unknown>,
  field: string,
  issues: LeadValidationIssue[],
): number | undefined {
  const value = source[field];
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    issues.push({ field, message: `${field} must be a non-negative number` });
    return undefined;
  }

  return value;
}

function readOrder(
  value: unknown,
  issues: LeadValidationIssue[],
): LeadOrderContext | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!isRecord(value)) {
    issues.push({ field: "order", message: "order must be an object" });
    return undefined;
  }

  const cartId = readOptionalString(
    value,
    "cartId",
    MAX_SHORT_TEXT_LENGTH,
    issues,
  );
  const currency = readOptionalString(value, "currency", 16, issues);
  const total = readOptionalNumber(value, "total", issues);
  let items: LeadOrderItem[] | undefined;

  if (value.items !== undefined) {
    if (!Array.isArray(value.items) || value.items.length > MAX_ORDER_ITEMS) {
      issues.push({
        field: "order.items",
        message: `order.items must contain at most ${MAX_ORDER_ITEMS} items`,
      });
    } else {
      items = value.items.flatMap((item, index) => {
        if (!isRecord(item)) {
          issues.push({
            field: `order.items.${index}`,
            message: "order item must be an object",
          });
          return [];
        }

        const itemIssues: LeadValidationIssue[] = [];
        const name = readRequiredString(
          item,
          "name",
          MAX_SHORT_TEXT_LENGTH,
          itemIssues,
        );
        const sku = readOptionalString(
          item,
          "sku",
          MAX_SHORT_TEXT_LENGTH,
          itemIssues,
        );
        const quantity = readOptionalNumber(item, "quantity", itemIssues);
        const unitPrice = readOptionalNumber(item, "unitPrice", itemIssues);

        issues.push(
          ...itemIssues.map((issue) => ({
            ...issue,
            field: `order.items.${index}.${issue.field}`,
          })),
        );

        return [{ name, sku, quantity, unitPrice }];
      });
    }
  }

  return { cartId, currency, total, items };
}

export function createFirstTouchAttribution(
  landingPage: string,
  referrer: string,
  searchParams: URLSearchParams,
): FirstTouchAttribution {
  const query = new Map<string, string>();
  searchParams.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();
    if (!query.has(normalizedKey)) {
      query.set(normalizedKey, value);
    }
  });

  return {
    landingPage,
    referrer,
    utm_source: query.get("utm_source") || null,
    utm_medium: query.get("utm_medium") || null,
    utm_campaign: query.get("utm_campaign") || null,
    utm_content: query.get("utm_content") || null,
    utm_term: query.get("utm_term") || null,
  };
}

export function parseFirstTouchAttribution(
  value: unknown,
): FirstTouchAttribution | null {
  if (!isRecord(value)) {
    return null;
  }

  const issues: LeadValidationIssue[] = [];
  const landingPage = readRequiredString(
    value,
    "landingPage",
    MAX_URL_LENGTH,
    issues,
  );
  const referrer = readOptionalString(
    value,
    "referrer",
    MAX_URL_LENGTH,
    issues,
  );
  const attribution: FirstTouchAttribution = {
    landingPage,
    referrer: referrer ?? "",
    utm_source: readNullableUtm(value, "utm_source", issues),
    utm_medium: readNullableUtm(value, "utm_medium", issues),
    utm_campaign: readNullableUtm(value, "utm_campaign", issues),
    utm_content: readNullableUtm(value, "utm_content", issues),
    utm_term: readNullableUtm(value, "utm_term", issues),
  };

  return issues.length === 0 && isHttpUrl(landingPage) ? attribution : null;
}

export function validateLeadPayload(input: unknown): LeadValidationResult {
  if (!isRecord(input)) {
    return {
      ok: false,
      issues: [{ field: "payload", message: "payload must be an object" }],
    };
  }

  const issues: LeadValidationIssue[] = [];
  const name = readRequiredString(
    input,
    "name",
    MAX_SHORT_TEXT_LENGTH,
    issues,
  );
  const email = readRequiredString(
    input,
    "email",
    MAX_SHORT_TEXT_LENGTH,
    issues,
  ).toLowerCase();
  const formName = readRequiredString(
    input,
    "formName",
    MAX_SHORT_TEXT_LENGTH,
    issues,
  );
  const landingPage = readRequiredString(
    input,
    "landingPage",
    MAX_URL_LENGTH,
    issues,
  );
  const submissionPage = readRequiredString(
    input,
    "submissionPage",
    MAX_URL_LENGTH,
    issues,
  );
  const clientTimestamp = readRequiredString(
    input,
    "clientTimestamp",
    64,
    issues,
  );

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    issues.push({ field: "email", message: "email is invalid" });
  }
  if (landingPage && !isHttpUrl(landingPage)) {
    issues.push({ field: "landingPage", message: "landingPage is invalid" });
  }
  if (submissionPage && !isHttpUrl(submissionPage)) {
    issues.push({
      field: "submissionPage",
      message: "submissionPage is invalid",
    });
  }
  if (clientTimestamp && !Number.isFinite(Date.parse(clientTimestamp))) {
    issues.push({
      field: "clientTimestamp",
      message: "clientTimestamp is invalid",
    });
  }

  const consentValue = input.consent;
  let consent: boolean | null = null;
  if (consentValue === null || consentValue === undefined) {
    consent = null;
  } else if (typeof consentValue === "boolean") {
    consent = consentValue;
  } else {
    issues.push({ field: "consent", message: "consent must be boolean or null" });
  }

  const data: LeadPayload = {
    name,
    email,
    phone: readOptionalString(
      input,
      "phone",
      MAX_SHORT_TEXT_LENGTH,
      issues,
    ),
    country: readOptionalString(input, "country", 128, issues),
    message: readOptionalString(input, "message", MAX_TEXT_LENGTH, issues),
    formName,
    consent,
    landingPage,
    submissionPage,
    referrer:
      readOptionalString(input, "referrer", MAX_URL_LENGTH, issues) ?? "",
    utm_source: readNullableUtm(input, "utm_source", issues),
    utm_medium: readNullableUtm(input, "utm_medium", issues),
    utm_campaign: readNullableUtm(input, "utm_campaign", issues),
    utm_content: readNullableUtm(input, "utm_content", issues),
    utm_term: readNullableUtm(input, "utm_term", issues),
    order: readOrder(input.order, issues),
    clientTimestamp,
  };

  return issues.length === 0 ? { ok: true, data } : { ok: false, issues };
}
