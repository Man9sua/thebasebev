"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { useOverlay } from "@/components/site/useOverlay";
import { SiteLink } from "@/components/site/SiteLink";
import { useCountryCode } from "@/components/site/useCountryCode";
import { SAMPLE_PRODUCTS, sampleProductFor } from "@/data/sample-flavours";
import { cityOptions, countryOptions, marketCountryOptions } from "@/data/places";
import { Autocomplete } from "./Autocomplete";
import { MARKETS } from "@/lib/site-config";
import styles from "./SampleRequestModal.module.css";

/**
 * "Request a sample", to the design ("Request a Sample Form"): a drawer from
 * the right with the samples, the kind of business and the contact fields,
 * then a confirmation in the same drawer. Samples come from any product: the
 * one the drawer was opened from is on it already, and "Add another product"
 * puts more beside it, up to six flavours in all.
 *
 * It is still the export's "Free Sample" lead form underneath, sent by
 * `LeadAttributionBridge` to `/api/leads`, so it keeps that form's field
 * names: `product` carries the chosen products' names and `country` the
 * market code. The samples by product, business, city, country name and
 * note travel in `text`, which is what the CRM shows as the customer's
 * message. Email stays required because
 * the lead contract requires it.
 */

const MAX_SAMPLES = 6;
const BUSINESSES = ["Café", "Restaurant", "Hotel", "Distributor", "Other"] as const;

