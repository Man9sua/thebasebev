"use client";

import { useEffect, useSyncExternalStore } from "react";
import { consentSnapshot, serverConsentSnapshot, subscribeConsent } from "@/lib/consent";

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

const PRODUCTION_HOSTS = new Set(["thebasebev.com", "www.thebasebev.com"]);

function appendScript(src: string, id: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.append(script);
}

function gtagFor(window: AnalyticsWindow) {
  const layer = (window.dataLayer = window.dataLayer ?? []);
  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      layer.push(arguments);
    };
  }
  return window.gtag;
}

let defaultsDeclared = false;

export function Analytics() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    consentSnapshot,
    serverConsentSnapshot,
  );

  useEffect(() => {
    if (!consent) return;
    if (!PRODUCTION_HOSTS.has(window.location.hostname.toLowerCase())) return;

    const analyticsWindow = window as AnalyticsWindow;
    const gtag = gtagFor(analyticsWindow);

    if (!defaultsDeclared) {
      defaultsDeclared = true;
      gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }

    gtag("consent", "update", {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied",
    });

    if (!consent.analytics) return;

    const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();
    const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();

    if (gtmId && /^GTM-[A-Z0-9]+$/i.test(gtmId)) {
      analyticsWindow.dataLayer?.push({ "gtm.start": Date.now(), event: "gtm.js" });
      appendScript(
        `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`,
        "thebase-gtm",
      );
      return;
    }

    if (gaId && /^G-[A-Z0-9]+$/i.test(gaId)) {
      gtag("js", new Date());
      gtag("config", gaId);
      appendScript(
        `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`,
        "thebase-ga4",
      );
    }
  }, [consent]);

  return null;
}
