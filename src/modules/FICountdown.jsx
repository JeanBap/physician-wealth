import { useState, useEffect, useMemo } from "react";
import { SPECIALTIES, fmt, fN } from "../lib/data";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-[9px] text-white/30 mb-1">Age {label}</p>
    {payload.map((p,i)=><p key={i} className="text-[11px] font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>);
};

export default function FICountdown({ profile: p, standalone }) {
  const sal = p.salary || 300000;
  const age = p.age || 35;
  const fi = (sal * 0.6) / 0.04;
  const nw = (p.savings || 0) + (p.investments || 0) + (p.retirement || 0) - (p.loans || 0);
  const moSave = Math.round(sal * 0.2 / 12);
  const mr = 0.07 / 12;
  const pct = Math.min(100, Math.round((nw / fi) * 100));

  let months = 0, bal = nw;
  if (bal < fi) { while (bal < fi && months < 600) { bal = bal * (1 + mr) + moSave; months++; } }
  const totalDays = months * 30.44;
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  const fiAge = age + yrs + (mos >= 6 ? 1 : 0);

  const [tick, setTick] = useState(totalDays);
  useEffect(() => {
    const iv = setInterval(() => setTick(prev => Math.max(0, prev - 0.0000116)), 1000);
    return () => clearInterval(iv);
  }, []);

  const totalD = Math.floor(tick);
  const countYrs = Math.floor(totalD / 365);
  const countMos = Math.floor((totalD % 365) / 30);
  const countDays = totalD % 30;
  
  

  // Journey chart (only in standalone mode)
  const journey = useMemo(() => {
    let b = nw;
    return Array.from({ length: Math.min(41, fiAge - age + 6) }, (_, i) => {
      const a = age + i;
      const d = { age: a, netWorth: Math.round(b), target: fi };
      b = b * 1.07 + moSave * 12;
      return d;
    });
  }, [nw, fi, moSave, age, fiAge]);

  // Milestones
  const milestones = useMemo(() => {
    const targets = [100000, 250000, 500000, 1000000, 2000000, fi];
    let b = nw;
    return targets.map(t => {
      let mo = 0;
      let bb = nw;
      while (bb < t && mo < 600) { bb = bb * (1 + mr) + moSave; mo++; }
      const yr = Math.floor(mo / 12);
      return { target: t, months: mo, years: yr, age: age + yr, reached: nw >= t };
    }).filter(m => m.target > nw * 0.5);
  }, [nw, fi, moSave, mr, age]);

  return (
    <div className="space-y-0">
      {/* Main countdown */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-center" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(52,211,153,0.12) 0%, transparent 60%), linear-gradient(180deg, rgba(52,211,153,0.03) 0%, transparent 100%)",
        border: "1px solid rgba(52,211,153,0.12)"
      }}>
        {/* Glowing orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full opacity-10" style={{ background: "radial-gradient(circle, rgba(52,211,153,0.4), transparent 70%)" }} />

        <p className="text-[9px] text-emerald-400/50 uppercase tracking-[0.25em] font-bold mb-3 relative">
          Financial Independence In
        </p>

        <div className="flex items-center justify-center gap-4 relative">
          {[[countYrs, "years"], [countMos, "months"], [countDays, "days"]].map(([v, l], i) => (
            <div key={i} className="text-center">
              <div className="relative">
                <p className="text-4xl lg:text-5xl font-black text-emerald-400 tabular-nums leading-none"
                  style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 30px rgba(52,211,153,0.3)" }}>
                  {String(v).padStart(l === "years" ? 1 : 2, "0")}
                </p>
              </div>
              <p className="text-[8px] text-emerald-400/25 uppercase mt-1.5 tracking-wider">{l}</p>
            </div>
          ))}
        </div>

        {/* Progress ring */}
        <div className="flex justify-center mt-4 mb-2">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(52,211,153,0.06)" strokeWidth="6"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#34d399" strokeWidth="6"
                strokeDasharray={`${pct * 2.64} 264`} strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 4px rgba(52,211,153,0.4))", transition: "stroke-dasharray 1s ease" }}/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-lg font-black text-emerald-400">{pct}%</p>
              <p className="text-[6px] text-emerald-400/20 uppercase">Complete</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-5 text-[9px] relative">
          <div><p className="text-white/10 text-[7px] uppercase">Current</p><p className="text-white/30 font-bold">{fmt(nw)}</p></div>
          <div className="w-px h-5 bg-white/5"/>
          <div><p className="text-white/10 text-[7px] uppercase">Target</p><p className="text-emerald-400/40 font-bold">{fmt(fi)}</p></div>
          <div className="w-px h-5 bg-white/5"/>
          <div><p className="text-white/10 text-[7px] uppercase">FI Age</p><p className="text-emerald-400/60 font-bold">{nw >= fi ? "NOW" : fiAge}</p></div>
        </div>

        {/* Full-width progress bar */}
        <div className="mt-3 h-2 bg-white/[0.04] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000" style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #34d399, #6ee7b7)",
            boxShadow: "0 0 12px rgba(52,211,153,0.4)"
          }} />
        </div>
      </div>

      {/* Standalone extras */}
      {standalone && (
        <div className="space-y-4 mt-5">
          {/* Journey chart */}
          <div className="rounded-xl p-4 bg-white/[0.025] border border-white/[0.05]">
            <p className="text-[9px] text-white/15 uppercase tracking-widest mb-1">Wealth Journey</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={journey}>
                <defs>
                  <linearGradient id="fiJourney" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)"/>
                <XAxis dataKey="age" tick={{ fontSize:9, fill:"rgba(255,255,255,0.2)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:9, fill:"rgba(255,255,255,0.2)" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1e6).toFixed(1)}M`}/>
                <Tooltip content={<Tip/>}/>
                <ReferenceLine y={fi} stroke="#fbbf24" strokeDasharray="6 4" strokeWidth={1.5}/>
                <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="#34d399" fill="url(#fiJourney)" strokeWidth={2.5} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Milestones */}
          <div className="rounded-xl p-4 bg-white/[0.025] border border-white/[0.05]">
            <p className="text-[9px] text-white/15 uppercase tracking-widest mb-3">Milestones</p>
            <div className="space-y-2">
              {milestones.map((ms, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ms.reached ? "bg-emerald-400" : "bg-white/10"}`} style={ms.reached ? { boxShadow:"0 0 6px #34d399" } : {}} />
                  <div className="flex-1 flex items-center justify-between">
                    <span className={`text-[10px] font-medium ${ms.reached ? "text-emerald-400/70 line-through" : "text-white/30"}`}>{fN(ms.target)}</span>
                    <span className="text-[9px] text-white/15">{ms.reached ? "Reached" : `Age ${ms.age} (${ms.years}yr)`}</span>
                  </div>
                  <div className="w-16 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500/40" style={{ width: `${Math.min(100, (nw / ms.target) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
