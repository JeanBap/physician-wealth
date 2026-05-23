// src/modules/Billing.jsx
// PROPS: { profile, setProfile }
// Handles: trial countdown, plan comparison, Stripe checkout, cancel flow

import { useState } from "react";
import { PRICING } from "../lib/data";
import { Section, Stat, Alert, Btn, Card } from "../components/ui";
import { createCheckoutSession, openCustomerPortal, getTrialDaysLeft, isTrialExpired } from "../lib/stripe";

export default function Billing({ profile, setProfile }) {
  const [loading, setLoading] = useState(null);
  const plan = profile.plan || "trial";
  const trialEnd = profile.trialEnd || new Date(Date.now() + 30 * 86400000).toISOString();
  const daysLeft = getTrialDaysLeft(trialEnd);
  const expired = isTrialExpired(trialEnd);

  const effectivePlan = plan === "trial" && expired ? "free" : plan;

  const handleUpgrade = async (tier) => {
    setLoading(tier);
    try {
      // In production: createCheckoutSession(PRICING[tier].priceId, profile.id, profile.email)
      alert(`Would redirect to Stripe Checkout for ${PRICING[tier].name} at $${PRICING[tier].price}/mo.\n\nStripe Price ID: ${PRICING[tier].priceId}`);
    } catch (err) {
      console.error(err);
    }
    setLoading(null);
  };

  const handleManage = async () => {
    // In production: openCustomerPortal(profile.stripeCustomerId)
    alert("Would open Stripe Customer Portal to manage subscription, update payment method, or cancel.");
  };

  return (
    <div className="space-y-5 animate-in">
      <Section title="Billing" sub="Subscription" />

      {/* Current plan status */}
      <div className={`rounded-2xl p-5 text-center border ${
        effectivePlan === "free"
          ? "bg-white/[0.03] border-white/[0.05]"
          : effectivePlan === "trial"
          ? "bg-emerald-500/[0.05] border-emerald-500/15"
          : effectivePlan === "premium"
          ? "bg-amber-500/[0.05] border-amber-500/15"
          : "bg-blue-500/[0.05] border-blue-500/15"
      }`}>
        <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Current Plan</p>
        <p className="text-2xl font-black text-white">{PRICING[effectivePlan]?.name || "Free"}</p>
        {plan === "trial" && !expired && (
          <div className="mt-2">
            <p className="text-sm text-emerald-400">{daysLeft} days left in trial</p>
            <div className="mt-2 h-1.5 bg-white/[0.04] rounded-full overflow-hidden max-w-xs mx-auto">
              <div className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${(daysLeft / 30) * 100}%` }} />
            </div>
            <p className="text-[9px] text-white/20 mt-2">
              Trial ends {new Date(trialEnd).toLocaleDateString()}. You'll be charged $29/mo unless you cancel.
            </p>
          </div>
        )}
        {plan === "trial" && expired && (
          <p className="text-sm text-red-400 mt-2">Trial expired. Upgrade to restore access.</p>
        )}
        {(plan === "pro" || plan === "premium") && (
          <div className="mt-3">
            <Btn variant="secondary" onClick={handleManage}>Manage Subscription</Btn>
          </div>
        )}
      </div>

      {/* Plan comparison */}
      <div className="space-y-3">
        {Object.entries(PRICING).filter(([k]) => k !== "trial").map(([key, tier]) => {
          const isCurrent = effectivePlan === key;
          const isUpgrade = !isCurrent && key !== "free";
          return (
            <Card key={key} className={isCurrent ? "border-emerald-500/20" : ""}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-white">{tier.name}</p>
                  <p className="text-[10px] text-white/25">
                    {tier.price === 0 ? "Free forever" : `$${tier.price}/${tier.period}`}
                  </p>
                </div>
                {isCurrent ? (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
                    CURRENT
                  </span>
                ) : isUpgrade ? (
                  <Btn onClick={() => handleUpgrade(key)} disabled={loading === key}>
                    {loading === key ? "..." : tier.cta}
                  </Btn>
                ) : null}
              </div>
              <div className="space-y-1">
                {tier.features.map((f, i) => (
                  <p key={i} className="text-[10px] text-white/30 flex items-center gap-1.5">
                    <span className="text-emerald-400/50">+</span> {f}
                  </p>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Billing FAQ */}
      <Card>
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Billing FAQ</h3>
        <div className="space-y-2 text-[10px] text-white/25">
          <div>
            <p className="text-white/40 font-medium">How does the trial work?</p>
            <p>30 days full Pro access. If you don't cancel, you'll be charged $29/mo automatically. Cancel anytime from this page or Stripe portal.</p>
          </div>
          <div>
            <p className="text-white/40 font-medium">What happens when I cancel?</p>
            <p>You keep access until the end of your billing period, then downgrade to Free (Dashboard + Salary + FI Countdown).</p>
          </div>
          <div>
            <p className="text-white/40 font-medium">Can I switch plans?</p>
            <p>Yes. Upgrade/downgrade anytime. Prorated billing handled by Stripe.</p>
          </div>
        </div>
      </Card>

      <Alert type="info">
        Payments processed securely by Stripe. We never see your card details.
      </Alert>
    </div>
  );
}
