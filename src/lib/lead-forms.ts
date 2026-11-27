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

export function isLeadFormType(value: unknown): value is LeadFormType {
  return typeof value === "string" && LEAD_FORM_TYPE_SET.has(value);
}

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
  product?: string;
  message?: string;
  consent: boolean | null;
  submissionPage: string;
  clientTimestamp: string;
  order?: unknown;
};

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

  put(fields.name, lead.name);
  put(fields.email, lead.email);
  put(fields.phone, lead.phone);
  put("company", lead.company);
  put("country", lead.country);
  put("product", lead.product);

  put("tildaspec-formname", lead.formName);
  put("formname", lead.formName);
  put("formtype", lead.formType);

  put("landing_page", lead.landingPage);
  put("submission_page", lead.submissionPage);
  put("current_page", lead.submissionPage);
  put("source_path", new URL(lead.submissionPage).pathname || "/");
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

  put(fields.message, lead.message);

  if (lead.order !== undefined && lead.order !== null) {
    payload.order_json = JSON.stringify(lead.order);
  }

  return payload;
}
