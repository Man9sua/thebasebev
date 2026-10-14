"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { useOverlay } from "@/components/site/useOverlay";
import { sampleFlavoursFor } from "@/data/sample-flavours";
import { MARKETS } from "@/lib/site-config";
import styles from "./SampleRequestModal.module.css";

/**
 * "Request a sample", to the design ("Request a Sample Form"): a drawer from
 * the right with the product's own flavours (up to three), the kind of
 * business and the contact fields, then a confirmation in the same drawer.
 *
 * It is still the export's "Free Sample" lead form underneath, sent by
 * `LeadAttributionBridge` to `/api/leads`, so it keeps that form's field
 * names: `product` stays the product's name and `country` the market code.
 * Flavours, business, city, country name and note travel in `text`, which is
 * what the CRM shows as the customer's message. Email stays required because
 * the lead contract requires it.
 */

const MAX_FLAVOURS = 3;
const BUSINESSES = ["Café", "Restaurant", "Hotel", "Distributor", "Other"] as const;

type Fields = {
  name: string;
  company: string;
  phone: string;
  email: string;
  countryName: string;
  city: string;
  note: string;
};

const FIELDS: readonly {
  key: Exclude<keyof Fields, "note">;
  label: string;
  /** The lead bridge reads these names; the rest only feed `text`. */
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}[] = [
  { key: "name", label: "Full name", name: "name", autoComplete: "name", required: true },
  { key: "company", label: "Company", name: "company", autoComplete: "organization", required: true },
  { key: "phone", label: "Mobile / WhatsApp", name: "Phone", type: "tel", placeholder: "+971", autoComplete: "tel", required: true },
  { key: "email", label: "Email", name: "email", type: "email", autoComplete: "email", required: true },
  { key: "countryName", label: "Country", name: "country_name", autoComplete: "country-name" },
  { key: "city", label: "City", name: "city", autoComplete: "address-level2", required: true },
];

function marketName(code: string) {
  return MARKETS.find((market) => market.code === code)?.name ?? "";
}

export function SampleRequestModal({
  className,
  productName,
  country = "AE",
  label = "Request a sample",
}: {
  className?: string;
  productName?: string;
  country?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        className={`${className ?? ""} ${styles.trigger}`.trim()}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(<SampleDrawer productName={productName} country={country} onClose={close} />, document.body)
        : null}
    </>
  );
}

