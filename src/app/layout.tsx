import type { Metadata, Viewport } from "next";
import { Exo_2 } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@/components/analytics/Analytics";
import { CookieConsent } from "@/components/consent/CookieConsent";
import { LeadAttributionBridge } from "@/components/forms/LeadAttributionBridge";
import { MarketPrompt } from "@/components/site/MarketPrompt";
import { FIRST_TOUCH_SCRIPT } from "@/components/forms/first-touch";
import "./globals.css";

const exo2 = Exo_2({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--tbb-font-exo",
});

const noodle = localFont({
  src: "../fonts/big-noodle-titling.ttf",
  display: "swap",
  preload: false,
  variable: "--tbb-font-noodle",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thebasebev.com"),
  icons: {
    icon: [
      { url: "/images/tild3336-6631-4266-b132-633931653131__--2.png", media: "(prefers-color-scheme: light)" },
      { url: "/images/tild6134-3365-4562-a632-363639376661__--1.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/images/tild3562-3037-4663-b430-636236313734__symbol_without_backg.png",
  },
  verification: {
    google: "gw6ZHJAqgrcIapYsvjt5SMRjnp3bR4uutMMrFQKGaUQ",
    other: {
      "msvalidate.01": "A011A869D7E602B7D45AA6063AA4D6BE",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${exo2.variable} ${noodle.variable}`} suppressHydrationWarning>
      <head>
        <base href="/" />
        <script dangerouslySetInnerHTML={{ __html: FIRST_TOUCH_SCRIPT }} />
        <noscript>
          <style>{`
            [data-route-loading-fallback] { display: none !important; }
            body > div[id^="S:"][hidden] { display: block !important; }
          `}</style>
        </noscript>
        <link rel="alternate" type="application/rss+xml" title="THE BASE" href="/rss.xml" />
      </head>
      <body className="t-body" suppressHydrationWarning>
        {children}
        <LeadAttributionBridge />
        <MarketPrompt />
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
