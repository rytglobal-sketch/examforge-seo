import type { SubscriptionPlan } from "@/lib/db/types";

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function isMagicLinkEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export function canPreviewMagicLinks() {
  return process.env.NODE_ENV !== "production";
}

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function isOpenRouterConfigured() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export function isPaystackConfigured() {
  return Boolean(
    process.env.PAYSTACK_SECRET_KEY &&
      process.env.PAYSTACK_PRO_PLAN_CODE &&
      process.env.PAYSTACK_PRO_AMOUNT,
  );
}

export function getChatModel() {
  return process.env.OPENAI_CHAT_MODEL ?? "gpt-4.1-mini";
}

export function getEmbeddingModel() {
  return process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
}

export function getOpenRouterBaseUrl() {
  return process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
}

export function getDeepResearchModel() {
  return process.env.OPENROUTER_DEEP_RESEARCH_MODEL ?? "openai/o3-deep-research";
}

export function getPlanName(plan: SubscriptionPlan) {
  return plan === "pro" ? "Pro" : "Free";
}
