// src/modules/FICountdown.jsx
// IMPORTS: { useState, useEffect } from react
// PROPS: { profile } -- needs salary, savings, investments, retirement, loans
// USED BY: Dashboard (embedded), standalone page via router

import { useState, useEffect } from "react";
import { fmt } from "../lib/data";

export default function FICountdown({ profile: p }) {
  const sal = p.salary || 300000;
  const fi = (sal * 0.6) / 0.04; // 60% income replacement, 4% SWR
  const nw = (p.savings || 0) + (p.investments || 0) + (p.retirement || 0) - (p.loans || 0);
  const moSave = Math.round(sal * 0.2 / 12); // assume 20% savings rate
  const mr = 0.07 / 12;

  let months = 0, bal = nw;
  if (bal < fi) { while (bal < fi && months < 600) { bal = bal * (1 + mr) + moSave; months++; } }

  const totalDays = months * 30.44;
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  const [tick, setTick] = useState(totalDays);

  useEffect(() => {
    const iv = setInterval(() => setTick(prev => Math.max(0, prev - 0.0000116)), 1000);
    return () => clearInterval(iv);
  }, []);

  const d = Math.floor(tick);
  const h = Math.floor((tick % 1) * 24);
  const m = Math.floor(((tick % 1) * 24 % 1) * 60);

  return (
    <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/10 border border-emerald-500/15 rounded-2xl p-5 text-center">
      <p className="text-[9px] text-emerald-400/50 uppercase tracking-[0.2em] font-bold mb-2">
        Financial Independence In
      </p>
      <div className="flex items-center justify-center gap-3">
        {[[d, "days"], [h, "hrs"], [m, "min"]].map(([v, l], i) => (
          <div key={i} className="text-center">
            <p className="text-3xl lg:text-4xl font-black text-emerald-400 tabular-nums leading-none"
              style={{ fontFamily: "monospace" }}>
              {String(v).padStart(l === "days" ? 1 : 2, "0")}
            </p>
            <p className="text-[8px] text-emerald-400/30 uppercase mt-1">{l}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-[9px]">
        <span className="text-white/20">Target: {fmt(fi)}</span>
        <span className="text-white/20">|</span>
        <span className="text-white/20">Current: {fmt(nw)}</span>
        <span className="text-white/20">|</span>
        <span className="text-emerald-400/50">{nw >= fi ? "FI ACHIEVED!" : `${yrs}yr ${mos}mo`}</span>
      </div>
      <div className="mt-2 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
          style={{ width: `${Math.min(100, (nw / fi) * 100)}%` }} />
      </div>
    </div>
  );
}
