import { NextResponse } from "next/server";
import { parseMetadata, verifyTransaction } from "@/lib/billing/paystack";
import { updateUserSubscription } from "@/lib/db/queries";
import type { SubscriptionPlan } from "@/lib/db/types";
import { getAppUrl } from "@/lib/env";

function createBillingRedirect(
  checkout: "success" | "failed" | "cancelled",
  reference?: string,
) {
  const destination = new URL("/billing", getAppUrl());
  destination.searchParams.set("checkout", checkout);

  if (reference) {
    destination.searchParams.set("reference", reference);
  }

  return NextResponse.redirect(destination);
}

function getPlanFromMetadata(
  metadata: Record<string, unknown> | null,
  fallback: SubscriptionPlan,
) {
  return metadata?.plan === "pro" || metadata?.plan === "free"
    ? (metadata.plan as SubscriptionPlan)
    : fallback;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return createBillingRedirect("cancelled");
  }

  const transaction = await verifyTransaction(reference);

  if (!transaction || transaction.status !== "success") {
    return createBillingRedirect("failed", reference);
  }

  const metadata = parseMetadata(transaction.metadata);
  const userId =
    metadata && typeof metadata.userId === "string" ? metadata.userId : null;
  const plan = getPlanFromMetadata(metadata, "pro");

  if (userId) {
    await updateUserSubscription({
      userId,
      plan,
      paystackCustomerCode: transaction.customer?.customer_code ?? null,
      paystackPlanCode: transaction.plan_object?.plan_code ?? null,
      paystackReference: transaction.reference,
      subscriptionStatus: "active",
    });
  }

  return createBillingRedirect("success", reference);
}
