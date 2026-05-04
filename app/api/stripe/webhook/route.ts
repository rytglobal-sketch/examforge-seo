import Stripe from "stripe";
import { getStripe } from "@/lib/billing/stripe";
import {
  findUserIdByStripeCustomerId,
  findUserIdByStripeSubscriptionId,
  updateUserSubscription,
} from "@/lib/db/queries";

export async function POST(request: Request) {
  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");

  if (!stripe || !signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Stripe is not configured." }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return Response.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan === "pro" ? "pro" : "free";

      if (userId) {
        await updateUserSubscription({
          userId,
          plan,
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : null,
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : null,
          subscriptionStatus:
            session.payment_status === "paid" ? "active" : session.payment_status,
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = await findUserIdByStripeSubscriptionId(subscription.id);

      if (userId) {
        const isDeleted = event.type === "customer.subscription.deleted";
        await updateUserSubscription({
          userId,
          plan: isDeleted ? "free" : "pro",
          stripeCustomerId:
            typeof subscription.customer === "string" ? subscription.customer : null,
          stripeSubscriptionId: isDeleted ? null : subscription.id,
          priceId: subscription.items.data[0]?.price.id ?? null,
          subscriptionStatus: subscription.status,
        });
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : null;
      const userId = customerId
        ? await findUserIdByStripeCustomerId(customerId)
        : null;

      if (userId) {
        await updateUserSubscription({
          userId,
          plan: "pro",
          stripeCustomerId: customerId,
          subscriptionStatus: "past_due",
        });
      }
      break;
    }
    default:
      break;
  }

  return Response.json({ received: true });
}
