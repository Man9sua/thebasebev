"use client";

import { useEffect } from "react";
import {
  createFirstTouchAttribution,
  parseFirstTouchAttribution,
  validateLeadPayload,
  type FirstTouchAttribution,
  type LeadPayload,
} from "@/lib/leads";

const FIRST_TOUCH_STORAGE_KEY = "thebase:first-touch-attribution:v1";

const OWNED_TILDA_FORM_IDS = new Set([
  "form861442702",
  "form1855213141",
  "form1855223381",
  "form1855232921",
  "form909008440",
  "form860957415",
  "form861445930",
  "form861448872",
  "form861451973",
]);

const OWNED_TILDA_FORM_NAMES = new Set([
  "partner with us",
  "custom flavour",
  "custom flavor",
  "free sample",
  "custom flavor for your brand",
  "custom flavour for your brand",
  "join our team",
  "contact us",
]);

const LEGACY_FORM_NAMES: Record<string, string> = {
  form861442702: "Partner with Us",
  form1855213141: "Custom flavour",
  form1855223381: "Free Sample",
  form1855232921: "Custom flavor for your brand",
  form909008440: "Join Our Team",
  form860957415: "Contact Us",
  form861445930: "Custom flavour",
  form861448872: "Free Sample",
  form861451973: "Custom flavor for your brand",
};

const COUNTRY_DIAL_CODES: Record<string, string> = {
  ae: "+971",
  ru: "+7",
  us: "+1",
  sa: "+966",
};

type DataLayerWindow = Window & {
  dataLayer?: Array<Record<string, unknown>>;
};

function getFirstTouchAttribution(): FirstTouchAttribution {
  const current = createFirstTouchAttribution(
    window.location.href,
    document.referrer,
    new URL(window.location.href).searchParams,
  );

  try {
    const stored = window.sessionStorage.getItem(FIRST_TOUCH_STORAGE_KEY);
    if (stored) {
      const parsed = parseFirstTouchAttribution(JSON.parse(stored));
      if (parsed) {
        return parsed;
      }
    }

    window.sessionStorage.setItem(
      FIRST_TOUCH_STORAGE_KEY,
      JSON.stringify(current),
    );
  } catch {
    // Privacy modes can make sessionStorage unavailable. Submission still works
    // with an in-memory first touch for the current page.
  }

  return current;
}

function getFormValue(formData: FormData, names: string[]): string | undefined {
  for (const name of names) {
    const value = formData
      .getAll(name)
      .find((candidate) => typeof candidate === "string" && candidate.trim());

    if (typeof value === "string") {
      return value.trim();
    }
  }

  return undefined;
}

function getFormName(form: HTMLFormElement, formData: FormData): string {
  return (
    getFormValue(formData, ["tildaspec-formname", "formName", "form_name"]) ??
    LEGACY_FORM_NAMES[form.id] ??
    "THE BASE lead form"
  );
}

function getConsent(form: HTMLFormElement): boolean | null {
  const checkbox = Array.from(
    form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
  ).find((input) => {
    const identity = `${input.name} ${input.id}`.toLowerCase();
    return (
      identity.includes("политика") ||
      identity.includes("privacy") ||
      identity.includes("consent") ||
      identity.includes("agreement")
    );
  });

  return checkbox ? checkbox.checked : null;
}

function buildLeadPayload(
  form: HTMLFormElement,
  attribution: FirstTouchAttribution,
): LeadPayload | null {
  const formData = new FormData(form);
  const phoneCountry = getFormValue(formData, [
    "country",
    "Country",
    "tildaspec-phone-part[]-iso",
  ]);
  const standalonePhone = getFormValue(formData, ["Phone", "phone", "tel"]);
  const phonePart = getFormValue(formData, ["tildaspec-phone-part[]"]);
  const normalizedCountry = phoneCountry?.toLowerCase();
  const phone =
    standalonePhone ??
    (phonePart
      ? `${normalizedCountry ? COUNTRY_DIAL_CODES[normalizedCountry] ?? "" : ""}${phonePart}`
      : undefined);

  const candidate = {
    name: getFormValue(formData, ["name", "Name", "Full Name"]),
    email: getFormValue(formData, ["email", "Email"]),
    phone,
    country: phoneCountry?.toUpperCase(),
    message: getFormValue(formData, [
      "text",
      "message",
      "Message",
      "comments",
      "Comments",
    ]),
    formName: getFormName(form, formData),
    consent: getConsent(form),
    ...attribution,
    submissionPage: window.location.href,
    clientTimestamp: new Date().toISOString(),
  };
  const validation = validateLeadPayload(candidate);

  return validation.ok ? validation.data : null;
}

function isOwnedTildaLeadForm(form: HTMLFormElement): boolean {
  if (
    !form.classList.contains("t-form") &&
    !form.classList.contains("js-form-proccess")
  ) {
    return false;
  }

  if (OWNED_TILDA_FORM_IDS.has(form.id)) {
    return true;
  }

  const formName = form
    .querySelector<HTMLInputElement>('input[name="tildaspec-formname"]')
    ?.value.trim()
    .toLowerCase();

  // Tilda uses data-formactiontype=2 for both Zero Block lead forms and carts,
  // so it is not a safe ownership signal. Audited cart form names/IDs are not
  // in either allowlist and continue through the legacy payment pipeline.
  return formName ? OWNED_TILDA_FORM_NAMES.has(formName) : false;
}

