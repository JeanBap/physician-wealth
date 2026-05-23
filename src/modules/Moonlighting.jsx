import { useState } from "react";
import { SPECIALTIES, STATE_TAX, fmt, fN, marginalRate } from "../lib/data";
import { Section, Stat, Card, Alert, Inp } from "../components/ui";

const GIGS = [
  { id:"locums", name:"Locum Tenens", hrRate:175, hrsPerWk:12, desc:"Temporary hospital staffing", startup:500, taxDeduct:0.15 },
  { id:"telehealth", name:"Telehealth", hrRate:120, hrsPerWk:8, desc:"Virtual patient consultations", startup:200, taxDeduct:0.10 },
  { id:"expert", name:"Expert Witness", hrRate:500, hrsPerWk:4, desc:"Legal medical testimony", startup:0, taxDeduct:0.05 },
  { id:"surveys", name:"Medical Surveys", hrRate:200, hrsPerWk:3, desc:"Pharma surveys & advisory boards", startup:0, taxDeduct:0.05 },
  { id:"teaching", name:"Medical Education", hrRate:100, hrsPerWk:6, desc:"CME courses, precepting", startup:300, taxDeduct:0.10 },
  { id:"consult", name:"Startup Consulting", hrRate:250, hrsPerWk:5, desc:"Healthtech advisory roles", startup:0, taxDeduct:0.08 },
];

export default function Moonlighting({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [weeksPerYear, setWeeksPerYear] = useState(40);
  const mRate = marginalRate(profile.state || "NY");

  const gigsWithCalc = GIGS.map(g => {
    const gross = g.hrRate * g.hrsPerWk * weeksPerYear;
    const deductions = gross * g.taxDeduct;
    const taxable = gross - deductions;
    const tax = Math.round(taxable * mRate);
    const selfEmployment = Math.round(taxable * 0.153 * 0.9235);
    const net = gross - tax - selfEmployment + Math.round(deductions * mRate);
    const effectiveRate = gross > 0 ? ((gross - net) / gross * 100).toFixed(0) : "0";
    return { ...g, gross, deductions, tax, selfEmployment, net, effectiveRate, netPerHr: Math.round(net / (g.hrsPerWk * weeksPerYear)) };
  }).sort((a, b) => b.net - a.net);

  const bestGig = gigsWithCalc[0];

  return (
    <div className="space-y-5 animate-in">
      <Section title="Moonlighting ROI" sub="Side Income Analysis" />
      <Inp label="Working weeks per year" value={weeksPerYear} onChange={setWeeksPerYear} type="number" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Best net income" value={fmt(bestGig.net)} sub={bestGig.name} color="#34d399" />
        <Stat label="Highest $/hr" value={`$${Math.max(...gigsWithCalc.map(g=>g.netPerHr))}`} sub="After-tax hourly" color="#fbbf24" />
        <Stat label="Marginal tax rate" value={`${(mRate*100).toFixed(0)}%`} sub={profile.state || "NY"} color="#a78bfa" />
      </div>
      <Card>
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Side Gig Comparison (After-Tax)</h3>
        <div className="space-y-2">
          {gigsWithCalc.map((g, i) => (
            <div key={g.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-[11px] text-white/60 font-bold">{g.name}</p>
                  <p className="text-[8px] text-white/20">{g.desc} | {g.hrsPerWk}hr/wk @ ${g.hrRate}/hr</p>
                </div>
                <p className="text-sm font-black text-emerald-400 tabular-nums">{fmt(g.net)}</p>
              </div>
              <div className="flex gap-3 text-[8px] text-white/20">
                <span>Gross: {fN(g.gross)}</span>
                <span>Tax: {fN(g.tax + g.selfEmployment)}</span>
                <span>Effective: {g.effectiveRate}%</span>
                <span className="text-emerald-400/50">Net/hr: ${g.netPerHr}</span>
              </div>
              <div className="mt-1.5 h-1 bg-white/[0.03] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500/50 rounded-full" style={{ width: `${(g.net / bestGig.net) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Alert type="info">Self-employment adds 15.3% tax on top of marginal rate. Expert witness and consulting have highest net $/hr due to lower time commitment.</Alert>
    </div>
  );
}
