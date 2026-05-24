import { useState, useEffect, useRef } from "react";
import { MODULES, SPECIALTIES } from "../lib/data";

const FEATURES = [
  { icon:"📊", title:"AI Tax Analysis", desc:"Claude double-pass finds $15-50K in missed deductions.", color:"#34d399" },
  { icon:"🏥", title:"20 Specialties", desc:"Salary, malpractice, burnout data for every specialty.", color:"#60a5fa" },
  { icon:"🎯", title:"Financial Independence", desc:"Live countdown to financial independence with milestones.", color:"#fbbf24" },
  { icon:"⚖️", title:"State Arbitrage", desc:"Tax + cost of living optimizer across all 50 states.", color:"#a78bfa" },
  { icon:"📋", title:"Contract Scanner", desc:"AI reads employment contracts and flags unfavorable clauses.", color:"#f472b6" },
  { icon:"🏠", title:"Real Estate", desc:"Property ROI, physician mortgages, syndication analysis.", color:"#fbbf24" },
  { icon:"🔒", title:"Disability Sim", desc:"Model income disruption. Compare own-occupation carriers.", color:"#f87171" },
  { icon:"📈", title:"Net Worth Tracker", desc:"Track wealth over time with custom financial goals.", color:"#34d399" },
  { icon:"🧠", title:"Document Vault", desc:"Upload docs, AI analyzes and builds your financial context.", color:"#60a5fa" },
];

