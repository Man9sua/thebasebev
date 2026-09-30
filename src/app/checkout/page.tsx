import type { Metadata } from "next";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { SITE_ORIGIN } from "@/lib/site-pages";

export const metadata: Metadata = {
  title: "Secure Checkout | THE BASE",
  description: "Review THE BASE products and continue to secure Stripe Test Mode checkout.",
  alternates: { canonical: `${SITE_ORIGIN}/checkout` },
  robots: { index: false, follow: false },
};

export default function CheckoutRoute() {
  return <CheckoutPage />;
}
