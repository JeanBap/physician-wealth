import { useState } from "react";
import { SPECIALTIES, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Alert } from "../components/ui";

export default function SalaryBench({ profile }) {
  const [salary, setSalary] = useState(profile.salary || 0);
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const displaySal = salary || spec.m;

  const pctile = displaySal <= spec.lo ? 25 : displaySal >= spec.hi ? 75 :
    25 + ((displaySal - spec.lo) / (spec.hi - spec.lo)) * 50;

  const sorted = Object.entries(SPECIALTIES).sort((a, b) => b[1].m - a[1].m);
  const rank = sorted.findIndex(([k]) => k === profile.specialty) + 1;
  const gap = spec.hi - displaySal;

  return (
    <div className="space-y-5 animate-in">
      <Section title="Salary Benchmarking" sub="Compensation Analysis" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Your salary" value={fmt(displaySal)} color="#34d399" />
        <Stat label="Percentile" value={`${pctile.toFixed(0)}th`} color={pctile > 50 ? "#34d399" : "#fbbf24"} />
        <Stat label="Gap to 75th" value={gap > 0 ? fmt(gap) : "Above"} color={gap > 0 ? "#f87171" : "#34d399"} />
      </div>
      <Card>
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">{profile.specialty} Range</h3>
        <div className="relative h-6 bg-white/[0.04] rounded-full overflow-hidden">
          <div className="absolute h-full bg-emerald-500/20 rounded-full" style={{ left: "0%", width: "100%" }} />
          <div className="absolute top-0 h-full w-1 bg-emerald-400 rounded-full"
            style={{ left: `${Math.min(100, pctile)}%` }} />
        </div>
        <div className="flex justify-between mt-1 text-[8px] text-white/20">
          <span>{fN(spec.lo)} (25th)</span>
          <span>{fN(spec.m)} (median)</span>
          <span>{fN(spec.hi)} (75th)</span>
        </div>
      </Card>
      <Inp label="Enter your salary to compare" value={salary} onChange={setSalary} type="number" pre="$" />
      <Card>
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">All Specialties (Ranked #{rank}/20)</h3>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {sorted.map(([k, s], i) => {
            const isYou = k === profile.specialty;
            return (
              <div key={k} className={`flex items-center justify-between py-1 border-b border-white/[0.02] last:border-0 ${isYou ? "bg-emerald-500/[0.05] rounded-lg px-2 -mx-2" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-white/15 w-4 text-right">{i+1}</span>
                  <span className={`text-[10px] ${isYou ? "text-emerald-400 font-bold" : "text-white/40"}`}>{k}</span>
                </div>
                <span className="text-[10px] text-white/30 tabular-nums">{fN(s.m)}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
