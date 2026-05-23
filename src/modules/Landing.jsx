import { Section, Stat, Card, Badge } from "../components/ui";
import { MODULES, SPECIALTIES, PRICING } from "../lib/data";

const FEATURES = [
  { icon:"📊", title:"AI Tax Analysis", desc:"Upload your return. Claude double-pass finds $15-50K in missed deductions.", color:"#34d399" },
  { icon:"🏥", title:"20 Specialties", desc:"Salary, malpractice, burnout, claim rates for every medical specialty.", color:"#60a5fa" },
  { icon:"🎯", title:"FI Countdown", desc:"Live countdown to financial independence. Track milestones in real-time.", color:"#fbbf24" },
  { icon:"⚖️", title:"State Arbitrage", desc:"Tax + cost of living optimizer. Find the best state for your net worth.", color:"#a78bfa" },
  { icon:"📋", title:"Contract Scanner", desc:"AI reads your employment contract and flags unfavorable clauses.", color:"#f472b6" },
  { icon:"🔒", title:"Disability Sim", desc:"Model income disruption scenarios. Compare own-occupation DI carriers.", color:"#f87171" },
];

const STATS = [
  { v:"82%", l:"Physicians overpay taxes", s:"Medscape 2025" },
  { v:"$15-50K", l:"Average annual overpayment", s:"MGMA data" },
  { v:"74%", l:"Trainees carry avg $296K debt", s:"AAMC" },
  { v:"20+", l:"Specialty-specific modules", s:"Custom analytics" },
];

export default function Landing({ navigate }) {
  return (
    <div className="min-h-screen" style={{ background:"#0a0b10" }}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background:"radial-gradient(ellipse at 30% 20%, rgba(52,211,153,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(96,165,250,0.05) 0%, transparent 50%)" }} />
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">BETA</span>
            <span className="text-[9px] text-white/15">Built for physicians, by a finance professional</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight" style={{ fontFamily:"'Instrument Serif', Georgia, serif" }}>
            Your Financial<br/><span className="text-emerald-400">Command Center</span>
          </h1>
          <p className="text-lg text-white/30 mt-4 max-w-xl leading-relaxed">
            AI-powered tax analysis, specialty-specific benchmarks, and real-time FI tracking.
            Physicians overpay $15-50K/yr in taxes. Stop.
          </p>
          <div className="flex gap-3 mt-8">
            <button onClick={() => navigate("auth")}
              className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20">
              Start Free Trial
            </button>
            <button onClick={() => navigate("auth")}
              className="px-6 py-3 rounded-xl border border-white/10 text-white/40 font-medium text-sm hover:border-white/20 hover:text-white/60 transition">
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-y border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-black text-emerald-400">{s.v}</p>
              <p className="text-[10px] text-white/30 mt-1">{s.l}</p>
              <p className="text-[8px] text-white/10">{s.s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-[10px] text-emerald-400/40 uppercase tracking-[0.2em] font-bold mb-2">Features</p>
        <h2 className="text-3xl font-black text-white mb-8" style={{ fontFamily:"'Instrument Serif', Georgia, serif" }}>
          Everything in one place
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="group p-5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
              style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}30`; e.currentTarget.style.background = `${f.color}05`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}>
              <p className="text-2xl mb-3 opacity-30 group-hover:opacity-60 transition">{f.icon}</p>
              <h3 className="text-sm font-bold text-white/60 mb-1">{f.title}</h3>
              <p className="text-[10px] text-white/20 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="max-w-4xl mx-auto px-6 py-16 border-t border-white/[0.04]">
        <p className="text-[10px] text-emerald-400/40 uppercase tracking-[0.2em] font-bold mb-2 text-center">Pricing</p>
        <h2 className="text-3xl font-black text-white mb-8 text-center" style={{ fontFamily:"'Instrument Serif', Georgia, serif" }}>
          Pay less than you save
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { tier:"Free", price:"$0", desc:"Dashboard, salary benchmarks, FI countdown", features:["Dashboard","Salary Benchmarking","FI Countdown","State Arbitrage"], color:"#ffffff", border:"rgba(255,255,255,0.06)" },
            { tier:"Pro", price:"$29/mo", desc:"Full analytics suite for serious planning", features:["Everything in Free","Tax Scanner","Loan Optimizer","Spending Analysis","Retirement Planner","Burnout Calculator","Disability Sim","Practice Buyout"], color:"#60a5fa", border:"rgba(96,165,250,0.2)", popular:true },
            { tier:"Premium", price:"$99/mo", desc:"AI-powered analysis with Claude double-pass", features:["Everything in Pro","AI Tax Analysis","Contract Scanner","Insurance Optimizer","Document Scanner","AI Chat Advisor","Mercury/Brex Integration"], color:"#34d399", border:"rgba(52,211,153,0.2)" },
          ].map((p, i) => (
            <div key={i} className={`relative rounded-xl p-6 ${p.popular ? "scale-[1.02]" : ""}`}
              style={{ background: p.popular ? `linear-gradient(180deg, ${p.color}08 0%, transparent 100%)` : "rgba(255,255,255,0.02)", border: `1px solid ${p.border}` }}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-500 text-[8px] text-white font-bold">POPULAR</div>}
              <p className="text-[10px] text-white/20 uppercase font-bold tracking-wider">{p.tier}</p>
              <p className="text-3xl font-black mt-2" style={{ color: p.color }}>{p.price}</p>
              <p className="text-[10px] text-white/15 mt-1 mb-4">{p.desc}</p>
              <div className="space-y-1.5">
                {p.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full" style={{ background: p.color, opacity: 0.4 }} />
                    <span className="text-[10px] text-white/25">{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate("auth")}
                className="w-full mt-5 py-2.5 rounded-lg text-[10px] font-bold transition" style={{
                  background: p.popular ? `${p.color}15` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${p.border}`,
                  color: p.color === "#ffffff" ? "rgba(255,255,255,0.4)" : p.color,
                }}>
                {p.tier === "Free" ? "Start Free" : "Start 14-Day Trial"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.04] py-8 text-center">
        <p className="text-emerald-400 text-sm font-bold" style={{ fontFamily:"'Instrument Serif', Georgia, serif" }}>PhysicianWealth</p>
        <p className="text-[8px] text-white/10 mt-1">Not financial advice. Educational tool for physician financial planning.</p>
      </div>
    </div>
  );
}
