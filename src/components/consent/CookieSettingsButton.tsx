"use client";

import { requestConsentSettings } from "@/lib/consent";

/**
 * The footer's way back into the cookie dialog.
 *
 * A button rather than a link, because it opens a dialog rather than navigating,
 * and it is a client island of its own so the footer stays a server component.
 * The class comes from the footer, so it sits in the legal row like its
 * neighbours.
 */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={requestConsentSettings}>
      Cookie settings
    </button>
  );
}
