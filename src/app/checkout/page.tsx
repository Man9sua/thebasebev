import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { SITE_ORIGIN } from "@/lib/site-pages";

export const metadata: Metadata = {
  title: "Secure Checkout | The Base",
  description: "Review your The Base products or free samples, confirm delivery and continue to secure checkout.",
  alternates: { canonical: `${SITE_ORIGIN}/checkout` },
  robots: { index: false, follow: false },
};

export default function CheckoutRoute() {
  return <Suspense fallback={<main aria-busy="true">Preparing checkout…</main>}><CheckoutFlow /></Suspense>;
}
