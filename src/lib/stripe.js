// src/lib/stripe.js
// Stripe billing + tier gating
// In production: real Stripe API calls. Demo mode: client-side gating.

export const STRIPE_CONFIG = {
  publishableKey: "pk_test_PLACEHOLDER",
  prices: {
    pro_monthly: "price_pro_monthly_PLACEHOLDER",
    pro_annual: "price_pro_annual_PLACEHOLDER",
    premium_monthly: "price_premium_monthly_PLACEHOLDER",
    premium_annual: "price_premium_annual_PLACEHOLDER",
  },
};

// Tier hierarchy: free < trial < pro < premium
const TIER_LEVEL = { free: 0, trial: 3, pro: 2, premium: 3 };

export function canAccessModule(moduleTier, userTier, trialExpired) {
  // Premium/admin always has full access
  if (userTier === "premium" || userTier === "admin") return true;
  // Trial gives full access until expired
  if (userTier === "trial" && !trialExpired) return true;
  // Check tier level
  const required = TIER_LEVEL[moduleTier] || 0;
  const has = TIER_LEVEL[userTier] || 0;
  return has >= required;
}

export function getTrialDaysLeft(trialEnd) {
  if (!trialEnd) return 0;
  const diff = new Date(trialEnd) - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export function isTrialExpired(trialEnd) {
  if (!trialEnd) return false;
  return new Date(trialEnd) < Date.now();
}

export async function createCheckoutSession(priceId, email) {
  // In production: call your API endpoint that creates a Stripe Checkout session
  // const res = await fetch("/api/stripe/checkout", {
  //   method: "POST",
  //   body: JSON.stringify({ priceId, email }),
  // });
  // const { url } = await res.json();
  // window.location.href = url;
  console.log("Stripe checkout:", priceId, email);
  alert("Stripe checkout would open here. Connect Stripe keys to enable.");
}

export async function openCustomerPortal(email) {
  // In production: create Stripe billing portal session
  console.log("Stripe portal for:", email);
  alert("Stripe portal would open here. Connect Stripe keys to enable.");
}