type Sample = Readonly<{ slug: string; flavour: string }>;

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
  country,
  label = "Request a sample",
}: {
  className?: string;
  productName?: string;
  country?: string;
  label?: string;
}) {
  const currentCountry = useCountryCode();
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
        ? createPortal(<SampleDrawer productName={productName} country={country ?? currentCountry} onClose={close} />, document.body)
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
  const origin = sampleProductFor(productName);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  // The products on the form, in the order they were added; the one the
  // drawer was opened from comes first, with its first flavour picked.
  const [shown, setShown] = useState<string[]>(origin ? [origin.slug] : []);
  const [picked, setPicked] = useState<Sample[]>(origin ? [{ slug: origin.slug, flavour: origin.flavours[0] }] : []);
  const [adding, setAdding] = useState(!origin);
  const [sampleError, setSampleError] = useState(false);
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

  const full = picked.length >= MAX_SAMPLES;
  const isPicked = (slug: string, flavour: string) =>
    picked.some((sample) => sample.slug === slug && sample.flavour === flavour);

  const toggle = (slug: string, flavour: string) => {
    setSampleError(false);
    setPicked((current) =>
      current.some((sample) => sample.slug === slug && sample.flavour === flavour)
        ? current.filter((sample) => !(sample.slug === slug && sample.flavour === flavour))
        : current.length >= MAX_SAMPLES
          ? current
          : [...current, { slug, flavour }],
    );
  };

  const addProduct = (event: ChangeEvent<HTMLSelectElement>) => {
    const slug = event.currentTarget.value;
    if (!slug) return;
    setSampleError(false);
    setShown((current) => (current.includes(slug) ? current : [...current, slug]));
    setAdding(false);
  };

  const removeProduct = (slug: string) => {
    const next = shown.filter((item) => item !== slug);
    setShown(next);
    if (next.length === 0) setAdding(true);
    setPicked((current) => current.filter((sample) => sample.slug !== slug));
  };

  const flagMissing = (event: { preventDefault(): void; currentTarget: HTMLElement }) => {
    event.preventDefault();
    setSampleError(true);
    event.currentTarget.closest("fieldset")?.scrollIntoView({ block: "nearest" });
    event.currentTarget.focus({ preventScroll: true });
  };

  const update = (key: keyof Fields) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.currentTarget;
    setFields((current) => ({ ...current, [key]: value }));
  };
  const set = (key: keyof Fields) => (value: string) => setFields((current) => ({ ...current, [key]: value }));

  // Country and city suggest as the visitor types; the city list follows
  // the country in the field.
  const countries = useMemo(() => countryOptions(), []);
  const markets = useMemo(() => marketCountryOptions(), []);
  const cities = useMemo(() => cityOptions(fields.countryName), [fields.countryName]);

  // Picks grouped by product, in the order the products were added.
  const groups = shown.flatMap((slug) => {
    const product = SAMPLE_PRODUCTS.find((item) => item.slug === slug);
    const flavours = picked.filter((sample) => sample.slug === slug).map((sample) => sample.flavour);
    return product && flavours.length > 0 ? [{ product, flavours }] : [];
  });
  const choices = SAMPLE_PRODUCTS.filter((product) => !shown.includes(product.slug));

  const message = [
    groups.length > 0 &&
      `Samples (${picked.length}):\n${groups.map((group) => `- ${group.product.name}: ${group.flavours.join(", ")}`).join("\n")}`,
    `Business: ${business}`,
    fields.countryName.trim() && `Country: ${fields.countryName.trim()}`,
    fields.city.trim() && `City: ${fields.city.trim()}`,
    fields.note.trim(),
  ]
    .filter(Boolean)
    .join("\n");
  // The CRM's product field: every product with a pick, by name.
  const products = groups.map((group) => group.product.name).join(", ") || productName;

  const firstName = fields.name.trim().split(/\s+/)[0];

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
          <span className={styles.step}>{done ? "Done" : "Sample request"}</span>
          <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="Close sample request form">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <form id="sample-request-modal-form" className={`js-form-proccess ${styles.form}`}>
          <input type="hidden" name="tildaspec-formname" defaultValue="Free Sample" />
          <input type="hidden" name="country" value={country} />
          {products && <input type="hidden" name="product" value={products} />}
          <input type="hidden" name="text" value={message} />

          <div className={`t-form__inputsbox ${styles.inputs}`}>
            <div className={styles.body}>
              <div className={styles.intro}>
                <h2 id="sample-modal-title" className={styles.title}>
                  Request
                  <br /> a sample
                </h2>
                <p className={styles.lead}>
                  Free for cafés, restaurants, hotels and distributors. Choose up to {MAX_SAMPLES} flavours, from one
                  product or several.
                </p>
              </div>

              <fieldset className={styles.group}>
                <legend className={styles.groupHead}>
                  <span className={styles.groupTitle}>Samples</span>
                  <span className={styles.count} aria-live="polite">
                    {picked.length} of {MAX_SAMPLES}
                  </span>
                </legend>

                {shown.map((slug, productIndex) => {
                  const product = SAMPLE_PRODUCTS.find((item) => item.slug === slug);
                  if (!product) return null;
                  return (
                    <div key={slug} className={styles.product}>
                      <div className={styles.productHead}>
                        <span className={styles.productName}>{product.name}</span>
                        <button
                          type="button"
                          className={styles.remove}
                          onClick={() => removeProduct(slug)}
                          aria-label={`Remove ${product.name}`}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M6 6l12 12M18 6L6 18" />
                          </svg>
                        </button>
                      </div>
                      <div className={styles.chips}>
                        {product.flavours.map((flavour, index) => {
                          const on = isPicked(slug, flavour);
                          const off = !on && full;
                          return (
                            <label key={flavour} className={on ? styles.chipOn : styles.chip} data-disabled={off || undefined}>
                              <input
                                className={styles.flavourInput}
                                type="checkbox"
                                checked={on}
                                disabled={off}
                                required={productIndex === 0 && index === 0 && picked.length === 0}
                                aria-invalid={sampleError || undefined}
                                aria-describedby={sampleError ? "sample-flavour-error" : undefined}
                                onChange={() => toggle(slug, flavour)}
                                onInvalid={flagMissing}
                              />
                              {flavour}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {choices.length > 0 &&
                  (adding ? (
                    <label className={styles.field}>
                      <span className={styles.label}>{shown.length > 0 ? "Another product" : "Product"}</span>
                      <select
                        className={styles.select}
                        value=""
                        onChange={addProduct}
                        required={shown.length === 0}
                        aria-invalid={(sampleError && shown.length === 0) || undefined}
                        aria-describedby={sampleError ? "sample-flavour-error" : undefined}
                        onInvalid={flagMissing}
                      >
                        <option value="" disabled>
                          Choose a product
                        </option>
                        {choices.map((product) => (
                          <option key={product.slug} value={product.slug}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <button type="button" className={styles.add} onClick={() => setAdding(true)} disabled={full}>
                      + Add another product
                    </button>
                  ))}

                {sampleError && (
                  <p id="sample-flavour-error" className={styles.error} role="alert">
                    {shown.length === 0 ? "Choose a product and at least one flavour." : "Choose at least one flavour."}
                  </p>
                )}
              </fieldset>

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
                {FIELDS.map((field) =>
                  field.key === "countryName" || field.key === "city" ? (
                    <Autocomplete
                      key={field.key}
                      className={styles.field}
                      label={<span className={styles.label}>{field.label}</span>}
                      name={field.name}
                      value={fields[field.key]}
                      onChange={set(field.key)}
                      options={field.key === "city" ? cities : countries}
                      initial={field.key === "city" ? cities : markets}
                      required={field.required}
                      placeholder={field.key === "city" ? "Start typing" : undefined}
                    />
                  ) : (
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
                  ),
                )}
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
                By sending you agree to the <SiteLink href="/privacy">Privacy Policy</SiteLink>.
                We only use your details to arrange the sample.
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
                  Thank you{firstName ? `, ${firstName}` : ""}. the Base team will contact you on WhatsApp within
                  one business day to confirm the address.
                </p>
                {groups.length > 0 && (
                  <div className={styles.summary}>
                    <span className={styles.summaryLabel}>Your samples ({picked.length})</span>
                    {groups.map((group) => (
                      <span key={group.product.slug} className={styles.summaryValue}>
                        {group.product.name}: {group.flavours.join(", ")}
                      </span>
                    ))}
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
