import { parseMetadata, verifyWebhookSignature } from "@/lib/billing/paystack";
import {
  findUserIdByPaystackCustomerCode,
  findUserIdByPaystackSubscriptionCode,
  updateUserSubscription,
} from "@/lib/db/queries";
import type { SubscriptionPlan } from "@/lib/db/types";

type WebhookPayload = {
  event?: string;
  data?: {
    customer?: {
      customer_code?: string | null;
    } | null;
    subscription?: {
      status?: string | null;
      subscription_code?: string | null;
      email_token?: string | null;
    } | null;
    transaction?: {
      reference?: string | null;
    } | null;
    plan_object?: {
      plan_code?: string | null;
    } | null;
    plan?: string | number | null;
    status?: string | null;
    reference?: string | null;
    metadata?: string | Record<string, unknown> | null;
  } | null;
};

async function findUserIdFromPayload(payload: WebhookPayload) {
  const customerCode = payload.data?.customer?.customer_code ?? "";
  const subscriptionCode = payload.data?.subscription?.subscription_code ?? "";

  if (subscriptionCode) {
    const userId = await findUserIdByPaystackSubscriptionCode(subscriptionCode);

    if (userId) {
      return userId;
    }
  }

  if (customerCode) {
    return findUserIdByPaystackCustomerCode(customerCode);
  }

  return null;
}

function getPlanFromMetadata(
  metadata: Record<string, unknown> | null,
  fallback: SubscriptionPlan,
) {
  return metadata?.plan === "pro" || metadata?.plan === "free"
    ? (metadata.plan as SubscriptionPlan)
    : fallback;
}

function getStatusFromPayload(payload: WebhookPayload, fallback: string) {
  return payload.data?.subscription?.status ?? payload.data?.status ?? fallback;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(body, signature)) {
    return Response.json({ error: "Invalid Paystack signature." }, { status: 400 });
  }

  const payload = JSON.parse(body) as WebhookPayload;
  const metadata = parseMetadata(payload.data?.metadata);
  const metadataUserId =
    metadata && typeof metadata.userId === "string" ? metadata.userId : null;
  const userId = metadataUserId ?? (await findUserIdFromPayload(payload));

  if (!userId) {
    return Response.json({ received: true });
  }

  const customerCode = payload.data?.customer?.customer_code ?? null;
  const subscriptionCode = payload.data?.subscription?.subscription_code ?? null;
  const planCode = payload.data?.plan_object?.plan_code ?? null;
  const emailToken = payload.data?.subscription?.email_token ?? null;
  const reference =
    payload.data?.transaction?.reference ?? payload.data?.reference ?? null;

  switch (payload.event) {
    case "charge.success":
    case "subscription.create":
    case "invoice.update": {
      const plan = getPlanFromMetadata(metadata, "pro");

      await updateUserSubscription({
        userId,
        plan,
        paystackCustomerCode: customerCode,
        paystackSubscriptionCode: subscriptionCode,
        paystackPlanCode: planCode,
        paystackReference: reference,
        paystackEmailToken: emailToken,
        subscriptionStatus: getStatusFromPayload(payload, "active"),
      });
      break;
    }
    case "invoice.payment_failed": {
      const plan = getPlanFromMetadata(metadata, "pro");

      await updateUserSubscription({
        userId,
        plan,
        paystackCustomerCode: customerCode,
        paystackSubscriptionCode: subscriptionCode,
        paystackPlanCode: planCode,
        paystackReference: reference,
        paystackEmailToken: emailToken,
        subscriptionStatus: getStatusFromPayload(payload, "attention"),
      });
      break;
    }
    case "subscription.not_renew": {
      const plan = getPlanFromMetadata(metadata, "pro");

      await updateUserSubscription({
        userId,
        plan,
        paystackCustomerCode: customerCode,
        paystackSubscriptionCode: subscriptionCode,
        paystackPlanCode: planCode,
        paystackReference: reference,
        paystackEmailToken: emailToken,
        subscriptionStatus: getStatusFromPayload(payload, "non-renewing"),
      });
      break;
    }
    case "subscription.disable": {
      await updateUserSubscription({
        userId,
        plan: "free",
        paystackCustomerCode: customerCode,
        paystackSubscriptionCode: null,
        paystackPlanCode: null,
        paystackReference: reference,
        paystackEmailToken: null,
        subscriptionStatus: getStatusFromPayload(payload, "disabled"),
      });
      break;
    }
    default:
      break;
  }

  return Response.json({ received: true });
}
