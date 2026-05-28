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
    { id:"free", name:"Free", price:0, annual:0, color:"var(--text2, #555)", features:["Dashboard","Salary Benchmarks","Financial Independence","State Arbitrage"], limit:"4 modules" },
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
            <p className="text-xs uppercase" style={{ color: "var(--text3, #888)" }}>Current Plan</p>
            <p className="text-xl font-black" style={{ color: isAdmin ? "#34d399" : plans.find(p => p.id === plan)?.color }}>{isAdmin ? "Admin" : plans.find(p => p.id === plan)?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black" style={{ color: "var(--text2, #555)" }}>${isAdmin ? 0 : plans.find(p => p.id === plan)?.price}<span className="text-xs" style={{ color: "var(--text3, #888)" }}>/mo</span></p>
          </div>
        </div>
      </Card>

      {/* Plan comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {plans.map((p, i) => {
          const isCurrent = p.id === plan || (isAdmin && p.id === "premium");
          const accent = p.id === "free" ? "var(--text2, #555)" : p.color;
          return (
            <div key={p.id} className={`relative rounded-xl p-5 transition-all ${isCurrent ? "scale-[1.02]" : ""}`}
              style={{
                background: isCurrent ? "var(--cardBg, #fff)" : "var(--chartBarBg, rgba(0,0,0,0.02))",
                border: `1px solid ${isCurrent ? "var(--emerald, #50b8a0)" : "var(--border, rgba(0,0,0,0.08))"}`,
              }}>
              {p.id === "pro" && !isAdmin && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-blue-500 text-sm text-white font-bold">POPULAR</div>}
              <p className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--text3, #888)" }}>{p.name}</p>
              <p className="text-2xl font-black mt-1.5" style={{ color: accent }}>${p.price}<span className="text-sm" style={{ color: "var(--text3, #888)" }}>/mo</span></p>
              {p.savings && <p className="text-xs mt-0.5" style={{ color: "var(--emerald, #50b8a0)" }}>{p.savings} with annual</p>}
              <p className="text-xs mt-0.5" style={{ color: "var(--text3, #888)" }}>{p.limit}</p>
              <div className="mt-3 space-y-1">
                {p.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full" style={{ background: accent, opacity: 0.5 }} />
                    <span className="text-xs" style={{ color: "var(--text3, #888)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => {
                  if (isAdmin || isCurrent) return;
                  const priceKey = p.id === "pro" ? "pro_monthly" : "premium_monthly";
                  createCheckoutSession(STRIPE_CONFIG.prices[priceKey], user?.email || profile?.email);
                }} disabled={isCurrent || isAdmin || p.id === "free"}
                className="w-full mt-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer" style={{
                  background: isCurrent ? "var(--inputBg, #f5f5f5)" : p.id === "free" ? "var(--chartBarBg, rgba(0,0,0,0.02))" : `${p.color}20`,
                  border: `1px solid ${isCurrent ? "var(--border, #e0e0e0)" : p.id === "free" ? "var(--border, rgba(0,0,0,0.08))" : `${p.color}40`}`,
                  color: isCurrent ? "var(--text3, #888)" : p.id === "free" ? "var(--text3, #888)" : p.color,
                  opacity: isCurrent || p.id === "free" ? 0.6 : 1,
                }}>
                {isCurrent ? "Current" : p.id === "free" ? "Free Forever" : `Upgrade to ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <Card>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text3, #888)" }}>Payment Methods</p>
        <p className="text-sm" style={{ color: "var(--text3, #888)" }}>Managed through Stripe. Click below to update.</p>
        <button onClick={() => openCustomerPortal(user?.email || profile?.email)}
          className="mt-2 px-4 py-2 rounded-lg text-sm transition cursor-pointer"
          style={{ background: "var(--inputBg, #f5f5f5)", border: "1px solid var(--border, #e0e0e0)", color: "var(--text2, #555)" }}>
          Manage Payment Method
        </button>
      </Card>

      <p className="text-sm text-center" style={{ color: "var(--text3, #888)" }}>Cancel anytime. 30-day free trial on Pro and Premium. No questions asked.</p>
    </div>
  );
}
