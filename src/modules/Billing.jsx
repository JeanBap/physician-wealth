import { useState } from "react";
import { PRICING, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Alert, Badge } from "../components/ui";
import { canAccessModule, createCheckoutSession, openCustomerPortal, STRIPE_CONFIG } from "../lib/stripe";

export default function Billing({ profile, navigate, user }) {
  const [plan, setPlan] = useState(user?.isAdmin ? "premium" : "free");
  const [checkoutMsg, setCheckoutMsg] = useState(() => {
    const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
    if (params.get("success") === "true") return "success";
    if (params.get("canceled") === "true") return "canceled";
    return null;
  });
  const isAdmin = user?.isAdmin;

  const plans = [
    { id:"free", name:"Free", price:0, annual:0, color:"#ffffff", features:["Dashboard","Salary Benchmarks","Financial Independence","State Arbitrage"], limit:"4 modules" },
    { id:"pro", name:"Pro", price:29, annual:290, color:"#60a5fa", features:["All Free features","Tax Scanner","Loan Optimizer","Spending Analysis","Retirement Planner","Burnout Calculator","Disability Sim","Moonlighting ROI","Practice Buyout","Malpractice Risk","Dual-Physician"], limit:"15 modules", savings:"Save $58/yr" },
    { id:"premium", name:"Premium", price:99, annual:990, color:"#34d399", features:["All Pro features","AI Tax Analysis (Claude)","Contract Scanner","Insurance Optimizer","Document Scanner","AI Chat Advisor","Mercury/Brex Banking","Priority Support"], limit:"All modules + AI", savings:"Save $198/yr" },
  ];

  return (
    <div className="space-y-5 animate-in">
      <Section title="Billing & Plans" sub="Manage your subscription" />

      {checkoutMsg === "success" && <Alert type="success">Payment successful! Your subscription is now active. It may take a moment to update.</Alert>}
      {checkoutMsg === "canceled" && <Alert type="warn">Checkout was canceled. No charges were made.</Alert>}
      {isAdmin && <Alert type="success">Admin account. Full access to all features, no billing required.</Alert>}

      {/* Current plan */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/55 uppercase">Current Plan</p>
            <p className="text-xl font-black" style={{ color: plans.find(p => p.id === plan)?.color }}>{isAdmin ? "Admin" : plans.find(p => p.id === plan)?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-white/65">${isAdmin ? 0 : plans.find(p => p.id === plan)?.price}<span className="text-xs text-white/55">/mo</span></p>
          </div>
        </div>
      </Card>

      {/* Plan comparison */}
      <div className="grid grid-cols-3 gap-3">
        {plans.map((p, i) => {
          const isCurrent = p.id === plan || (isAdmin && p.id === "premium");
          return (
            <div key={p.id} className={`relative rounded-xl p-5 transition-all ${isCurrent ? "scale-[1.02]" : ""}`}
              style={{
                background: isCurrent ? `linear-gradient(180deg, ${p.color}08 0%, transparent 100%)` : "rgba(255,255,255,0.02)",
                border: `1px solid ${isCurrent ? `${p.color}30` : "rgba(255,255,255,0.05)"}`,
              }}>
              {p.id === "pro" && !isAdmin && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-blue-500 text-sm text-white font-bold">POPULAR</div>}
              <p className="text-xs text-white/55 uppercase font-bold tracking-wider">{p.name}</p>
              <p className="text-2xl font-black mt-1.5" style={{ color: p.color }}>${p.price}<span className="text-sm text-white/55">/mo</span></p>
              {p.savings && <p className="text-xs text-emerald-400/70 mt-0.5">{p.savings} with annual</p>}
              <p className="text-xs text-white/55 mt-0.5">{p.limit}</p>
              <div className="mt-3 space-y-1">
                {p.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full" style={{ background: p.color, opacity: 0.4 }} />
                    <span className="text-xs text-white/55">{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => {
                  if (isAdmin || isCurrent) return;
                  const priceKey = p.id === "pro" ? "pro_monthly" : "premium_monthly";
                  createCheckoutSession(STRIPE_CONFIG.prices[priceKey], user?.email || profile?.email);
                }} disabled={isCurrent || isAdmin || p.id === "free"}
                className="w-full mt-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer" style={{
                  background: isCurrent ? `${p.color}15` : p.id === "free" ? "rgba(255,255,255,0.02)" : `${p.color}20`,
                  border: `1px solid ${isCurrent ? `${p.color}30` : p.id === "free" ? "rgba(255,255,255,0.04)" : `${p.color}40`}`,
                  color: isCurrent ? p.color : p.id === "free" ? "rgba(255,255,255,0.2)" : p.color,
                  opacity: isCurrent || p.id === "free" ? 0.6 : 1,
                }}>
                {isCurrent ? "Current" : p.id === "free" ? "Free Forever" : `Upgrade to ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-2">Payment Methods</p>
        <p className="text-sm text-white/55">Managed through Stripe. Click below to update.</p>
        <button onClick={() => openCustomerPortal(user?.email || profile?.email)} className="mt-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white/75 hover:text-white/65 transition cursor-pointer">
          Manage Payment Method
        </button>
      </Card>

      <p className="text-sm text-white/55 text-center">Cancel anytime. 14-day free trial on Pro and Premium. No questions asked.</p>
    </div>
  );
}
