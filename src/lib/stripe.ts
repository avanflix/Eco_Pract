// Stripe client — region-aware (IN vs US)
// Install: npm install stripe

import Stripe from "stripe";

export function getStripeClient(region: "IN" | "US" | string = "IN"): Stripe {
  const key =
    region === "US"
      ? process.env.STRIPE_SECRET_KEY_US!
      : process.env.STRIPE_SECRET_KEY!;

  if (!key) {
    throw new Error(`Stripe key missing for region ${region}. Check .env.local`);
  }

  return new Stripe(key, {
  apiVersion: "2025-02-24.acacia",
});
}