function SampleDrawer({
  productName,
  country,
  onClose,
}: {
  productName?: string;
  country: string;
  onClose: () => void;
}) {
  const flavours = sampleFlavoursFor(productName);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState<string[]>(flavours.slice(0, 1));
  const [business, setBusiness] = useState<string>(BUSINESSES[0]);
  const [fields, setFields] = useState<Fields>({
    name: "",
    company: "",
    phone: "",
    email: "",
    countryName: marketName(country),
    city: "",
    note: "",
  });
  const [done, setDone] = useState(false);

  useOverlay(true, onClose, panelRef, closeRef);

  // The bridge reports success by showing the form's success box; the drawer
  // follows it into its confirmation step rather than guessing at the result.
  useEffect(() => {
    const box = successRef.current;
    if (!box) return;
    const observer = new MutationObserver(() => {
      if (box.style.display !== "none") setDone(true);
    });
    observer.observe(box, { attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, []);

  const toggle = (flavour: string) =>
    setPicked((current) =>
      current.includes(flavour)
        ? current.filter((item) => item !== flavour)
        : current.length >= MAX_FLAVOURS
          ? current
          : [...current, flavour],
    );

  const update = (key: keyof Fields) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.currentTarget;
    setFields((current) => ({ ...current, [key]: value }));
  };

  const message = [
    picked.length > 0 && `Flavours: ${picked.join(", ")}`,
    `Business: ${business}`,
    fields.countryName.trim() && `Country: ${fields.countryName.trim()}`,
    fields.city.trim() && `City: ${fields.city.trim()}`,
    fields.note.trim(),
  ]
    .filter(Boolean)
    .join("\n");

  const firstName = fields.name.trim().split(/\s+/)[0];
  const team = fields.countryName.trim() || marketName(country) || "your country";

  return (
    <div className={styles.backdrop}>
      <button type="button" className={styles.scrim} aria-label="Close" tabIndex={-1} onClick={onClose} />
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sample-modal-title"
        tabIndex={-1}
      >
        <div className={styles.top}>
          <span className={styles.step}>{done ? "Done" : productName ? `${productName} sample` : "Sample request"}</span>
          <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="Close sample request form">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <form id="sample-request-modal-form" className={`js-form-proccess ${styles.form}`}>
          <input type="hidden" name="tildaspec-formname" defaultValue="Free Sample" />
          <input type="hidden" name="country" value={country} />
          {productName && <input type="hidden" name="product" value={productName} />}
          <input type="hidden" name="text" value={message} />

          <div className={`t-form__inputsbox ${styles.inputs}`}>
            <div className={styles.body}>
              <div className={styles.intro}>
                <h2 id="sample-modal-title" className={styles.title}>
                  Request
                  <br /> a sample
                </h2>
                <p className={styles.lead}>
                  Free for cafés, restaurants, hotels and distributors.
                  {flavours.length > 0 && " Choose up to three flavours."}
                </p>
              </div>

              {flavours.length > 0 && (
                <fieldset className={styles.group}>
                  <legend className={styles.groupHead}>
                    <span className={styles.groupTitle}>Flavours</span>
                    <span className={styles.count}>
                      {picked.length} of {MAX_FLAVOURS}
                    </span>
                  </legend>
                  <div className={styles.chips}>
                    {flavours.map((flavour) => {
                      const on = picked.includes(flavour);
                      const full = !on && picked.length >= MAX_FLAVOURS;
                      return (
                        <button
                          key={flavour}
                          type="button"
                          className={on ? styles.chipOn : styles.chip}
                          aria-pressed={on}
                          aria-disabled={full || undefined}
                          onClick={() => toggle(flavour)}
                        >
                          {flavour}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              <fieldset className={styles.group}>
                <legend className={styles.groupTitle}>Your business</legend>
                <div className={styles.chips}>
                  {BUSINESSES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={business === item ? styles.chipOn : styles.chip}
                      aria-pressed={business === item}
                      onClick={() => setBusiness(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className={styles.fields}>
                {FIELDS.map((field) => (
                  <label key={field.key} className={styles.field}>
                    <span className={styles.label}>{field.label}</span>
                    <input
                      type={field.type ?? "text"}
                      name={field.name}
                      value={fields[field.key]}
                      onChange={update(field.key)}
                      placeholder={field.placeholder}
                      autoComplete={field.autoComplete}
                      inputMode={field.type === "tel" ? "tel" : undefined}
                      required={field.required}
                      data-tilda-req={field.required ? "1" : undefined}
                    />
                  </label>
                ))}
                <label className={`${styles.field} ${styles.wide}`}>
                  <span className={styles.label}>Anything we should know? (optional)</span>
                  <textarea
                    name="note"
                    rows={3}
                    value={fields.note}
                    onChange={update("note")}
                    placeholder="Your menu, monthly volume, current supplier"
                  />
                </label>
              </div>

              <div className={`js-errorbox-all t-form__errorbox-wrapper ${styles.error}`} role="alert" style={{ display: "none" }}>
                <span className="js-rule-error js-rule-error-all" />
              </div>
            </div>

            <div className={styles.foot}>
              <button type="submit" className={styles.submit}>
                Send request
              </button>
              <span className={styles.legal}>
                By sending you agree to the Privacy Policy. We only use your details to arrange the sample.
              </span>
            </div>
          </div>

          <div ref={successRef} className={`js-successbox t-form__successbox ${styles.done}`} role="status" style={{ display: "none" }}>
            {done && (
              <>
                <span className={styles.tick} aria-hidden="true">
                  ✓
                </span>
                <h2 className={styles.title}>
                  Request
                  <br /> received
                </h2>
                <p className={styles.thanks}>
                  Thank you{firstName ? `, ${firstName}` : ""}. Our team in {team} will contact you on WhatsApp within
                  one business day to confirm the address.
                </p>
                {picked.length > 0 && (
                  <div className={styles.summary}>
                    <span className={styles.summaryLabel}>Your sample</span>
                    <span className={styles.summaryValue}>{picked.join(", ")}</span>
                  </div>
                )}
                <button type="button" className={styles.back} onClick={onClose}>
                  {productName ? `Back to ${productName}` : "Close"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