function AnimatedCounter({ target, duration = 2000, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const start = Date.now();
        const tick = () => {
          const t = Math.min(1, (Date.now() - start) / duration);
          const eased = 1 - Math.pow(1 - t, 4);
          setCount(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

export default function Landing({ navigate }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background:"#06070b" }}
      onMouseMove={e => setMousePos({ x: e.clientX, y: e.clientY })}>
      
      {/* Animated background */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="orb orb-1" style={{ top:"-15%", left:"-10%" }} />
      <div className="orb orb-2" style={{ bottom:"-20%", right:"-5%" }} />
      <div className="orb orb-3" style={{ top:"50%", left:"40%" }} />
      
      {/* Mouse-follow glow */}
      <div className="absolute pointer-events-none transition-all duration-500 ease-out" style={{
        width:600, height:600, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)",
        left: mousePos.x - 300, top: mousePos.y - 300,
      }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <p className="text-emerald-400 text-lg font-black" style={{ fontFamily:"'Instrument Serif', Georgia, serif" }}>PhysicianWealth</p>
        <div className="flex gap-3">
          <button onClick={() => navigate("auth")} className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white/70 transition">Sign In</button>
          <button onClick={() => navigate("auth")} className="px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-sm text-emerald-400 font-bold hover:bg-emerald-500/25 transition">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-20">
        <div className="animate-fade">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold glow-pulse">
              30+ Financial Tools
            </span>
            <span className="text-xs text-white/40">Built for US physicians</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight" style={{ fontFamily:"'Instrument Serif', Georgia, serif" }}>
            <span className="text-white">Stop Leaving</span><br/>
            <span className="text-gradient">$50K on the Table</span><br/>
            <span className="text-white/40 text-4xl md:text-5xl">Every Single Year</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/40 mt-6 max-w-xl leading-relaxed">
            82% of physicians overpay taxes. AI-powered analysis finds what your CPA misses.
            Specialty-specific. Real-time. Yours.
          </p>
          
          <div className="flex gap-4 mt-10">
            <button onClick={() => navigate("auth")}
              className="group px-8 py-4 rounded-xl bg-emerald-500 text-black font-bold text-base hover:bg-emerald-400 transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02]">
              Start Free Trial
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">&#8594;</span>
            </button>
            <button onClick={() => navigate("auth")}
              className="px-8 py-4 rounded-xl border border-white/10 text-white/50 font-medium text-base hover:border-white/20 hover:text-white/70 transition-all duration-300">
              Watch Demo
            </button>
          </div>
        </div>
        
        {/* Floating stat cards */}
        <div className="absolute right-0 top-20 hidden lg:block animate-scale" style={{ animationDelay:"0.3s" }}>
          <div className="glass rounded-2xl p-5 glow-pulse" style={{ transform:"rotate(3deg)" }}>
            <p className="text-xs text-emerald-400/70 uppercase tracking-wider">Tax Savings Found</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">$47,200</p>
            <p className="text-xs text-white/40 mt-1">Cardiology, New York</p>
          </div>
        </div>
        <div className="absolute right-24 top-52 hidden lg:block animate-scale" style={{ animationDelay:"0.5s" }}>
          <div className="glass rounded-2xl p-4" style={{ transform:"rotate(-2deg)" }}>
            <p className="text-xs text-blue-400/70 uppercase tracking-wider">FI Progress</p>
            <p className="text-2xl font-black text-blue-400 mt-1">67%</p>
            <div className="w-24 h-1.5 bg-white/[0.06] rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full" style={{ width:"67%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar with animated counters */}
      <div className="relative z-10 border-y border-white/[0.04]" style={{ background:"rgba(255,255,255,0.01)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { v:82, s:"%", l:"Physicians overpay taxes", src:"Medscape 2025" },
            { v:50, p:"$", s:"K", l:"Average annual overpayment", src:"MGMA data" },
            { v:296, p:"$", s:"K", l:"Average trainee debt", src:"AAMC 2025" },
            { v:30, s:"+", l:"Financial planning tools", src:"All specialties" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-emerald-400">
                <AnimatedCounter target={s.v} prefix={s.p||""} suffix={s.s||""} duration={1500 + i * 200} />
              </p>
              <p className="text-sm text-white/50 mt-2">{s.l}</p>
              <p className="text-xs text-white/40 mt-0.5">{s.src}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-20">
        <p className="text-xs text-emerald-400/70 uppercase tracking-[0.2em] font-bold mb-3">Features</p>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3" style={{ fontFamily:"'Instrument Serif', Georgia, serif" }}>
          Everything a physician needs
        </h2>
        <p className="text-base text-white/40 mb-10 max-w-lg">30 modules working together. Change one number, watch the ripple across your entire financial picture.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
          {FEATURES.map((f, i) => (
            <div key={i} className="glass border-glow rounded-xl p-6 transition-all duration-300 cursor-pointer glass-hover">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background:`${f.color}10`, border:`1px solid ${f.color}20` }}>
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-white/70 mb-2">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-16 border-t border-white/[0.04]">
        <p className="text-xs text-emerald-400/70 uppercase tracking-[0.2em] font-bold mb-3 text-center">How It Works</p>
        <h2 className="text-3xl font-black text-white mb-12 text-center" style={{ fontFamily:"'Instrument Serif', Georgia, serif" }}>
          Three minutes to clarity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step:"01", title:"Tell us about you", desc:"5-step onboarding: specialty, salary, debt, assets, goals. Takes 2 minutes. Or skip and explore." },
            { step:"02", title:"Upload your docs", desc:"Tax returns, contracts, insurance policies. AI analyzes each with double-pass verification and builds your context." },
            { step:"03", title:"Get your plan", desc:"Dashboard shows exactly where you stand. Action items ranked by impact. Every number interconnected." },
          ].map((s, i) => (
            <div key={i} className="text-center relative">
              <div className="w-16 h-16 rounded-2xl glass mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-black text-gradient">{s.step}</span>
              </div>
              <h3 className="text-lg font-bold text-white/70 mb-2">{s.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
              {i < 2 && <div className="hidden md:block absolute top-8 -right-4 text-white/10 text-2xl">&#8594;</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-20 border-t border-white/[0.04]">
        <p className="text-xs text-emerald-400/70 uppercase tracking-[0.2em] font-bold mb-3 text-center">Pricing</p>
        <h2 className="text-3xl font-black text-white mb-3 text-center" style={{ fontFamily:"'Instrument Serif', Georgia, serif" }}>
          Pays for itself in one session
        </h2>
        <p className="text-base text-white/40 text-center mb-10">Average user finds $15K+ in savings. That's 150x ROI on Premium.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { tier:"Free", price:"$0", desc:"Core tools forever", features:["Dashboard + Financial Independence","Salary Benchmarking","Spending Analysis","Emergency Fund","Net Worth Tracker"], color:"#ffffff", border:"rgba(255,255,255,0.06)" },
            { tier:"Pro", price:"$29", per:"/mo", desc:"Full analytics suite", features:["Everything in Free","Tax Scanner + Calendar","Loan Optimizer","State Arbitrage","Retirement + RE Planning","Insurance + Disability","Practice Buyout + Moonlighting","Burnout + Malpractice Risk","Dual-Physician + Estate Plan","Document Vault","Bank Connections"], color:"#60a5fa", border:"rgba(96,165,250,0.2)", popular:true },
            { tier:"Premium", price:"$99", per:"/mo", desc:"AI-powered analysis", features:["Everything in Pro","AI Tax Analysis (double-pass)","Contract Scanner (AI)","Document Scanner (AI)","AI Chat Advisor","Full context-aware AI","Priority support"], color:"#34d399", border:"rgba(52,211,153,0.2)" },
          ].map((p, i) => (
            <div key={i} className={`relative glass rounded-2xl p-7 transition-all duration-300 ${p.popular ? "scale-[1.03] glow-pulse" : "hover:scale-[1.01]"}`}
              style={{ borderColor: p.border }}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-500 text-xs text-white font-bold shadow-lg shadow-blue-500/30">MOST POPULAR</div>}
              <p className="text-xs text-white/40 uppercase font-bold tracking-wider">{p.tier}</p>
              <div className="flex items-baseline gap-1 mt-2">
                <p className="text-4xl font-black" style={{ color: p.color }}>{p.price}</p>
                {p.per && <span className="text-base text-white/40">{p.per}</span>}
              </div>
              <p className="text-sm text-white/40 mt-1 mb-5">{p.desc}</p>
              <div className="space-y-2 mb-6">
                {p.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color, opacity: 0.5 }} />
                    <span className="text-sm text-white/50">{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate("auth")}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.02]" style={{
                  background: p.popular ? `${p.color}20` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${p.border}`, color: p.color === "#ffffff" ? "rgba(255,255,255,0.5)" : p.color,
                }}>
                {p.tier === "Free" ? "Start Free" : "Start 14-Day Trial"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-16 border-t border-white/[0.04]">
        <p className="text-xs text-emerald-400/70 uppercase tracking-[0.2em] font-bold mb-3 text-center">Testimonials</p>
        <h2 className="text-3xl font-black text-white mb-10 text-center" style={{ fontFamily:"'Instrument Serif', Georgia, serif" }}>
          Physicians love this
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger">
          {[
            { quote:"Found $32K in missed deductions. The AI scanner caught things my CPA missed for 3 years.", name:"Dr. Sarah Chen", spec:"Cardiology, NY", save:"$32,400/yr" },
            { quote:"State arbitrage tool showed me moving from CA to TX gains $47K/year after COL. We moved.", name:"Dr. Marcus Rivera", spec:"Orthopedic Surgery, TX", save:"$47,100/yr" },
            { quote:"The retirement planner with RE analysis showed I could retire 6 years earlier by selling rental properties at 55.", name:"Dr. Priya Patel", spec:"Emergency Medicine, FL", save:"6 years earlier" },
          ].map((t, i) => (
            <div key={i} className="glass rounded-xl p-6 border-glow">
              <div className="flex gap-0.5 mb-3">{Array(5).fill(0).map((_,j) => <span key={j} className="text-amber-400 text-base">&#9733;</span>)}</div>
              <p className="text-sm text-white/55 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/65 font-bold">{t.name}</p>
                  <p className="text-xs text-white/40">{t.spec}</p>
                </div>
                <span className="text-sm font-black text-emerald-400">{t.save}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4" style={{ fontFamily:"'Instrument Serif', Georgia, serif" }}>
          Your money deserves a<br/><span className="text-gradient">physician-grade checkup</span>
        </h2>
        <p className="text-base text-white/40 mb-8">14-day free trial. No credit card. Cancel anytime.</p>
        <button onClick={() => navigate("auth")}
          className="group px-10 py-4 rounded-xl bg-emerald-500 text-black font-bold text-lg hover:bg-emerald-400 transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.03]">
          Start Free Trial
          <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">&#8594;</span>
        </button>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-white/[0.04] py-8 text-center">
        <p className="text-emerald-400 text-base font-bold" style={{ fontFamily:"'Instrument Serif', Georgia, serif" }}>PhysicianWealth</p>
        <p className="text-xs text-white/40 mt-1">Not financial advice. Educational tool for physician financial planning.</p>
      </div>
    </div>
  );
}
