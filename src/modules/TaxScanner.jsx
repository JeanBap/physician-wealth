import { useState } from "react";
import { SPECIALTIES, STATE_TAX, fedTax, fica, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Alert } from "../components/ui";

const STRATEGIES = [
  { id:"s199a", name:"S-Corp + Reasonable Salary", desc:"Route income through S-Corp to save on self-employment tax. Pay yourself 60% as W-2, distribute 40%.", savingsRate:0.06, applies:s=>s>200000, risk:"Medium", complexity:"High" },
  { id:"hsa", name:"HSA Triple Tax Advantage", desc:"Max HSA contribution ($4,150 single / $8,300 family). Tax-deductible, grows tax-free, withdraw tax-free for medical.", savingsRate:0.01, applies:()=>true, risk:"None", complexity:"Low" },
  { id:"backdoor", name:"Backdoor Roth IRA", desc:"Contribute to traditional IRA then convert to Roth. Bypass income limits. $7,000/yr ($14,000 couple).", savingsRate:0.008, applies:s=>s>161000, risk:"Low", complexity:"Medium" },
  { id:"megaback", name:"Mega Backdoor Roth", desc:"After-tax 401(k) contributions converted to Roth. Up to $69,000 total 401(k) limit. Check if employer allows.", savingsRate:0.04, applies:s=>s>250000, risk:"Low", complexity:"High" },
  { id:"qbi", name:"QBI Deduction (1099)", desc:"20% qualified business income deduction for independent contractors. Phase-out above $383,900.", savingsRate:0.05, applies:s=>s<400000, risk:"Low", complexity:"Medium" },
];

export default function TaxScanner({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const sal = profile.salary || spec.m;
  const state = profile.state || "NY";
  const stateRate = STATE_TAX[state] || 0;

  const totalFed = fedTax(sal, profile.married);
  const totalState = Math.round(sal * stateRate);
  const totalFica = Math.round(fica(sal));
  const totalTax = totalFed + totalState + totalFica;
  const effectiveRate = ((totalTax / sal) * 100).toFixed(1);

  const applicable = STRATEGIES.filter(s => s.applies(sal));
  const totalSavings = applicable.reduce((sum, s) => sum + Math.round(sal * s.savingsRate), 0);

  return (
    <div className="space-y-5 animate-in">
      <Section title="Tax Optimization Scanner" sub="Physician Tax Strategy" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Total tax burden" value={fmt(totalTax)} sub={`${effectiveRate}% effective rate`} color="#f87171" />
        <Stat label="Potential savings" value={fmt(totalSavings)} sub={`${applicable.length} strategies`} color="#34d399" />
      </div>
      <Card>
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Tax Breakdown</h3>
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between"><span className="text-white/30">Federal income tax</span><span className="text-white/60">{fN(totalFed)}</span></div>
          <div className="flex justify-between"><span className="text-white/30">State tax ({state})</span><span className="text-white/60">{fN(totalState)}</span></div>
          <div className="flex justify-between"><span className="text-white/30">FICA + Medicare</span><span className="text-white/60">{fN(totalFica)}</span></div>
          <div className="flex justify-between border-t border-white/[0.05] pt-1 mt-1">
            <span className="text-white/50 font-bold">Take-home</span>
            <span className="text-emerald-400 font-bold">{fN(sal - totalTax)}</span>
          </div>
        </div>
      </Card>
      <div className="space-y-2">
        {applicable.map((s, i) => {
          const saving = Math.round(sal * s.savingsRate);
          return (
            <Card key={s.id}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] text-white/60 font-bold">{s.name}</p>
                <span className="text-sm font-black text-emerald-400 tabular-nums">{fmt(saving)}/yr</span>
              </div>
              <p className="text-[9px] text-white/25 mb-2">{s.desc}</p>
              <div className="flex gap-3 text-[8px]">
                <span className={`px-1.5 py-0.5 rounded-full ${s.risk==="None"?"bg-emerald-500/10 text-emerald-400":s.risk==="Low"?"bg-blue-500/10 text-blue-400":s.risk==="Medium"?"bg-amber-500/10 text-amber-400":"bg-red-500/10 text-red-400"}`}>
                  {s.risk} risk
                </span>
                <span className="text-white/20">{s.complexity} complexity</span>
              </div>
            </Card>
          );
        })}
      </div>
      <Alert type="success">Implementing all {applicable.length} strategies could save {fmt(totalSavings)}/yr. Consult a physician-specialized CPA before implementation.</Alert>
    </div>
  );
}
