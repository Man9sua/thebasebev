import type { CommerceOrder } from "./types";

export type NotificationResult =
  | { status: "sent" }
  | { status: "not_configured" }
  | { status: "failed"; errorCode: string };

export interface CommerceNotifier {
  send(order: CommerceOrder): Promise<NotificationResult>;
}

function safeReference(value: string | null | undefined) {
  if (!value) return "pending";
  return value.length > 24 ? `${value.slice(0, 14)}...${value.slice(-6)}` : value;
}

export function createCommerceNotifier(
  environment: Record<string, string | undefined>,
): CommerceNotifier {
  const token = environment.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = environment.TELEGRAM_CHAT_ID?.trim();
  const threadId = environment.TELEGRAM_MESSAGE_THREAD_ID?.trim();

  return {
    async send(order) {
      if (!token || !chatId) return { status: "not_configured" };
      const items = order.items
        .map((item) => `- ${item.productName} x ${item.quantity}`)
        .join("\n");
      const address = order.shippingAddress;
      const addressText = [
        address?.line1,
        address?.line2,
        address?.city,
        address?.state,
        address?.postalCode,
        address?.country,
      ]
        .filter(Boolean)
        .join(", ");
      const text = [
        "New paid website order",
        `Odoo: ${order.odooSaleOrderName ?? "pending"}`,
        `Stripe session: ${safeReference(order.stripeSessionId)}`,
        `Customer: ${order.customerName ?? "not provided"}`,
        `Email: ${order.customerEmail ?? "not provided"}`,
        `Amount: ${(order.amountTotal / 100).toFixed(2)} AED`,
        "Items:",
        items,
        `Shipping: ${(order.amountShipping / 100).toFixed(2)} AED`,
        `Address: ${addressText || "not provided"}`,
      ].join("\n");
      const body: Record<string, string> = { chat_id: chatId, text };
      if (threadId) body.message_thread_id = threadId;
      try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(8_000),
        });
        return response.ok
          ? { status: "sent" }
          : { status: "failed", errorCode: "TELEGRAM_NOTIFICATION_REJECTED" };
      } catch {
        return { status: "failed", errorCode: "TELEGRAM_NOTIFICATION_FAILED" };
      }
    },
  };
}
