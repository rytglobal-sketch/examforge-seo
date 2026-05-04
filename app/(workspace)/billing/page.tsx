import type { Metadata } from "next";
import { openBillingPortalAction, startProCheckoutAction } from "@/app/actions/billing";
import { WorkspaceShell } from "@/components/app-shell/workspace-shell";
import { getPlanConfig, planCatalog } from "@/lib/billing/plans";
import { requireSession } from "@/lib/auth/dal";
import { getBillingSnapshot } from "@/lib/db/queries";
import { isStripeConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Billing",
};

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

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const billing = await getBillingSnapshot(session.id);
  const params = await searchParams;
  const checkoutState = getParam(params, "checkout");
  const stripeMessage = getParam(params, "stripe");
  const portalMessage = getParam(params, "portal");
  const currentPlan = getPlanConfig(billing.plan);

  return (
    <WorkspaceShell user={session} activePath="/billing">
      <section className="space-y-6">
        {checkoutState === "success" ? (
          <div className="rounded-[1.7rem] border border-[#cfe6d4] bg-[#f3fbf4] px-5 py-4 text-sm leading-7 text-[#2d6a3d]">
            Stripe checkout completed. Your subscription will refresh as soon as
            the webhook confirms the payment.
          </div>
        ) : null}

        {stripeMessage === "missing" || portalMessage === "missing" ? (
          <div className="rounded-[1.7rem] border border-[#f2d7bf] bg-[#fff7ef] px-5 py-4 text-sm leading-7 text-[#8a5728]">
            Stripe is not fully configured yet. Add
            `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and
            `STRIPE_PRO_PRICE_ID` to enable live checkout and portal access.
          </div>
        ) : null}

        <div className="rounded-[1.8rem] border border-[#dce4f2] bg-white p-5 shadow-[0_20px_40px_rgba(16,21,34,0.04)]">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
            Current billing
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111727]">
            {currentPlan.name} plan
          </h2>
          <p className="mt-3 max-w-[42rem] text-sm leading-7 text-[#6d7686]">
            {currentPlan.description}
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[#dce4f2] bg-[#f8fbff] p-4">
              <div className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
                Price
              </div>
              <div className="mt-3 text-2xl font-semibold text-[#111727]">
                {currentPlan.priceLabel}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-[#dce4f2] bg-[#f8fbff] p-4">
              <div className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
                Uploads
              </div>
              <div className="mt-3 text-2xl font-semibold text-[#111727]">
                {billing.uploadLimit === null
                  ? "Unlimited"
                  : `${billing.uploadCount}/${billing.uploadLimit}`}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-[#dce4f2] bg-[#f8fbff] p-4">
              <div className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
                Status
              </div>
              <div className="mt-3 text-2xl font-semibold text-[#111727]">
                {billing.subscriptionStatus ?? "inactive"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {Object.values(planCatalog).map((plan) => {
            const isCurrent = plan.id === billing.plan;

            return (
              <article
                key={plan.id}
                className={`rounded-[1.8rem] border p-5 shadow-[0_20px_40px_rgba(16,21,34,0.04)] ${
                  isCurrent
                    ? "border-[#b9d2ff] bg-[#eef5ff]"
                    : "border-[#dce4f2] bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#111727]">
                      {plan.name}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#5d697d]">
                      {plan.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-[#111727]">
                      {plan.priceLabel}
                    </div>
                    {isCurrent ? (
                      <div className="mt-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f6fff]">
                        Current
                      </div>
                    ) : null}
                  </div>
                </div>

                <ul className="mt-6 space-y-3 text-sm leading-7 text-[#455066]">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-[#1f6fff]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {plan.id === "free" ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-[#dce4f2] bg-white px-4 py-3 text-sm font-semibold text-[#6d7686]"
                    >
                      Included by default
                    </button>
                  ) : isCurrent ? (
                    <form action={openBillingPortalAction}>
                      <button
                        type="submit"
                        disabled={!isStripeConfigured()}
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-[#111727] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#aeb6c4]"
                      >
                        Open billing portal
                      </button>
                    </form>
                  ) : (
                    <form action={startProCheckoutAction}>
                      <button
                        type="submit"
                        disabled={!isStripeConfigured()}
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-[#1f6fff] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9bbcff]"
                      >
                        Upgrade to Pro
                      </button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </WorkspaceShell>
  );
}
