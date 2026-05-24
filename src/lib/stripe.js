// src/lib/stripe.js
// Stripe billing + tier gating
// Live mode with real products

export const STRIPE_CONFIG = {
  publishableKey: "pk_live_51Rgl1VELqxga7hwX9inCVLCjcGl4hC612LV0m9KotCseRO4nvh7rosgmDkpl2O4tHFJHjACRhntBYxRr8UjZEQlY00drSh9yRK",
  prices: {
    pro_monthly: "price_1Tak1GELqxga7hwXtn95eVkd",
    pro_annual: "price_1Tak1HELqxga7hwXJmDHghqP",
    premium_monthly: "price_1Tak1HELqxga7hwXpGmYbdIc",
    premium_annual: "price_1Tak1IELqxga7hwXjKmKd9Bi",
  },
};

// Tier hierarchy: free < pro < trial/premium
const TIER_LEVEL = { free: 0, trial: 3, pro: 2, premium: 3 };

export function canAccessModule(moduleTier, userTier, trialExpired) {
  if (userTier === "premium" || userTier === "admin") return true;
  if (userTier === "trial" && !trialExpired) return true;
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
  try {
    const res = await fetch("/api/stripe-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, email }),
    });
    const { url, error } = await res.json();
    if (error) throw new Error(error);
    if (url) window.location.href = url;
  } catch (err) {
    console.error("Checkout error:", err);
    alert("Unable to start checkout. Please try again.");
  }
}

export async function openCustomerPortal(email) {
  try {
    const res = await fetch("/api/stripe-portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const { url, error } = await res.json();
    if (error) throw new Error(error);
    if (url) window.location.href = url;
  } catch (err) {
    console.error("Portal error:", err);
    alert("Unable to open billing portal. Please try again.");
  }
}
