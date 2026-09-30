/**
 * Cookie consent — one contract, shared by the banner and by everything that
 * has to wait for it.
 *
 * Stored in a first-party cookie rather than in `localStorage`, for two
 * reasons: the redesign asks for the choice to be remembered for twelve months,
 * and `Max-Age` is the only storage on the platform that expires on its own;
 * and a cookie is readable on the server, so a later render can decide what to
 * embed instead of injecting it afterwards.
 *
 * The cookie itself is strictly necessary — it records a refusal as faithfully
 * as an acceptance, so writing it needs no permission of its own.
 *
 * The reader is shaped for `useSyncExternalStore`: `subscribeConsent` plus a
 * `consentSnapshot` that returns the *same* object until the cookie actually
 * changes. That identity is the whole point — a fresh object on every call would
 * make the hook re-render for ever.
 */

export type Consent = {
  analytics: boolean;
  marketing: boolean;
};

export const CONSENT_COOKIE = "tbb-consent";

/** Twelve months, as the document specifies. */
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365;

/** Fired on `window` whenever a choice is stored. */
export const CONSENT_CHANGED = "tbb:consent-changed";

/** Fired on `window` to reopen the settings dialog — the footer's link. */
export const CONSENT_REQUESTED = "tbb:consent-requested";

export const CONSENT_DENIED: Consent = { analytics: false, marketing: false };
export const CONSENT_GRANTED: Consent = { analytics: true, marketing: true };

function rawCookie() {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE}=([^;]*)`),
  );
  return match?.[1] ?? "";
}

/**
 * Anything unparseable is treated as absent rather than as a refusal, so a
 * corrupted value asks again instead of silently denying for a year.
 */
function parseCookie(raw: string): Consent | null {
  if (!raw) return null;

  try {
    const value = JSON.parse(decodeURIComponent(raw)) as Partial<Consent>;
    if (typeof value?.analytics !== "boolean" || typeof value?.marketing !== "boolean") {
      return null;
    }
    return { analytics: value.analytics, marketing: value.marketing };
  } catch {
    return null;
  }
}

let cached: { raw: string; value: Consent | null } = { raw: "", value: null };

/**
 * The stored choice, or `null` when nobody has made one yet.
 *
 * The distinction matters: `null` is what puts the banner on screen, and a
 * stored `{ analytics: false }` is what keeps it off.
 */
export function consentSnapshot(): Consent | null {
  const raw = rawCookie();
  if (raw !== cached.raw) cached = { raw, value: parseCookie(raw) };
  return cached.value;
}

/**
 * What the server knows, which is nothing: pages are statically generated and
 * cached, so the document cannot be rendered around one visitor's answer. React
 * hydrates against this and then re-syncs to the cookie.
 */
export function serverConsentSnapshot(): Consent | null {
  return null;
}

export function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGED, onChange);
  return () => window.removeEventListener(CONSENT_CHANGED, onChange);
}

/**
 * Stores a choice and tells the page about it.
 *
 * `Secure` only over https: the site is served over http in development, where a
 * `Secure` cookie is dropped — which would have looked like a banner that
 * forgets.
 */
export function writeConsent(consent: Consent) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(consent))}` +
    `; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${secure}`;

  window.dispatchEvent(new Event(CONSENT_CHANGED));
}

/** Reopens the settings dialog from anywhere — see the footer's link. */
export function requestConsentSettings() {
  window.dispatchEvent(new Event(CONSENT_REQUESTED));
}
