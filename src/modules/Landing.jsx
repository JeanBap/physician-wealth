import { Section, Stat, Card, Btn } from "../components/ui";

const FEATURES = [
  { title: "Tax Optimization", desc: "5 physician-specific strategies. S-Corp, backdoor Roth, mega backdoor, HSA, QBI. Average savings: $15-50K/yr.", color: "#34d399" },
  { title: "Loan Optimizer", desc: "PSLF tracking, refinance modeling, aggressive payoff calculator. Compare 4 strategies side-by-side.", color: "#60a5fa" },
  { title: "Salary Benchmarking", desc: "20 specialties, percentile ranking, gap-to-75th analysis. Know your market value.", color: "#a78bfa" },
  { title: "FI Countdown", desc: "Live ticker to financial independence. 4% rule, growth modeling, progress tracking.", color: "#fbbf24" },
  { title: "AI Document Scanner", desc: "Upload contracts, insurance policies. Claude AI identifies red flags and optimization opportunities.", color: "#f87171" },
  { title: "Burnout Calculator", desc: "4-dimension assessment. Quantify the hidden financial cost of burnout including divorce risk and malpractice correlation.", color: "#f97316" },
];

const TIERS = [
  { name: "Free", price: "$0", features: ["Dashboard overview", "Salary benchmarking", "FI countdown"], cta: "Start Free" },
  { name: "Pro", price: "$29/mo", features: ["All financial tools", "Tax scanner", "Loan optimizer", "State arbitrage", "Contract analyzer", "Insurance gap analysis", "Disability simulator", "Moonlighting ROI", "Practice buyout"], cta: "Start 30-Day Trial", popular: true },
  { name: "Premium", price: "$99/mo", features: ["Everything in Pro", "AI Double-Pass Analysis", "Upload tax docs, contracts, insurance", "Claude Sonnet processes twice for accuracy", "AI Financial Advisor", "Priority support"], cta: "Start 30-Day Trial" },
];

export default function Landing({ navigate }) {
  return (
    <div className="min-h-screen" style={{ background: "#0a0b10" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between p-5 max-w-4xl mx-auto">
        <p className="text-emerald-400 text-lg font-black" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
          PhysicianWealth
        </p>
        <div className="flex gap-2">
          <button onClick={() => navigate("auth")} className="px-3 py-1.5 text-[10px] text-white/30 hover:text-white/50">Sign In</button>
          <button onClick={() => navigate("auth")} className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-400">
            Start Free Trial
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto px-4 py-16">
        <p className="text-[10px] text-emerald-400/50 uppercase tracking-[0.3em] mb-3">For Physicians Who Earn $200K+</p>
        <h1 className="text-3xl font-black text-white leading-tight" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
          Stop Leaving <span className="text-emerald-400">$15-50K</span> on the Table Every Year
        </h1>
        <p className="text-sm text-white/30 mt-4 max-w-lg mx-auto">
          82% of physicians overpay taxes. PhysicianWealth is the AI-powered financial command center that finds your money and puts it back in your pocket.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Btn onClick={() => navigate("auth")}>Start Free 30-Day Trial</Btn>
          <button className="px-4 py-2 text-[10px] text-white/30 border border-white/[0.08] rounded-xl hover:bg-white/[0.04]">
            See How It Works
          </button>
        </div>
        <div className="flex gap-6 justify-center mt-8">
          <Stat label="Avg tax savings" value="$32K" color="#34d399" />
          <Stat label="Specialties" value="20" color="#60a5fa" />
          <Stat label="Active physicians" value="2,400+" color="#a78bfa" />
        </div>
      </div>

      {/* Features */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-center text-[10px] text-white/15 uppercase tracking-widest mb-8">25+ Financial Modules</p>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <Card key={i}>
              <div className="w-2 h-2 rounded-full mb-2" style={{ background: f.color + "40" }} />
              <p className="text-[11px] text-white/60 font-bold mb-1">{f.title}</p>
              <p className="text-[9px] text-white/20 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-center text-[10px] text-white/15 uppercase tracking-widest mb-8">Simple Pricing</p>
        <div className="grid grid-cols-3 gap-3">
          {TIERS.map((t, i) => (
            <Card key={i} className={t.popular ? "border-emerald-500/20 bg-emerald-500/[0.03]" : ""}>
              {t.popular && <p className="text-[8px] text-emerald-400 font-bold uppercase mb-1">Most Popular</p>}
              <p className="text-white/60 font-bold text-sm">{t.name}</p>
              <p className="text-2xl font-black text-white mt-1">{t.price}</p>
              <div className="mt-3 space-y-1">
                {t.features.map((f, j) => (
                  <p key={j} className="text-[9px] text-white/25 flex gap-1"><span className="text-emerald-400/40">+</span> {f}</p>
                ))}
              </div>
              <button onClick={() => navigate("auth")}
                className={`mt-4 w-full py-2 rounded-xl text-[10px] font-bold transition ${
                  t.popular ? "bg-emerald-500 text-white hover:bg-emerald-400" : "bg-white/[0.05] text-white/30 hover:bg-white/[0.08]"
                }`}>
                {t.cta}
              </button>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-white/[0.03]">
        <p className="text-[8px] text-white/10">PhysicianWealth is not a substitute for professional financial advice. HIPAA-compliant. SOC-2 Type II.</p>
      </div>
    </div>
  );
}