function usesTildaRequiredRule(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  return field.required || field.dataset.tildaReq === "1";
}

function passesLegacyValidation(form: HTMLFormElement): boolean {
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }

  const fields = form.querySelectorAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >("input, select, textarea");

  for (const field of fields) {
    if (field.disabled || !usesTildaRequiredRule(field)) {
      continue;
    }

    if (
      (field instanceof HTMLInputElement &&
        (field.type === "checkbox" || field.type === "radio") &&
        !field.checked) ||
      (!(field instanceof HTMLInputElement) && !field.value.trim()) ||
      (field instanceof HTMLInputElement &&
        field.type !== "checkbox" &&
        field.type !== "radio" &&
        !field.value.trim())
    ) {
      field.focus();
      showLegacyError(form, "Please fill in the required fields");
      return false;
    }
  }

  return true;
}

function showLegacyError(form: HTMLFormElement, message: string) {
  let errorBox = form.querySelector<HTMLElement>(".js-errorbox-all");

  if (!errorBox) {
    errorBox = document.createElement("div");
    errorBox.className = "js-errorbox-all t-form__errorbox-wrapper";
    errorBox.setAttribute("role", "alert");
    form.append(errorBox);
  }

  let messageNode = errorBox.querySelector<HTMLElement>(".js-rule-error-all");
  if (!messageNode) {
    messageNode = document.createElement("span");
    messageNode.className = "js-rule-error js-rule-error-all";
    errorBox.append(messageNode);
  }

  messageNode.textContent = message;
  errorBox.style.display = "block";
}

function clearLegacyError(form: HTMLFormElement) {
  const errorBox = form.querySelector<HTMLElement>(".js-errorbox-all");
  if (errorBox) {
    errorBox.style.display = "none";
  }
}

function setPending(form: HTMLFormElement, pending: boolean) {
  form.setAttribute("aria-busy", String(pending));
  const controls = form.querySelectorAll<
    HTMLButtonElement | HTMLInputElement
  >('button[type="submit"], input[type="submit"]');

  controls.forEach((control) => {
    control.disabled = pending;
    control.classList.toggle("is-loading", pending);
  });
}

function completeLegacySuccess(form: HTMLFormElement) {
  const formId = form.id || form.name || "lead-form";
  const dataLayerWindow = window as DataLayerWindow;
  dataLayerWindow.dataLayer = dataLayerWindow.dataLayer ?? [];
  dataLayerWindow.dataLayer.push({ event: `submit_${formId}` });

  const successUrl =
    form.dataset.successUrl ||
    form
      .closest<HTMLElement>("[data-field-formmsgurl-value]")
      ?.dataset.fieldFormmsgurlValue;

  if (successUrl) {
    window.setTimeout(() => window.location.assign(successUrl), 500);
    return;
  }

  form.reset();
  form
    .querySelectorAll<HTMLElement>(".t-form__inputsbox")
    .forEach((container) => {
      container.style.display = "none";
    });

  const successBox = form.querySelector<HTMLElement>(".js-successbox");
  if (successBox) {
    successBox.style.display = "block";
    successBox.setAttribute("role", "status");
  }
}

function getApiErrorMessage(body: unknown): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "object" &&
    body.error !== null &&
    "message" in body.error &&
    typeof body.error.message === "string"
  ) {
    return body.error.message;
  }

  return "We could not send your request. Please try again.";
}

export function LeadAttributionBridge() {
  useEffect(() => {
    const attribution = getFirstTouchAttribution();
    const pendingForms = new WeakSet<HTMLFormElement>();

    const handleSubmit = (event: SubmitEvent) => {
      if (!(event.target instanceof HTMLFormElement)) {
        return;
      }

      const form = event.target;
      if (!isOwnedTildaLeadForm(form)) {
        return;
      }

      // Once this allowlisted form is owned, prevent the legacy Tilda handler
      // from submitting a second copy to opaque receiver hashes.
      event.preventDefault();
      event.stopImmediatePropagation();

      if (pendingForms.has(form) || !passesLegacyValidation(form)) {
        return;
      }

      const payload = buildLeadPayload(form, attribution);
      if (!payload) {
        showLegacyError(form, "Please check the required fields");
        return;
      }

      pendingForms.add(form);
      clearLegacyError(form);
      setPending(form, true);

      void fetch("/api/leads", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (response) => {
          const body = await response.json().catch(() => null);
          if (!response.ok) {
            throw new Error(getApiErrorMessage(body));
          }

          completeLegacySuccess(form);
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : "We could not send your request. Please try again.";
          showLegacyError(form, message);
        })
        .finally(() => {
          pendingForms.delete(form);
          setPending(form, false);
        });
    };

    // Capture at `window` before Tilda's document/form handlers can submit an
    // opaque duplicate to the legacy receiver.
    window.addEventListener("submit", handleSubmit, true);
    return () => window.removeEventListener("submit", handleSubmit, true);
  }, []);

  return null;
}
