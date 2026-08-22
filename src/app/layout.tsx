import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import { Analytics } from "@/components/analytics/Analytics";
import "./globals.css";

/**
 * The redesigned surfaces need a webfont of their own: the legacy pages get
 * Jost from Tilda's stylesheets, but the new homepage does not load those, so
 * it was falling back to a system grotesque.
 *
 * next/font self-hosts the files at build time — no runtime request to Google —
 * and reserves metrics up front, so swapping in the real face causes no shift.
 *
 * The variable class goes on <html>, not <body>: the design tokens compose it
 * inside `:root`, and a var() that is undefined at :root makes the whole
 * declaration invalid at computed-value time — which silently dropped the font
 * stack to Times New Roman.
 */
const jost = Jost({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--tbb-font-jost",
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
    <html lang="en" className={jost.variable} suppressHydrationWarning>
      <head>
        <base href="/" />
        <link rel="alternate" type="application/rss+xml" title="THE BASE" href="/rss.xml" />
      </head>
      <body className="t-body" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
