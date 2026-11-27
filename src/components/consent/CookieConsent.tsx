"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import {
  CONSENT_DENIED,
  CONSENT_GRANTED,
  type Consent,
  consentSnapshot,
  serverConsentSnapshot,
  subscribeConsent,
  subscribeConsentSettings,
  writeConsent,
} from "@/lib/consent";
import styles from "./CookieConsent.module.css";

const REVEAL_DELAY = 1_000;

const CATEGORIES = [
  {
    key: "analytics",
    title: "Analytics",
    body: "Anonymous traffic data to improve the site.",
  },
  {
    key: "marketing",
    title: "Marketing",
    body: "Ads on Meta and Google based on your visit.",
  },
] as const;

export function CookieConsent() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    consentSnapshot,
    serverConsentSnapshot,
  );

  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState<Consent>(CONSENT_DENIED);
  const dialogRef = useRef<HTMLDivElement>(null);

  const undecided = consent === null;

  useEffect(() => {
    if (!undecided) return;
    const timer = window.setTimeout(() => setVisible(true), REVEAL_DELAY);
    return () => window.clearTimeout(timer);
  }, [undecided]);

  const openSettings = useCallback(() => {
    setDraft(consentSnapshot() ?? CONSENT_DENIED);
    setSettingsOpen(true);
  }, []);

  useEffect(() => subscribeConsentSettings(openSettings), [openSettings]);

  const store = useCallback((next: Consent) => {
    writeConsent(next);
    setSettingsOpen(false);
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setSettingsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => dialogRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [settingsOpen]);

  return (
    <>
      {undecided && !settingsOpen && (
        <section
          className={`${styles.banner} ${visible ? styles.bannerIn : ""}`}
          aria-label="Cookies"
        >
          <div className={styles.copy}>
            <span className={styles.title}>Cookies</span>
            <p className={styles.text}>
              We use cookies to run the site and, with your consent, to measure traffic.{" "}
              <SiteLink href="/cookie-policy" className={styles.policy}>
                Cookie policy
              </SiteLink>
            </p>
          </div>

          <div className={styles.buttons}>
            <button type="button" className={styles.primaryAction} onClick={() => store(CONSENT_GRANTED)}>
              Accept all
            </button>
            <button type="button" className={styles.secondaryAction} onClick={() => store(CONSENT_DENIED)}>
              Reject
            </button>
          </div>

          <button type="button" className={styles.settingsLink} onClick={openSettings}>
            Settings
          </button>
        </section>
      )}

      {settingsOpen && (
        <div className={styles.scrim}>
          <div
            ref={dialogRef}
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
            tabIndex={-1}
          >
            <div className={styles.dialogHead}>
              <h2 id="cookie-settings-title" className={styles.dialogTitle}>
                Cookie settings
              </h2>
              <button
                type="button"
                className={styles.close}
                onClick={() => setSettingsOpen(false)}
                aria-label="Close cookie settings"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className={styles.rows}>
              <div className={styles.row}>
                <div className={styles.rowCopy}>
                  <span className={styles.rowTitle}>Necessary</span>
                  <span className={styles.rowBody}>Cart, checkout and security. Always on.</span>
                </div>
                <span className={styles.always}>Always on</span>
              </div>

              {CATEGORIES.map((category) => (
                <label key={category.key} className={styles.row}>
                  <span className={styles.rowCopy}>
                    <span className={styles.rowTitle}>{category.title}</span>
                    <span className={styles.rowBody}>{category.body}</span>
                  </span>
                  <span className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={draft[category.key]}
                      onChange={(event) => {
                        const { checked } = event.currentTarget;
                        setDraft((current) => ({ ...current, [category.key]: checked }));
                      }}
                    />
                    <span className={styles.knob} aria-hidden="true" />
                  </span>
                </label>
              ))}
            </div>

            <div className={styles.dialogButtons}>
              <button type="button" className={styles.primaryAction} onClick={() => store(draft)}>
                Save choices
              </button>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => store(CONSENT_GRANTED)}
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
