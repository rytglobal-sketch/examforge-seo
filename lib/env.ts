import type { SubscriptionPlan } from "@/lib/db/types";

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.STRIPE_PRO_PRICE_ID,
  );
}

export function getChatModel() {
  return process.env.OPENAI_CHAT_MODEL ?? "gpt-4.1-mini";
}

export function getEmbeddingModel() {
  return process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
}

export function getPlanName(plan: SubscriptionPlan) {
  return plan === "pro" ? "Pro" : "Free";
}
