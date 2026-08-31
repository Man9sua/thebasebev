import type { Metadata } from "next";
import { CheckoutSuccessPage } from "@/components/checkout/CheckoutSuccessPage";

export const metadata: Metadata = {
  title: "Order Status | THE BASE",
  alternates: { canonical: "https://thebasebev.com/checkout/success" },
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessRoute({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const value = (await searchParams).session_id;
  const sessionId = typeof value === "string" ? value : "";
  return <CheckoutSuccessPage sessionId={sessionId} />;
}
