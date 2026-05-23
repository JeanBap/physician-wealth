import { useState, useEffect, useMemo } from "react";
import { SPECIALTIES, MODULES, STATE_TAX, fedTax, fica, fmt, fN } from "../lib/data";
import { Stat, Card, Donut, Spark } from "../components/ui";
import FICountdown from "./FICountdown";

const WEALTH_SPARKLINE = [80, 95, 88, 110, 125, 118, 140, 155, 162, 170, 185, 200];

export default function Dashboard({ profile, navigate }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const sal = profile.salary || spec.m;
  const state = profile.state || "NY";

  const savings = profile.savings || 50000;
  const retirement = profile.retirement || 100000;
  const investments = profile.investments || 80000;
  const loans = profile.loans || 250000;
  const netWorth = savings + retirement + investments - loans;
  const totalTax = fedTax(sal, profile.married) + Math.round(sal * (STATE_TAX[state] || 0)) + Math.round(fica(sal));
  const takeHome = sal - totalTax;
  const savingsRate = sal > 0 ? Math.round(((sal * 0.2) / sal) * 100) : 0;
  const fiTarget = sal * 0.6 / 0.04;
  const fiPct = Math.min(100, Math.round((netWorth / fiTarget) * 100));

  const sorted = Object.entries(SPECIALTIES).sort((a, b) => b[1].m - a[1].m);
  const rank = sorted.findIndex(([k]) => k === profile.specialty) + 1;

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  const quickNav = Object.entries(MODULES)
    .filter(([k, m]) => !m.always && (profile.priorities?.includes(k) || m.tier === "free"))
    .slice(0, 8);

  // Animated counter
  const [animNw, setAnimNw] = useState(0);
  useEffect(() => {
    let frame;
    const start = Date.now();
    const dur = 1200;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / dur);
      const ease = 1 - Math.pow(1 - t, 3);
      setAnimNw(Math.round(netWorth * ease));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [netWorth]);

  return (
    <div className="space-y-6 animate-in">
      {/* Hero greeting with radial glow */}
      <div className="relative overflow-hidden rounded-2xl p-6" style={{
        background: "radial-gradient(ellipse at 30% 0%, rgba(52,211,153,0.08) 0%, transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)",
        border: "1px solid rgba(255,255,255,0.04)"
      }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(52,211,153,0.15), transparent 70%)" }} />
        <p className="text-[10px] text-white/20 uppercase tracking-[0.15em]">{greeting()}</p>
        <h1 className="text-2xl font-black text-white mt-1" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
          Dr. {profile.lastName || "Physician"}
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/60 font-medium">
            {profile.specialty}
          </span>
          <span className="text-[9px] text-white/15">{state}</span>
          <span className="text-[9px] text-white/15">Rank #{rank}/20</span>
        </div>
      </div>

      {/* FI Countdown */}
      <FICountdown profile={profile} />

      {/* Net Worth hero card */}
      <div className="relative overflow-hidden rounded-2xl p-5" style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(52,211,153,0.04) 100%)",
        border: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] text-white/20 uppercase tracking-widest">Net Worth</p>
            <p className="text-3xl font-black tabular-nums mt-1" style={{
              color: animNw >= 0 ? "#34d399" : "#f87171",
              fontFamily: "'Inter', monospace"
            }}>
              {fmt(animNw)}
            </p>
            <p className="text-[9px] text-white/15 mt-0.5">
              {fiPct}% to FI target ({fmt(fiTarget)})
            </p>
          </div>
          <Spark data={WEALTH_SPARKLINE} color="#34d399" w={100} h={32} />
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-1 bg-white/[0.04] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${fiPct}%`,
              background: "linear-gradient(90deg, #34d399, #6ee7b7)"
            }} />
        </div>
      </div>

      {/* 4 key stats - glassmorphism */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Annual Income", value: fmt(sal), color: "#60a5fa", sub: `${profile.specialty}` },
          { label: "Take-Home", value: fmt(takeHome), color: "#34d399", sub: `Tax: ${((totalTax/sal)*100).toFixed(0)}%` },
          { label: "Savings Rate", value: `${savingsRate}%`, color: savingsRate >= 20 ? "#34d399" : "#fbbf24", sub: savingsRate >= 20 ? "On track" : "Below 20% target" },
          { label: "Student Loans", value: fmt(loans), color: loans > 0 ? "#f87171" : "#34d399", sub: loans > 0 ? "Outstanding" : "Debt free" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-4 backdrop-blur-sm" style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.15)"
          }}>
            <p className="text-[8px] text-white/20 uppercase tracking-wider">{s.label}</p>
            <p className="text-xl font-black tabular-nums mt-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[8px] text-white/15 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Wealth breakdown donut */}
      <Card>
        <div className="flex items-center gap-6">
          <Donut value={fiPct} max={100} size={100} sw={8} color="#34d399">
            <p className="text-lg font-black text-emerald-400">{fiPct}%</p>
            <p className="text-[7px] text-white/15">FI</p>
          </Donut>
          <div className="flex-1 space-y-2">
            {[
              { label: "Retirement", value: retirement, color: "#34d399" },
              { label: "Investments", value: investments, color: "#60a5fa" },
              { label: "Savings", value: savings, color: "#a78bfa" },
              { label: "Loans", value: -loans, color: "#f87171" },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                  <span className="text-[10px] text-white/30">{a.label}</span>
                </div>
                <span className="text-[10px] font-bold tabular-nums" style={{ color: a.color }}>
                  {fN(a.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Module quick-nav grid */}
      <div>
        <p className="text-[8px] text-white/10 uppercase tracking-[0.2em] mb-3">Your Modules</p>
        <div className="grid grid-cols-4 gap-2">
          {quickNav.map(([k, m]) => (
            <button key={k} onClick={() => navigate(k)}
              className="group p-3 rounded-xl text-center transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${m.color || '#34d399'}10`;
                e.currentTarget.style.borderColor = `${m.color || '#34d399'}25`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)";
              }}>
              <p className="text-lg mb-1 opacity-30">{m.icon}</p>
              <p className="text-[9px] text-white/30 group-hover:text-white/60 font-medium transition">{m.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Smart alerts */}
      <div className="space-y-2">
        {loans > 200000 && (
          <button onClick={() => navigate("loans")}
            className="w-full text-left p-3 rounded-xl border border-amber-500/10 bg-amber-500/[0.03] hover:bg-amber-500/[0.06] transition">
            <div className="flex items-center gap-2">
              <div className="w-1 h-8 rounded-full bg-amber-500/40" />
              <div>
                <p className="text-[10px] text-amber-300/60 font-medium">Student loans exceed $200K</p>
                <p className="text-[8px] text-white/15">Review PSLF and refinance options in Loan Optimizer</p>
              </div>
            </div>
          </button>
        )}
        {savingsRate < 20 && (
          <button onClick={() => navigate("spending")}
            className="w-full text-left p-3 rounded-xl border border-red-500/10 bg-red-500/[0.03] hover:bg-red-500/[0.06] transition">
            <div className="flex items-center gap-2">
              <div className="w-1 h-8 rounded-full bg-red-500/40" />
              <div>
                <p className="text-[10px] text-red-300/60 font-medium">Savings rate below 20%</p>
                <p className="text-[8px] text-white/15">Analyze spending patterns and optimize take-home</p>
              </div>
            </div>
          </button>
        )}
        {spec.burn > 40 && (
          <button onClick={() => navigate("burnout")}
            className="w-full text-left p-3 rounded-xl border border-purple-500/10 bg-purple-500/[0.03] hover:bg-purple-500/[0.06] transition">
            <div className="flex items-center gap-2">
              <div className="w-1 h-8 rounded-full bg-purple-500/40" />
              <div>
                <p className="text-[10px] text-purple-300/60 font-medium">{profile.specialty}: {spec.burn}% burnout rate</p>
                <p className="text-[8px] text-white/15">Calculate the hidden financial cost of burnout</p>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
