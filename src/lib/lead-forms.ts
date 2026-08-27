/**
 * Central registry for THE BASE lead forms.
 *
 * The Odoo webhook behind the upstream Worker (`LEAD_API_URL`) was built against
 * the field names Tilda posts. The new Next.js forms use readable TypeScript
 * names, so every payload is translated back to the legacy vocabulary here —
 * in one place — before it leaves the server.
 *
 * Legacy names were audited from `tilda_export/project12027355`:
 *   - `files/page62585333body.html` (form860957415, "Contact Us") is the only
 *     lead form whose markup survived the export, and it carries the canonical
 *     `name` / `email` / `Phone` / `text` vocabulary.
 *   - Cart and order forms (form2989879303, form900152458, form2480420851) use
 *     the capitalised `Name` / `Email` / `Phone` / `Comments` variant.
 *   - The remaining Zero Block popups declare `data-elem-type='form'` but their
 *     fields are injected by the Tilda runtime, so their IDs and display names
 *     are the audited source of truth (see LEGACY_FORM_NAMES below).
 */

export const LEAD_FORM_TYPES = [
  "contact",
  "partner",
  "sample",
  "custom-flavour",
  "careers",
  "order",
] as const;

export type LeadFormType = (typeof LEAD_FORM_TYPES)[number];

const LEAD_FORM_TYPE_SET: ReadonlySet<string> = new Set(LEAD_FORM_TYPES);

/** Never trust a form type supplied by the browser without checking it here. */
export function isLeadFormType(value: unknown): value is LeadFormType {
  return typeof value === "string" && LEAD_FORM_TYPE_SET.has(value);
}

/**
 * Tilda form id → audited display name, as it currently reaches Odoo through
 * `tildaspec-formname`. Changing these strings changes what the sales team sees.
 */
export const LEGACY_FORM_NAMES: Readonly<Record<string, string>> = {
  form860957415: "Contact Us",
  form861442702: "Partner with Us",
  form1855213141: "Custom flavour",
  form861445930: "Custom flavour",
  form1855223381: "Free Sample",
  form861448872: "Free Sample",
  form1855232921: "Custom flavor for your brand",
  form861451973: "Custom flavor for your brand",
  form909008440: "Join Our Team",
  form2480420851: "Place order",
};

/** Tilda form id → internal form type. */
const FORM_TYPE_BY_ID: Readonly<Record<string, LeadFormType>> = {
  form860957415: "contact",
  form861442702: "partner",
  form1855213141: "custom-flavour",
  form861445930: "custom-flavour",
  form1855223381: "sample",
  form861448872: "sample",
  form1855232921: "custom-flavour",
  form861451973: "custom-flavour",
  form909008440: "careers",
  form2480420851: "order",
};

/** Lowercased `tildaspec-formname` → internal form type. */
const FORM_TYPE_BY_NAME: Readonly<Record<string, LeadFormType>> = {
  "contact us": "contact",
  "partner with us": "partner",
  "free sample": "sample",
  "custom flavour": "custom-flavour",
  "custom flavor": "custom-flavour",
  "custom flavour for your brand": "custom-flavour",
  "custom flavor for your brand": "custom-flavour",
  "join our team": "careers",
  "place order": "order",
};

/**
 * Resolve a form type from the legacy signals a Tilda form carries. Returns
 * `null` when neither signal is recognised so the caller can reject rather than
 * invent a type.
 */
export function resolveLeadFormType(
  formId: string | undefined,
  formName: string | undefined,
): LeadFormType | null {
  if (formId && FORM_TYPE_BY_ID[formId]) {
    return FORM_TYPE_BY_ID[formId];
  }

  const normalized = formName?.trim().toLowerCase();
  if (normalized && FORM_TYPE_BY_NAME[normalized]) {
    return FORM_TYPE_BY_NAME[normalized];
  }

  return null;
}

/** Display name to send when a form did not carry its own `tildaspec-formname`. */
export function defaultFormName(type: LeadFormType): string {
  switch (type) {
    case "contact":
      return "Contact Us";
    case "partner":
      return "Partner with Us";
    case "sample":
      return "Free Sample";
    case "custom-flavour":
      return "Custom flavour";
    case "careers":
      return "Join Our Team";
    case "order":
      return "Place order";
  }
}

