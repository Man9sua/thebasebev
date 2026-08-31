import type Stripe from "stripe";
import type { CommerceCheckoutPolicy } from "./types";

const PRESERVED_ALLOWED_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] = [
  "AE",
  "SA",
  "KZ",
  "GB",
];

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

function aedAmount(value: string | undefined) {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

export type CommerceCheckoutConfiguration = Readonly<{
  policy: CommerceCheckoutPolicy;
  allowedCountries: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[];
  shippingOptions?: Stripe.Checkout.SessionCreateParams.ShippingOption[];
}>;

export function getCommerceCheckoutConfiguration(
  environment: Record<string, string | undefined>,
  amountSubtotal: number,
): CommerceCheckoutConfiguration {
  const shippingEnabled = enabled(environment.COMMERCE_SHIPPING_ENABLED);
  const automaticTaxEnabled = enabled(
    environment.COMMERCE_STRIPE_AUTOMATIC_TAX_ENABLED,
  );
  const promotionCodesEnabled = enabled(
    environment.COMMERCE_PROMOTION_CODES_ENABLED,
  );

  let expectedShippingAmount = 0;
  let shippingOptions:
    | Stripe.Checkout.SessionCreateParams.ShippingOption[]
    | undefined;

  if (shippingEnabled) {
    const configuredAmount = aedAmount(
      environment.COMMERCE_SHIPPING_FIXED_RATE_AED,
    );
    if (configuredAmount === null) {
      throw new Error("COMMERCE_SHIPPING_CONFIGURATION_INVALID");
    }
    const freeThreshold = aedAmount(
      environment.COMMERCE_FREE_SHIPPING_THRESHOLD_AED,
    );
    expectedShippingAmount =
      freeThreshold !== null && amountSubtotal >= freeThreshold
        ? 0
        : configuredAmount;
    shippingOptions = [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name:
            environment.COMMERCE_SHIPPING_LABEL?.trim() || "Configured delivery",
          fixed_amount: { amount: expectedShippingAmount, currency: "aed" },
        },
      },
    ];
  }

  return {
    policy: {
      shippingEnabled,
      expectedShippingAmount,
      automaticTaxEnabled,
      promotionCodesEnabled,
    },
    allowedCountries: PRESERVED_ALLOWED_COUNTRIES,
    shippingOptions,
  };
}
