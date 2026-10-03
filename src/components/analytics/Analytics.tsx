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

/**
 * Google's own `gtag` shim: a function that pushes its `arguments` object — not
 * an array of them — onto the data layer. The distinction matters to the tag
 * platform, which reads `consent` commands out of the layer by shape, so this is
 * written the documented way rather than a convenient way.
 */
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

/** Whether the denied-by-default state has been stated on this document yet. */
let defaultsDeclared = false;

/**
 * Analytics, and nothing before consent.
 *
 * Three gates, in this order:
 *
 * 1. the production hostname, so staging and every `workers.dev` preview stay
 *    out of the numbers;
 * 2. Consent Mode v2, declared denied before a tag can read it — the container
 *    is authoritative and a container holds advertising tags as readily as
 *    measurement ones, so telling it what it may do is not optional once the
 *    site asks the question at all;
 * 3. the visitor's answer. Until analytics is granted, no container, no GA4 and
 *    no Meta or Google pixel is fetched — which is what `CookieConsent`
 *    promises on the visitor's behalf, and what the exported T972 widget it
 *    replaces never actually did.
 *
 * GTM is authoritative when configured; direct GA is only a fallback, because
 * the container may already own the GA4 page_view event. (`audit:analytics`
 * reads that sentence out of this file, so it stays worded as it is.)
 */
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

    // An already-loaded container is told about a changed answer rather than
    // loaded a second time — this effect reruns on every consent change.
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
