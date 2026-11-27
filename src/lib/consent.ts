export type Consent = {
  analytics: boolean;
  marketing: boolean;
};

export const CONSENT_COOKIE = "tbb-consent";

export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365;

export const CONSENT_CHANGED = "tbb:consent-changed";

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

export function consentSnapshot(): Consent | null {
  const raw = rawCookie();
  if (raw !== cached.raw) cached = { raw, value: parseCookie(raw) };
  return cached.value;
}

export function serverConsentSnapshot(): Consent | null {
  return null;
}

export function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGED, onChange);
  return () => window.removeEventListener(CONSENT_CHANGED, onChange);
}

export function writeConsent(consent: Consent) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(consent))}` +
    `; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${secure}`;

  window.dispatchEvent(new Event(CONSENT_CHANGED));
}

let pendingSettingsRequest = false;

export function requestConsentSettings() {
  pendingSettingsRequest = true;
  window.dispatchEvent(new Event(CONSENT_REQUESTED));
}

export function subscribeConsentSettings(onOpen: () => void) {
  let active = true;
  const open = () => {
    if (!active) return;
    pendingSettingsRequest = false;
    onOpen();
  };

  window.addEventListener(CONSENT_REQUESTED, open);
  if (pendingSettingsRequest) {
    queueMicrotask(() => {
      if (active && pendingSettingsRequest) open();
    });
  }

  return () => {
    active = false;
    window.removeEventListener(CONSENT_REQUESTED, open);
  };
}
