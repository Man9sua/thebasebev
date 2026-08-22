"use client";

import { useEffect } from "react";
import {
  LEGACY_FORM_NAMES,
  resolveLeadFormType,
} from "@/lib/lead-forms";
import {
  createFirstTouchAttribution,
  LEAD_HONEYPOT_FIELD,
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

  const formName = getFormName(form, formData);
  const candidate = {
    name: getFormValue(formData, ["name", "Name", "Full Name"]),
    email: getFormValue(formData, ["email", "Email"]),
    phone,
    country: phoneCountry?.toUpperCase(),
    company: getFormValue(formData, ["company", "Company"]),
    message: getFormValue(formData, [
      "text",
      "message",
      "Message",
      "comments",
      "Comments",
    ]),
    formId: form.id || undefined,
    formName,
    // The server re-derives and re-checks this against its allowlist; sending it
    // only saves a lookup, it is never trusted as-is.
    formType: resolveLeadFormType(form.id, formName) ?? undefined,
    consent: getConsent(form),
    [LEAD_HONEYPOT_FIELD]: getFormValue(formData, [LEAD_HONEYPOT_FIELD]) ?? "",
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
    form.append(errorBox);
  }

  // Tilda ships its own error box without a live-region role, so announce it
  // whether we created the element or inherited it.
  errorBox.setAttribute("role", "alert");

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
    "message" in body &&
    typeof body.message === "string" &&
    body.message.trim() !== ""
  ) {
    return body.message;
  }

  return "Something went wrong. Please try again.";
}

/**
 * Add the decoy field to an owned form. It is visually hidden and removed from
 * the tab order and the accessibility tree, so only automated fillers reach it.
 */
function attachHoneypot(form: HTMLFormElement) {
  if (form.querySelector(`input[name="${LEAD_HONEYPOT_FIELD}"]`)) {
    return;
  }

  const input = document.createElement("input");
  input.type = "text";
  input.name = LEAD_HONEYPOT_FIELD;
  input.tabIndex = -1;
  input.autocomplete = "off";
  input.setAttribute("aria-hidden", "true");
  input.style.cssText =
    "position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
  form.append(input);
}

export function LeadAttributionBridge() {
  useEffect(() => {
    const attribution = getFirstTouchAttribution();
    const pendingForms = new WeakSet<HTMLFormElement>();

    const armOwnedForms = () => {
      document
        .querySelectorAll<HTMLFormElement>("form")
        .forEach((form) => {
          if (isOwnedTildaLeadForm(form)) {
            attachHoneypot(form);
          }
        });
    };

    armOwnedForms();

    // Tilda injects Zero Block popup forms after hydration, so watch for them
    // instead of assuming the first pass saw every form.
    const observer = new MutationObserver(armOwnedForms);
    observer.observe(document.body, { childList: true, subtree: true });

    const submitOwnedForm = (form: HTMLFormElement) => {
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
      submitOwnedForm(form);
    };

    // Tilda's form script calls preventDefault() on the submit button's click,
    // so on most pages no `submit` event is ever dispatched and a submit-only
    // listener never runs. Claim the click first — window capture is the
    // earliest phase, ahead of Tilda's element and document handlers.
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const control = target.closest<HTMLButtonElement | HTMLInputElement>(
        'button[type="submit"], input[type="submit"], button:not([type])',
      );
      if (!control || control.disabled) {
        return;
      }

      const form = control.form ?? control.closest("form");
      if (!form || !isOwnedTildaLeadForm(form)) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      submitOwnedForm(form);
    };

    // Keyboard submits (Enter inside a field) still arrive as `submit`, and
    // some forms are not driven by the Tilda script at all.
    window.addEventListener("click", handleClick, true);
    window.addEventListener("submit", handleSubmit, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("click", handleClick, true);
      window.removeEventListener("submit", handleSubmit, true);
    };
  }, []);

  return null;
}
