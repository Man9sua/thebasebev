"use client";

import { useId, useState } from "react";
import { getFirstTouchAttribution } from "@/components/forms/first-touch";
import { LEAD_HONEYPOT_FIELD } from "@/lib/leads";
import styles from "./Partner.module.css";

/**
 * The distributor form.
 *
 * Posts to `/api/leads` and nowhere else: the Odoo webhook and `LEAD_API_URL`
 * are server-side names and never reach the browser. The form type is
 * `partner`, and the form name is "Partner with Us" — the string the sales team
 * already sees in Odoo for this form, audited from the Tilda export, so a lead
 * from the redesign lands in the same place as one from the live site.
 *
 * Attribution rides along from `getFirstTouchAttribution`, which prefers the
 * first touch stored while the landing page was still parsing. That is what
 * keeps `utm_source=chatgpt.com` on a referral that converts several pages
 * later, and it is the same helper the Tilda bridge uses.
 *
 * Success is only ever reported when the API says the lead was delivered:
 * `res.ok` alone is not enough, because the route answers 202 with `ok: true`
 * for a tripped decoy and a non-2xx for every upstream failure. Anything else
 * shows the error and leaves the visitor's typing in place to retry.
 */
type State = "idle" | "sending" | "sent" | "error";

const MESSAGES: Record<"sent" | "error", string> = {
  sent: "Thank you — we have your details and will be in touch shortly.",
  error:
    "That did not send. Please try again, or email info@thebasebev.com directly.",
};

export function Partner() {
  const [state, setState] = useState<State>("idle");
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("Phone"),
          formType: "partner",
          formName: "Partner with Us",
          consent: null,
          [LEAD_HONEYPOT_FIELD]: data.get(LEAD_HONEYPOT_FIELD) ?? "",
          ...getFirstTouchAttribution(),
          submissionPage: window.location.href,
          clientTimestamp: new Date().toISOString(),
        }),
      });

      const body = (await response.json().catch(() => null)) as
        | { ok?: boolean }
        | null;

      if (!response.ok || body?.ok !== true) {
        setState("error");
        return;
      }

      setState("sent");
      form.reset();
    } catch {
      setState("error");
    }
  }

  return (
    <section className={styles.section} aria-labelledby="partner-with-us">
      <div className={styles.band}>
        <div className={styles.card}>
          <div>
            <h2 className={styles.title} id="partner-with-us">
              Partner with Us
            </h2>
            <p className={styles.copy}>
              Interested in becoming a distributor? Share your full name,
              contact number, and email, and let’s explore how we can grow
              together.
            </p>
          </div>

          <form className={styles.form} onSubmit={onSubmit} noValidate={false}>
            <label className="tbb-visually-hidden" htmlFor={nameId}>
              Full name
            </label>
            <input
              className={styles.field}
              id={nameId}
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Name"
              required
              disabled={state === "sending"}
            />

            <label className="tbb-visually-hidden" htmlFor={phoneId}>
              Phone
            </label>
            <input
              className={styles.field}
              id={phoneId}
              name="Phone"
              type="tel"
              autoComplete="tel"
              placeholder="Phone"
              disabled={state === "sending"}
            />

            <label className="tbb-visually-hidden" htmlFor={emailId}>
              Email
            </label>
            <input
              className={styles.field}
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              required
              disabled={state === "sending"}
            />

            {/* The decoy. A bot that fills it gets a cheerful 202 and no lead. */}
            <div className={styles.decoy} aria-hidden>
              <label htmlFor={`${nameId}-decoy`}>Company website</label>
              <input
                id={`${nameId}-decoy`}
                name={LEAD_HONEYPOT_FIELD}
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <button
              className={`${styles.submit} tbb-pill tbb-pill-accent`}
              type="submit"
              disabled={state === "sending"}
            >
              {state === "sending" ? "Sending…" : "Send Invite"}
            </button>

            <p
              className={`${styles.status} ${
                state === "sent"
                  ? styles.statusSent
                  : state === "error"
                    ? styles.statusError
                    : ""
              }`}
              role="status"
              aria-live="polite"
            >
              {state === "sent" || state === "error" ? MESSAGES[state] : ""}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
