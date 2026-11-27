"use client";

import { requestConsentSettings } from "@/lib/consent";

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={requestConsentSettings}>
      Cookie settings
    </button>
  );
}
