"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useOverlay } from "@/components/site/useOverlay";
import styles from "./SampleRequestModal.module.css";

export function SampleRequestModal({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useOverlay(open, close, panelRef, closeRef);

  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [open]);

  const modal =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            className={styles.backdrop}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <div
              ref={panelRef}
              className={styles.panel}
              role="dialog"
              aria-modal="true"
              aria-labelledby="sample-modal-title"
              aria-describedby="sample-modal-description"
              tabIndex={-1}
            >
              <button
                ref={closeRef}
                type="button"
                className={styles.close}
                onClick={close}
                aria-label="Close sample request form"
              >
                <span aria-hidden="true" />
              </button>

              <div className={styles.intro}>
                <h2 id="sample-modal-title" className={styles.title}>
                  Try Before You Buy
                  <br />— Get Your Free Sample!
                </h2>
                <p id="sample-modal-description" className={styles.description}>
                  Want to experience our premium beverage bases? Fill in your
                  details, and we’ll send you a sample to test in your café or bar.
                </p>
              </div>

              <form
                id="sample-request-modal-form"
                className={`js-form-proccess ${styles.form}`}
              >
                <input type="hidden" name="tildaspec-formname" defaultValue="Free Sample" />
                <input type="hidden" name="country" defaultValue="KZ" />

                <div className={`t-form__inputsbox ${styles.fields}`}>
                  <label className={styles.field}>
                    <span className={styles.srOnly}>Full name</span>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      autoComplete="name"
                      required
                      data-tilda-req="1"
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.srOnly}>Email</span>
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      autoComplete="email"
                      required
                      data-tilda-req="1"
                    />
                  </label>

                  <label className={`${styles.field} ${styles.phoneField}`}>
                    <span className={styles.srOnly}>Phone number</span>
                    <span className={styles.flag} aria-hidden="true" />
                    <input
                      type="tel"
                      name="Phone"
                      placeholder="+7 (000) 000-00-00"
                      autoComplete="tel"
                      inputMode="tel"
                      required
                      data-tilda-req="1"
                    />
                  </label>

                  <label className={styles.agreement}>
                    <input
                      type="checkbox"
                      name="privacy-consent"
                      value="yes"
                      required
                    />
                    <span className={styles.checkbox} aria-hidden="true" />
                    <span>
                      I agree to the processing of my personal data in accordance
                      with the <Link href="/privacy">Privacy Policy</Link>.
                    </span>
                  </label>

                  <div
                    className={`js-errorbox-all t-form__errorbox-wrapper ${styles.error}`}
                    role="alert"
                    style={{ display: "none" }}
                  >
                    <span className="js-rule-error js-rule-error-all" />
                  </div>

                  <button type="submit" className={styles.submit}>
                    Send Me a Sample
                  </button>
                </div>

                <div
                  className={`js-successbox t-form__successbox ${styles.success}`}
                  role="status"
                  style={{ display: "none" }}
                >
                  Thank you. Your sample request has been sent.
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        className={`${className ?? ""} ${styles.trigger}`.trim()}
        onClick={() => setOpen(true)}
      >
        Request a sample
      </button>
      {modal}
    </>
  );
}
