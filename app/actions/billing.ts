"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/dal";
import { createCheckoutUrl, createManagementUrl } from "@/lib/billing/paystack";
import { getBillingSnapshot } from "@/lib/db/queries";

export async function startProCheckoutAction() {
  const session = await requireSession();
  const checkoutUrl = await createCheckoutUrl(session, "pro");

  if (!checkoutUrl) {
    redirect("/billing?paystack=missing");
  }

  redirect(checkoutUrl);
}

export async function openBillingManagementAction() {
  const session = await requireSession();
  const billing = await getBillingSnapshot(session.id);
  const managementUrl = await createManagementUrl(
    billing.paystackSubscriptionCode ?? "",
  );

  if (!managementUrl) {
    redirect("/billing?manage=missing");
  }

  redirect(managementUrl);
}
