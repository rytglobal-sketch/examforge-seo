import Link from "next/link";
import type { Metadata } from "next";
import {
  openBillingManagementAction,
  startProCheckoutAction,
} from "@/app/actions/billing";
import { WorkspaceShell } from "@/components/app-shell/workspace-shell";
import { requireSession } from "@/lib/auth/dal";
import { getBillingSnapshot } from "@/lib/db/queries";
import { isPaystackConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Billing",
};

type BillingCycle = "monthly" | "yearly";
type PricingAudience = "academic" | "lab" | "institution";
type MarketingTierId = "basic" | "plus" | "pro" | "scale" | "enterprise";

type PricingTier = {
  id: MarketingTierId;
  name: string;
  subtitle: string;
  price: {
    monthly: string;
    yearly: string;
    yearlyNote: string;
    savings?: string;
  };
  features: string[];
};

const audienceOptions: Array<{ id: PricingAudience; label: string }> = [
  { id: "academic", label: "Academic" },
  { id: "lab", label: "Research Lab" },
  { id: "institution", label: "Institution" },
];

const pricingTiers: PricingTier[] = [
  {
    id: "basic",
    name: "Basic",
    subtitle: "For casual exploration",
    price: {
      monthly: "Free",
      yearly: "Free",
      yearlyNote: "Best for getting started with AI research workflows.",
    },
    features: [
      "Limited access to Research Agent",
      "2 automated reports per month",
      "Unlimited search across more than 138 million papers",
      "Unlimited summaries across as many papers as you want",
      "Unlimited chat with papers that have full-text access",
      "Add 2 columns to your tables at a time",
      "View sources for answers",
      "Import from Zotero",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    subtitle: "For deeper research",
    price: {
      monthly: "$12",
      yearly: "$7",
      yearlyNote: "Per user/month, billed as $84 annually",
      savings: "Save 42%",
    },
    features: [
      "Everything in Basic and more",
      "Increased daily access to Research Agent",
      "Export to RIS, CSV, BIB, PDF and DOCX",
      "4 automated reports per month",
      "Add 5 columns to your tables at a time",
      "Search across more than 500 thousand clinical trials",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    subtitle: "For systematic reviews",
    price: {
      monthly: "$49",
      yearly: "$29",
      yearlyNote: "Per user/month, billed as $348 annually",
      savings: "Save 41%",
    },
    features: [
      "Extended access to Research Agent",
      "Dedicated systematic review workflow that can screen 5,000 papers",
      "144 reports or systematic reviews per year",
      "Add 20 columns to your tables at a time",
      "Reports extract from up to 135 data sources",
      "Subscribe to 10 personalized research alerts",
      "Custom extractions from uploaded papers",
      "Explanations for AI-generated answers",
      "API access",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    subtitle: "For collaboration",
    price: {
      monthly: "$79",
      yearly: "$49",
      yearlyNote: "Per user/month, billed as $588 annually",
      savings: "Save 38%",
    },
    features: [
      "Everything in Pro and more",
      "Full access to Research Agent",
      "Extract and interpret figures from research papers",
      "Live editing and real-time collaboration with your team",
      "240 reports or systematic reviews per year",
      "Reports extract from up to 200 data sources",
      "Add 30 columns to your tables at a time",
      "Admin panel with usage tracking and seat management",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    subtitle: "For companies & schools",
    price: {
      monthly: "Custom",
      yearly: "Custom",
      yearlyNote: "Custom rollout, security, and deployment support.",
    },
    features: [
      "Full access to Research Agent",
      "Unlimited paper alerts",
      "No training on your data by default",
      "Greater scale: screen 40,000 papers and extract 40 columns",
      "Early access to new features and models",
      "Enterprise-level security and controls, including SSO, SAML, 2FA, and domain verification",
      "Dedicated customer success support for onboarding and success planning",
      "Integration with custom data sources and custom templates",
      "Unlimited API access",
    ],
  },
];

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function buildBillingHref(
  params: Record<string, string | string[] | undefined>,
  overrides: Partial<Record<"audience" | "cycle", string>>,
) {
  const search = new URLSearchParams();
  const keysToPreserve = ["checkout", "paystack", "manage"];

  for (const key of keysToPreserve) {
    const value = getParam(params, key);
    if (value) {
      search.set(key, value);
    }
  }

  const audience = overrides.audience ?? getParam(params, "audience");
  const cycle = overrides.cycle ?? getParam(params, "cycle");

  if (audience) {
    search.set("audience", audience);
  }

  if (cycle) {
    search.set("cycle", cycle);
  }

  const query = search.toString();
  return query ? `/billing?${query}` : "/billing";
}

function getCycleLabel(tier: PricingTier, cycle: BillingCycle) {
  return cycle === "yearly" ? tier.price.yearly : tier.price.monthly;
}

function getCurrentTierId(plan: "free" | "pro"): MarketingTierId {
  return plan === "pro" ? "pro" : "basic";
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const billing = await getBillingSnapshot(session.id);
  const params = await searchParams;
  const checkoutState = getParam(params, "checkout");
  const paystackMessage = getParam(params, "paystack");
  const manageMessage = getParam(params, "manage");
  const selectedCycle: BillingCycle =
    getParam(params, "cycle") === "monthly" ? "monthly" : "yearly";
  const selectedAudience = (
    audienceOptions.find((option) => option.id === getParam(params, "audience"))?.id ??
    "academic"
  ) satisfies PricingAudience;
  const currentTierId = getCurrentTierId(billing.plan);

  return (
    <WorkspaceShell user={session} activePath="/billing">
      <section className="space-y-6">
        {checkoutState === "success" ? (
          <div className="rounded-[1.7rem] border border-[#cfe6d4] bg-[#f3fbf4] px-5 py-4 text-sm leading-7 text-[#2d6a3d]">
            Paystack checkout completed. Your subscription will refresh as soon
            as payment verification and webhook sync finish.
          </div>
        ) : null}

        {checkoutState === "failed" ? (
          <div className="rounded-[1.7rem] border border-[#f2d7bf] bg-[#fff7ef] px-5 py-4 text-sm leading-7 text-[#8a5728]">
            We could not verify that Paystack transaction. Please try the
            upgrade again from your billing page.
          </div>
        ) : null}

        {paystackMessage === "missing" || manageMessage === "missing" ? (
          <div className="rounded-[1.7rem] border border-[#f2d7bf] bg-[#fff7ef] px-5 py-4 text-sm leading-7 text-[#8a5728]">
            Paystack is not fully configured yet. Add `PAYSTACK_SECRET_KEY`,
            `PAYSTACK_PRO_PLAN_CODE`, and `PAYSTACK_PRO_AMOUNT` to enable live
            checkout. Subscription management also requires the Paystack
            subscription webhook to sync first.
          </div>
        ) : null}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-[2.3rem] font-semibold tracking-[-0.06em] text-[#123f47] sm:text-[3rem]">
              Pricing
            </h1>
            <p className="mt-2 text-sm font-medium text-[#16353a]">
              Pick a plan that&apos;s right for you
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#d7dfdf] bg-white p-1">
              {audienceOptions.map((option) => {
                const isActive = selectedAudience === option.id;

                return (
                  <Link
                    key={option.id}
                    href={buildBillingHref(params, { audience: option.id })}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#0c454d] text-white"
                        : "text-[#32545a] hover:bg-[#f2f7f7]"
                    }`}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>

            <div className="inline-flex items-center rounded-full border border-[#d7dfdf] bg-white p-1">
              {(["monthly", "yearly"] as const).map((cycle) => {
                const isActive = selectedCycle === cycle;

                return (
                  <Link
                    key={cycle}
                    href={buildBillingHref(params, { cycle })}
                    className={`min-w-[126px] rounded-full px-5 py-2 text-center text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-[#0c454d] text-white"
                        : "text-[#32545a] hover:bg-[#f2f7f7]"
                    }`}
                  >
                    {cycle === "monthly" ? "Monthly" : "Yearly"}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-[#d8e1e1] bg-[#f7fbfb] px-5 py-4 text-sm leading-7 text-[#34545a]">
          You are currently on the{" "}
          <span className="font-semibold text-[#123f47]">
            {currentTierId === "basic" ? "Basic" : "Pro"}
          </span>{" "}
          tier with{" "}
          <span className="font-semibold text-[#123f47]">
            {billing.subscriptionStatus ?? "inactive"}
          </span>{" "}
          status. ResearchForge can track your uploads and access limits today,
          while the richer pricing menu below shows the structure you wanted for
          future packaging.
        </div>

        <p className="text-sm leading-7 text-[#60727a]">
          Audience preset:{" "}
          <span className="font-semibold text-[#123f47]">
            {audienceOptions.find((option) => option.id === selectedAudience)?.label}
          </span>
          . Live Paystack checkout currently maps to the Pro tier, while Plus,
          Scale, and Enterprise remain contact-led or preview tiers.
        </p>

        <div className="overflow-hidden rounded-[1.9rem] border border-[#cfd9da] bg-white">
          <div className="grid xl:grid-cols-5">
            {pricingTiers.map((tier) => {
              const isCurrent = currentTierId === tier.id;
              const isFeatured = tier.id === "pro";
              const displayPrice = getCycleLabel(tier, selectedCycle);
              const showSavings =
                selectedCycle === "yearly" && Boolean(tier.price.savings);

              return (
                <article
                  key={tier.id}
                  className={`flex h-full flex-col border-b border-[#dbe4e5] xl:border-b-0 xl:border-r last:border-r-0 ${
                    isFeatured ? "bg-[#fbffff]" : "bg-white"
                  }`}
                >
                  <div
                    className={`border-b border-[#dbe4e5] px-4 py-4 ${
                      isFeatured ? "outline outline-1 outline-[#0e6673]" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-[1.55rem] font-semibold tracking-[-0.04em] text-[#123f47]">
                          {tier.name}
                        </h2>
                        <p className="mt-1 text-sm text-[#45636a]">{tier.subtitle}</p>
                      </div>

                      {isCurrent ? (
                        <span className="rounded-full border border-[#b7d9de] bg-[#f2fbfc] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#0e6673]">
                          Current
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col px-4 py-5">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="text-[2.5rem] font-semibold tracking-[-0.06em] text-[#123f47]">
                          {displayPrice}
                        </div>
                        {showSavings ? (
                          <span className="rounded-full bg-[#eef7f8] px-3 py-1 text-xs font-semibold text-[#0e6673]">
                            {tier.price.savings}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 max-w-[18rem] text-sm leading-6 text-[#5d6e74]">
                        {tier.price.yearlyNote}
                      </p>
                    </div>

                    <ul className="mt-6 flex-1 space-y-3 text-sm leading-7 text-[#25474d]">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex gap-3">
                          <span className="mt-2 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#0e6673] text-[10px] font-bold text-[#0e6673]">
                            ✓
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-7">
                      {tier.id === "basic" ? (
                        <button
                          type="button"
                          disabled
                          className="inline-flex w-full items-center justify-center rounded-2xl border border-[#d6e0e1] bg-[#f8fbfb] px-4 py-3 text-sm font-semibold text-[#60727a]"
                        >
                          Included by default
                        </button>
                      ) : null}

                      {tier.id === "plus" ? (
                        <Link
                          href="mailto:hello@researchforge.app?subject=ResearchForge%20Plus%20interest"
                          className="inline-flex w-full items-center justify-center rounded-2xl border border-[#d6e0e1] bg-white px-4 py-3 text-sm font-semibold text-[#123f47] transition-colors hover:bg-[#f8fbfb]"
                        >
                          Join waitlist
                        </Link>
                      ) : null}

                      {tier.id === "pro" && isCurrent ? (
                        <form action={openBillingManagementAction}>
                          <button
                            type="submit"
                            disabled={
                              !isPaystackConfigured() ||
                              !billing.paystackSubscriptionCode
                            }
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0c454d] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9fb8bc]"
                          >
                            Manage subscription
                          </button>
                        </form>
                      ) : null}

                      {tier.id === "pro" && !isCurrent ? (
                        <form action={startProCheckoutAction}>
                          <button
                            type="submit"
                            disabled={!isPaystackConfigured()}
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0c454d] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9fb8bc]"
                          >
                            Upgrade to Pro
                          </button>
                        </form>
                      ) : null}

                      {tier.id === "scale" ? (
                        <Link
                          href="mailto:hello@researchforge.app?subject=ResearchForge%20Scale%20plan"
                          className="inline-flex w-full items-center justify-center rounded-2xl border border-[#d6e0e1] bg-white px-4 py-3 text-sm font-semibold text-[#123f47] transition-colors hover:bg-[#f8fbfb]"
                        >
                          Talk to sales
                        </Link>
                      ) : null}

                      {tier.id === "enterprise" ? (
                        <Link
                          href="mailto:hello@researchforge.app?subject=ResearchForge%20Enterprise"
                          className="inline-flex w-full items-center justify-center rounded-2xl border border-[#d6e0e1] bg-white px-4 py-3 text-sm font-semibold text-[#123f47] transition-colors hover:bg-[#f8fbfb]"
                        >
                          Contact enterprise
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </WorkspaceShell>
  );
}