/**
 * Field-name casing differs between Tilda block families. Cart-derived forms
 * (order) use the capitalised variant; Zero Block lead forms use the lowercase
 * one. Sending the wrong casing is what silently drops values in Odoo.
 */
type LegacyFieldNames = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const CAPITALISED_FIELDS: LegacyFieldNames = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  message: "Comments",
};

const LOWERCASE_FIELDS: LegacyFieldNames = {
  name: "name",
  email: "email",
  phone: "Phone",
  message: "text",
};

function legacyFieldNames(type: LeadFormType): LegacyFieldNames {
  return type === "order" ? CAPITALISED_FIELDS : LOWERCASE_FIELDS;
}

/**
 * Attribution travels with every lead. `utm_source=chatgpt.com` is a live B2B
 * referral source, so these keys must survive the translation unchanged.
 */
export type LeadAttributionFields = {
  landingPage: string;
  referrer: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
};

export type LegacyMappableLead = LeadAttributionFields & {
  formType: LeadFormType;
  formName: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  company?: string;
  message?: string;
  consent: boolean | null;
  submissionPage: string;
  clientTimestamp: string;
  order?: unknown;
};

/**
 * Translate an internal lead into the flat, Tilda-shaped object the existing
 * Odoo webhook already understands. Keys with no value are omitted rather than
 * sent empty, matching how Tilda posts optional fields.
 */
export function toTildaLeadPayload(
  lead: LegacyMappableLead,
  context?: { requestId?: string; receivedAt?: string },
): Record<string, string> {
  const fields = legacyFieldNames(lead.formType);
  const payload: Record<string, string> = {};

  const put = (key: string, value: string | null | undefined) => {
    if (typeof value === "string" && value.trim() !== "") {
      payload[key] = value.trim();
    }
  };

  // Business fields, under their legacy Tilda names.
  put(fields.name, lead.name);
  put(fields.email, lead.email);
  put(fields.phone, lead.phone);
  put("company", lead.company);
  put("country", lead.country);

  // Tilda always sends the form's display name; Odoo routes on it.
  put("tildaspec-formname", lead.formName);
  put("formname", lead.formName);
  put("formtype", lead.formType);

  // Attribution — first touch, preserved across the whole session.
  put("landing_page", lead.landingPage);
  put("current_page", lead.submissionPage);
  put("referrer", lead.referrer);
  put("utm_source", lead.utm_source);
  put("utm_medium", lead.utm_medium);
  put("utm_campaign", lead.utm_campaign);
  put("utm_content", lead.utm_content);
  put("utm_term", lead.utm_term);

  if (lead.consent !== null) {
    payload.consent = lead.consent ? "yes" : "no";
  }

  put("client_timestamp", lead.clientTimestamp);
  put("request_id", context?.requestId);
  put("server_timestamp", context?.receivedAt);

  // The current Odoo automation has no first-class fields for the complete
  // attribution contract. Keep the flat Tilda keys for compatible adapters and
  // also append a deterministic block to the existing message/description
  // channel so Odoo cannot silently discard first touch or the request id.
  const attributionLines = [
    "--- THE BASE ATTRIBUTION ---",
    `request_id: ${context?.requestId ?? "not-provided"}`,
    `server_timestamp: ${context?.receivedAt ?? "not-provided"}`,
    `client_timestamp: ${lead.clientTimestamp}`,
    `form_name: ${lead.formName}`,
    `form_type: ${lead.formType}`,
    `landing_page: ${lead.landingPage}`,
    `submission_page: ${lead.submissionPage}`,
    `referrer: ${lead.referrer || "direct"}`,
    `country: ${lead.country || "not-provided"}`,
    `utm_source: ${lead.utm_source || "not-provided"}`,
    `utm_medium: ${lead.utm_medium || "not-provided"}`,
    `utm_campaign: ${lead.utm_campaign || "not-provided"}`,
    `utm_content: ${lead.utm_content || "not-provided"}`,
    `utm_term: ${lead.utm_term || "not-provided"}`,
  ];
  put(
    fields.message,
    [lead.message?.trim(), attributionLines.join("\n")].filter(Boolean).join("\n\n"),
  );

  if (lead.order !== undefined && lead.order !== null) {
    payload.order_json = JSON.stringify(lead.order);
  }

  return payload;
}
