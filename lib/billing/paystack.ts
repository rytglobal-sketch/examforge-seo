import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { getPaystackAmount, getPaystackPlanCode } from "@/lib/billing/plans";
import type { SessionUser, SubscriptionPlan } from "@/lib/db/types";
import { getAppUrl, isPaystackConfigured } from "@/lib/env";

const PAYSTACK_API_BASE_URL = "https://api.paystack.co";

type PaystackEnvelope<T> = {
  status: boolean;
  message: string;
  data: T;
};

type PaystackCheckoutResponse = {
  authorization_url?: string;
  access_code?: string;
  reference?: string;
};

export type PaystackSubscriptionDetails = {
  status?: string | null;
  subscription_code?: string | null;
  email_token?: string | null;
};

export type PaystackCustomerDetails = {
  customer_code?: string | null;
  email?: string | null;
};

export type PaystackPlanDetails = {
  plan_code?: string | null;
};

export type PaystackTransactionDetails = {
  reference: string;
  status?: string | null;
  amount?: number | null;
  currency?: string | null;
  metadata?: string | Record<string, unknown> | null;
  customer?: PaystackCustomerDetails | null;
  subscription?: PaystackSubscriptionDetails | null;
  plan_object?: PaystackPlanDetails | null;
  plan?: number | string | null;
};

type PaystackManagementResponse = {
  link?: string;
};

type CheckoutMetadata = {
  userId: string;
  plan: SubscriptionPlan;
  cancel_action: string;
  custom_filters: {
    recurring: true;
  };
};

function getPaystackSecretKey() {
  return process.env.PAYSTACK_SECRET_KEY ?? "";
}

function getAbsoluteUrl(pathname: string) {
  return new URL(pathname, getAppUrl()).toString();
}

function buildReference(plan: SubscriptionPlan) {
  return `rf-${plan}-${randomUUID()}`;
}

async function paystackRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<PaystackEnvelope<T> | null> {
  const secretKey = getPaystackSecretKey();

  if (!secretKey) {
    return null;
  }

  const response = await fetch(`${PAYSTACK_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as PaystackEnvelope<T>;
}

export async function createCheckoutUrl(
  user: SessionUser,
  plan: SubscriptionPlan,
) {
  const planCode = getPaystackPlanCode(plan);
  const amount = getPaystackAmount(plan);

  if (!isPaystackConfigured() || !planCode || !amount) {
    return null;
  }

  const metadata: CheckoutMetadata = {
    userId: user.id,
    plan,
    cancel_action: getAbsoluteUrl("/billing?checkout=cancelled"),
    custom_filters: {
      recurring: true,
    },
  };

  const payload = {
    email: user.email,
    amount,
    plan: planCode,
    reference: buildReference(plan),
    callback_url: getAbsoluteUrl("/api/paystack/callback"),
    metadata: JSON.stringify(metadata),
  };

  const response = await paystackRequest<PaystackCheckoutResponse>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response?.data.authorization_url ?? null;
}

export async function verifyTransaction(reference: string) {
  if (!isPaystackConfigured() || !reference) {
    return null;
  }

  const response = await paystackRequest<PaystackTransactionDetails>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
    },
  );

  return response?.data ?? null;
}

export async function createManagementUrl(subscriptionCode: string) {
  if (!isPaystackConfigured() || !subscriptionCode) {
    return null;
  }

  const response = await paystackRequest<PaystackManagementResponse>(
    `/subscription/${encodeURIComponent(subscriptionCode)}/manage/link`,
    {
      method: "GET",
    },
  );

  return response?.data.link ?? null;
}

export function verifyWebhookSignature(body: string, signature: string | null) {
  const secretKey = getPaystackSecretKey();

  if (!secretKey || !signature) {
    return false;
  }

  const expectedSignature = createHmac("sha512", secretKey)
    .update(body)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export function parseMetadata(
  metadata: string | Record<string, unknown> | null | undefined,
) {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === "string") {
    try {
      const parsed = JSON.parse(metadata) as Record<string, unknown>;
      return parsed;
    } catch {
      return null;
    }
  }

  return metadata;
}
