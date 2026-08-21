"use client";

import { useEffect } from "react";

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

export function Analytics() {
  useEffect(() => {
    if (!PRODUCTION_HOSTS.has(window.location.hostname.toLowerCase())) return;

    const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();
    const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();
    const analyticsWindow = window as AnalyticsWindow;

    // GTM is authoritative when configured. Do not also initialize direct GA,
    // because the container may already own the GA4 page_view event.
    if (gtmId && /^GTM-[A-Z0-9]+$/i.test(gtmId)) {
      analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
      analyticsWindow.dataLayer.push({
        "gtm.start": Date.now(),
        event: "gtm.js",
      });
      appendScript(
        `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`,
        "thebase-gtm",
      );
      return;
    }

    if (gaId && /^G-[A-Z0-9]+$/i.test(gaId)) {
      analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
      analyticsWindow.gtag = (...args: unknown[]) => {
        analyticsWindow.dataLayer?.push(args);
      };
      analyticsWindow.gtag("js", new Date());
      analyticsWindow.gtag("config", gaId);
      appendScript(
        `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`,
        "thebase-ga4",
      );
    }
  }, []);

  return null;
}
