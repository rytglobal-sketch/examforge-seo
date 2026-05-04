"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/dal";
import { createCheckoutUrl, createPortalUrl } from "@/lib/billing/stripe";
import { getBillingSnapshot } from "@/lib/db/queries";

export async function startProCheckoutAction() {
  const session = await requireSession();
  const checkoutUrl = await createCheckoutUrl(session, "pro");

  if (!checkoutUrl) {
    redirect("/billing?stripe=missing");
  }

  redirect(checkoutUrl);
}

export async function openBillingPortalAction() {
  const session = await requireSession();
  const billing = await getBillingSnapshot(session.id);
  const portalUrl = await createPortalUrl({
    ...session,
    stripeCustomerId: billing.stripeCustomerId,
  });

  if (!portalUrl) {
    redirect("/billing?portal=missing");
  }

  redirect(portalUrl);
}
