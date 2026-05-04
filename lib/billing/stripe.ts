import "server-only";
import Stripe from "stripe";
import { getAppUrl, isStripeConfigured } from "@/lib/env";
import { getStripePriceId } from "@/lib/billing/plans";
import type { SessionUser, SubscriptionPlan } from "@/lib/db/types";

let stripeClient: Stripe | null | undefined;

export function getStripe() {
  if (stripeClient !== undefined) {
    return stripeClient;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    stripeClient = null;
    return stripeClient;
  }

  stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });

  return stripeClient;
}

export async function createCheckoutUrl(user: SessionUser, plan: SubscriptionPlan) {
  const stripe = getStripe();
  const priceId = getStripePriceId(plan);

  if (!stripe || !isStripeConfigured() || !priceId) {
    return null;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    success_url: `${getAppUrl()}/billing?checkout=success`,
    cancel_url: `${getAppUrl()}/billing?checkout=cancelled`,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: user.id,
    customer_email: user.email,
    metadata: {
      userId: user.id,
      plan,
    },
  });

  return session.url ?? null;
}

export async function createPortalUrl(user: SessionUser) {
  const stripe = getStripe();

  if (!stripe || !isStripeConfigured() || !user.stripeCustomerId) {
    return null;
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${getAppUrl()}/billing`,
  });

  return session.url;
}
