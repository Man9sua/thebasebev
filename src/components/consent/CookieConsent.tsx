"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SiteLink } from "@/components/site/SiteLink";
import {
  CONSENT_DENIED,
  CONSENT_GRANTED,
  CONSENT_REQUESTED,
  type Consent,
  consentSnapshot,
  serverConsentSnapshot,
  subscribeConsent,
  writeConsent,
} from "@/lib/consent";
import styles from "./CookieConsent.module.css";

/**
 * Cookie consent, built to the redesign document.
 *
 * It replaces the exported Tilda T972 widget (`rec913700125`), which had three
 * problems the document names and one it does not:
 *
 * - it sat across the middle of the screen and covered the footer;
 * - it offered "Accept All" and "Cookie Settings" and no way to refuse, which is
 *   not a lawful choice for a visitor in the EU and not an honest one for
 *   anybody else;
 * - its buttons were square, which nothing else on the site is any more;
 * - and it only existed on the thirty-seven routes served through the legacy
 *   shell. The homepage, Distributors, R&D, Contacts, the Blog and the Glossary
 *   are React, so on those it was simply absent — the site asked some visitors
 *   for consent and not others.
 *
 * So: a 400px card in the bottom-left corner on a desktop and a sheet along the
 * bottom edge on a phone, both clear of the chat and WhatsApp buttons on the
 * right; "Accept all" and "Reject" the same size; "Settings" a third-level text
 * link; the choice remembered for twelve months; and nothing measuring anything
 * until it is given — `Analytics.tsx` is the other half of that last point.
 *
 * Rising "плавно снизу через 1 секунду после загрузки" is deliberate rather than
 * decorative: the banner is the first thing that moves on the page, and a second
 * is long enough for the page itself to have finished arriving.
 *
 * The card is in the server-rendered document, transparent and clear of the
 * pointer until the timer lifts it. That is what lets a statically generated
 * page hydrate without a mismatch: the server cannot know one visitor's answer,
 * so it renders the question, and a visitor who has already answered has it
 * removed on the first client render — before the timer, so never on screen.
 */

/** The document's own delay before the card rises. */
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

  /** The footer's "Cookie settings" link, and anything else that asks. */
  useEffect(() => {
    window.addEventListener(CONSENT_REQUESTED, openSettings);
    return () => window.removeEventListener(CONSENT_REQUESTED, openSettings);
  }, [openSettings]);

  const store = useCallback((next: Consent) => {
    writeConsent(next);
    setSettingsOpen(false);
  }, []);

  /*
   * Escape closes the dialog without storing anything: a dismissed dialog
   * leaves the previous answer standing, and on a first visit it leaves the
   * banner to ask again.
   */
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
              <SiteLink href="/privacy" className={styles.policy}>
                Cookie policy
              </SiteLink>
            </p>
          </div>

          <div className={styles.buttons}>
            <button type="button" className={styles.accept} onClick={() => store(CONSENT_GRANTED)}>
              Accept all
            </button>
            <button type="button" className={styles.reject} onClick={() => store(CONSENT_DENIED)}>
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
                  {/*
                    A real checkbox, painted as the design's pill switch: it keeps
                    the keyboard, the label association and the form semantics
                    that a pair of divs would have to reimplement.
                  */}
                  <span className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={draft[category.key]}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          [category.key]: event.currentTarget.checked,
                        }))
                      }
                    />
                    <span className={styles.knob} aria-hidden="true" />
                  </span>
                </label>
              ))}
            </div>

            <div className={styles.dialogButtons}>
              <button type="button" className={styles.accept} onClick={() => store(draft)}>
                Save choices
              </button>
              <button
                type="button"
                className={styles.reject}
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
