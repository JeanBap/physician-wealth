import { useState } from "react";
import { PRICING, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Alert, Badge } from "../components/ui";
import { canAccessModule } from "../lib/stripe";

export default function Billing({ profile, navigate, user }) {
  const [plan, setPlan] = useState(user?.isAdmin ? "premium" : "free");
  const isAdmin = user?.isAdmin;

  const plans = [
    { id:"free", name:"Free", price:0, annual:0, color:"#ffffff", features:["Dashboard","Salary Benchmarks","FI Countdown","State Arbitrage"], limit:"4 modules" },
    { id:"pro", name:"Pro", price:29, annual:290, color:"#60a5fa", features:["All Free features","Tax Scanner","Loan Optimizer","Spending Analysis","Retirement Planner","Burnout Calculator","Disability Sim","Moonlighting ROI","Practice Buyout","Malpractice Risk","Dual-Physician"], limit:"15 modules", savings:"Save $58/yr" },
    { id:"premium", name:"Premium", price:99, annual:990, color:"#34d399", features:["All Pro features","AI Tax Analysis (Claude)","Contract Scanner","Insurance Optimizer","Document Scanner","AI Chat Advisor","Mercury/Brex Banking","Priority Support"], limit:"All modules + AI", savings:"Save $198/yr" },
  ];

  return (
    <div className="space-y-5 animate-in">
      <Section title="Billing & Plans" sub="Manage your subscription" />

      {isAdmin && <Alert type="success">Admin account. Full access to all features, no billing required.</Alert>}

      {/* Current plan */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] text-white/15 uppercase">Current Plan</p>
            <p className="text-xl font-black" style={{ color: plans.find(p => p.id === plan)?.color }}>{isAdmin ? "Admin" : plans.find(p => p.id === plan)?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-white/50">${isAdmin ? 0 : plans.find(p => p.id === plan)?.price}<span className="text-[9px] text-white/15">/mo</span></p>
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
              {p.id === "pro" && !isAdmin && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-blue-500 text-[7px] text-white font-bold">POPULAR</div>}
              <p className="text-[9px] text-white/20 uppercase font-bold tracking-wider">{p.name}</p>
              <p className="text-2xl font-black mt-1.5" style={{ color: p.color }}>${p.price}<span className="text-[10px] text-white/15">/mo</span></p>
              {p.savings && <p className="text-[8px] text-emerald-400/40 mt-0.5">{p.savings} with annual</p>}
              <p className="text-[8px] text-white/15 mt-0.5">{p.limit}</p>
              <div className="mt-3 space-y-1">
                {p.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full" style={{ background: p.color, opacity: 0.4 }} />
                    <span className="text-[9px] text-white/20">{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => !isAdmin && setPlan(p.id)} disabled={isCurrent || isAdmin}
                className="w-full mt-4 py-2 rounded-lg text-[9px] font-bold transition" style={{
                  background: isCurrent ? `${p.color}15` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isCurrent ? `${p.color}30` : "rgba(255,255,255,0.06)"}`,
                  color: isCurrent ? p.color : "rgba(255,255,255,0.3)",
                  opacity: isCurrent ? 1 : 0.6,
                }}>
                {isCurrent ? "Current" : `Upgrade to ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <Card>
        <p className="text-[9px] text-white/15 uppercase tracking-widest mb-2">Payment Methods</p>
        <p className="text-[10px] text-white/20">Managed through Stripe. Click below to update.</p>
        <button className="mt-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-white/30 hover:text-white/50 transition">
          Manage Payment Method
        </button>
      </Card>

      <p className="text-[7px] text-white/8 text-center">Cancel anytime. 14-day free trial on Pro and Premium. No questions asked.</p>
    </div>
  );
}
