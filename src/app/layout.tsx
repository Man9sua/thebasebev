import type { Metadata, Viewport } from "next";
import { Exo_2 } from "next/font/google";
import { Analytics } from "@/components/analytics/Analytics";
import { LOADING_GATE_SCRIPT } from "@/components/site/loading-gate";
import "./globals.css";

/**
 * Exo 2 — the brand face, per Guidebook p.16: "EXO 2.0 font looks technical
 * and friendly, free font with open license".
 *
 * It replaces Jost, which was a stand-in picked before the Guidebook was
 * available. Weights map to the Guidebook's roles: 700 Header Bold, 400
 * Subheader Regular, 300 body Light.
 *
 * next/font self-hosts the files at build time — no runtime request to Google —
 * and reserves metrics up front, so the swap causes no shift.
 *
 * The variable class goes on <html>, not <body>: the design tokens compose it
 * inside `:root`, and a var() that is undefined at :root makes the whole
 * declaration invalid at computed-value time — which silently dropped the font
 * stack to Times New Roman.
 */
const exo2 = Exo_2({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--tbb-font-exo",
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
    <html lang="en" className={exo2.variable} suppressHydrationWarning>
      <head>
        <base href="/" />
        {/*
          Blocking and first, because it has to decide whether the homepage's
          loading screen is showing before a single pixel is painted. It is a
          no-op on every other route — see LOADING_GATE_SCRIPT.
        */}
        <script dangerouslySetInnerHTML={{ __html: LOADING_GATE_SCRIPT }} />
        <link rel="alternate" type="application/rss+xml" title="THE BASE" href="/rss.xml" />
      </head>
      <body className="t-body" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
