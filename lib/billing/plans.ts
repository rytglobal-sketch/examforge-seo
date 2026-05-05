import type { SubscriptionPlan } from "@/lib/db/types";

export const planCatalog = {
  free: {
    id: "free" as const,
    name: "Free",
    priceLabel: "$0",
    description: "Best for trying ResearchForge with a few papers.",
    uploadLimit: 3,
    questionLimit: 25,
    features: [
      "Upload up to 3 academic PDFs",
      "Grounded PDF chat with page citations",
      "Paper summaries and notes",
      "Literature search and citation helper",
    ],
  },
  pro: {
    id: "pro" as const,
    name: "Pro",
    priceLabel: "$19/mo",
    description: "For active students and researchers running ongoing projects.",
    uploadLimit: null,
    questionLimit: null,
    features: [
      "Unlimited PDF uploads",
      "Unlimited grounded chat answers",
      "Priority summary generation",
      "Paystack-managed subscription billing",
    ],
  },
};

export function getPlanConfig(plan: SubscriptionPlan) {
  return planCatalog[plan];
}

export function getUploadLimit(plan: SubscriptionPlan) {
  return getPlanConfig(plan).uploadLimit;
}

export function getQuestionLimit(plan: SubscriptionPlan) {
  return getPlanConfig(plan).questionLimit;
}

export function getPaystackPlanCode(plan: SubscriptionPlan) {
  if (plan !== "pro") {
    return "";
  }

  return process.env.PAYSTACK_PRO_PLAN_CODE ?? "";
}

export function getPaystackAmount(plan: SubscriptionPlan) {
  if (plan !== "pro") {
    return "";
  }

  return process.env.PAYSTACK_PRO_AMOUNT ?? "";
}
