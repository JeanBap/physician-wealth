// src/lib/stripe.js
// ============================================================
// STRIPE BILLING INTEGRATION
// ============================================================
// SETUP:
//   1. Create Stripe account
//   2. Create Products: "PhysicianWealth Pro" ($29/mo), "PhysicianWealth Premium" ($79/mo)
//   3. Set env vars:
//      STRIPE_SECRET_KEY=sk_live_...
//      STRIPE_WEBHOOK_SECRET=whsec_...
//      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
//   4. Update PRICING.pro.priceId and PRICING.premium.priceId in data.js
//   5. Set up webhook endpoint: /api/stripe/webhook
//      Events to listen for:
//        - checkout.session.completed
//        - customer.subscription.updated
//        - customer.subscription.deleted
//        - invoice.payment_succeeded
//        - invoice.payment_failed

// --- CLIENT-SIDE: Redirect to Stripe Checkout ---
export async function createCheckoutSession(priceId, userId, email) {
  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId, userId, email }),
  });
  const { url } = await response.json();
  window.location.href = url;
}

// --- CLIENT-SIDE: Open Stripe Customer Portal ---
export async function openCustomerPortal(customerId) {
  const response = await fetch("/api/stripe/portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId }),
  });
  const { url } = await response.json();
  window.location.href = url;
}

// --- PLAN ACCESS CHECKING ---
// Tier hierarchy: free < trial = pro < premium
const TIER_LEVEL = { free: 0, trial: 2, pro: 2, premium: 3 };

export function canAccessModule(moduleTier, userPlan, trialEnd) {
  // During active trial, access everything up to pro tier
  if (userPlan === "trial") {
    const trialActive = trialEnd && new Date(trialEnd) > new Date();
    if (trialActive) {
      return TIER_LEVEL[moduleTier] <= TIER_LEVEL.pro;
    }
    // Trial expired, downgrade to free
    return TIER_LEVEL[moduleTier] <= TIER_LEVEL.free;
  }
  return TIER_LEVEL[moduleTier] <= (TIER_LEVEL[userPlan] || 0);
}

export function getTrialDaysLeft(trialEnd) {
  if (!trialEnd) return 0;
  const diff = new Date(trialEnd) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function isTrialExpired(trialEnd) {
  if (!trialEnd) return true;
  return new Date(trialEnd) <= new Date();
}

// ============================================================
// SERVER-SIDE API ROUTES (Next.js /api/stripe/*)
// ============================================================

/*
// --- /api/stripe/checkout.js ---
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { priceId, userId, email } = req.body;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    metadata: { userId },
    subscription_data: {
      trial_period_days: 0, // No additional trial; they already had 30 days
      metadata: { userId },
    },
  });

  res.json({ url: session.url });
}

// --- /api/stripe/portal.js ---
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { customerId } = req.body;

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  });

  res.json({ url: session.url });
}

// --- /api/stripe/webhook.js ---
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // service role for server-side
);

export const config = { api: { bodyParser: false } };

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      // Get subscription details
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = sub.items.data[0].price.id;

      // Determine plan from price
      const plan = priceId === process.env.STRIPE_PRICE_PRO ? "pro" : "premium";

      await supabase.from("subscriptions").upsert({
        user_id: userId,
        plan,
        status: "active",
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId,
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object;
      const userId = sub.metadata.userId;

      await supabase.from("subscriptions").update({
        status: sub.status === "active" ? "active" : sub.status,
        cancel_at_period_end: sub.cancel_at_period_end,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("stripe_subscription_id", sub.id);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;

      await supabase.from("subscriptions").update({
        plan: "free",
        status: "canceled",
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("stripe_subscription_id", sub.id);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const subId = invoice.subscription;

      await supabase.from("subscriptions").update({
        status: "past_due",
        updated_at: new Date().toISOString(),
      }).eq("stripe_subscription_id", subId);
      break;
    }
  }

  res.json({ received: true });
}
*/
