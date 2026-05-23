import { useState } from "react";
import { SPECIALTIES, STATE_TAX, fedTax, fica, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Alert } from "../components/ui";

const RULES = [
  { name: "Housing (28% rule)", pct: 0.28, desc: "Total housing cost should not exceed 28% of gross income" },
  { name: "Total debt (36% rule)", pct: 0.36, desc: "All debt payments should not exceed 36% of gross income" },
  { name: "Savings (20% rule)", pct: 0.20, desc: "Save at least 20% of gross income for retirement/FI" },
];

export default function Spending({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const sal = profile.salary || spec.m;
  const state = profile.state || "NY";

  const fed = fedTax(sal, profile.married);
  const st = Math.round(sal * (STATE_TAX[state] || 0));
  const fc = Math.round(fica(sal));
  const totalTax = fed + st + fc;
  const takeHome = sal - totalTax;
  const monthly = Math.round(takeHome / 12);

  const [housing, setHousing] = useState(Math.round(sal * 0.25 / 12));
  const [loans, setLoans] = useState(profile.loans > 0 ? Math.round(profile.loans * 0.068 / 12 + profile.loans / 120) : 0);
  const [other, setOther] = useState(Math.round(monthly * 0.3));
  const totalSpend = housing + loans + other;
  const surplus = monthly - totalSpend;

  return (
    <div className="space-y-5 animate-in">
      <Section title="Spending Analysis" sub="Take-Home Calculator" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Gross" value={fmt(sal)} color="#60a5fa" />
        <Stat label="Total tax" value={fmt(totalTax)} sub={`${((totalTax/sal)*100).toFixed(0)}%`} color="#f87171" />
        <Stat label="Monthly take-home" value={fN(monthly)} color="#34d399" />
      </div>
      <Card>
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Monthly Budget</h3>
        <div className="space-y-2">
          <Inp label="Housing (mortgage/rent)" value={housing} onChange={setHousing} type="number" pre="$" />
          <Inp label="Loan payments" value={loans} onChange={setLoans} type="number" pre="$" />
          <Inp label="Other expenses" value={other} onChange={setOther} type="number" pre="$" />
        </div>
        <div className="mt-3 flex justify-between border-t border-white/[0.05] pt-2">
          <span className="text-[10px] text-white/30">Monthly surplus</span>
          <span className={`text-sm font-bold tabular-nums ${surplus >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {fN(surplus)}/mo
          </span>
        </div>
      </Card>
      <Card>
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Financial Rules Check</h3>
        <div className="space-y-2">
          {RULES.map((r, i) => {
            const limit = Math.round(sal * r.pct / 12);
            const actual = i === 0 ? housing : i === 1 ? housing + loans : surplus;
            const pass = i === 2 ? actual >= limit : actual <= limit;
            return (
              <div key={i} className="flex items-center justify-between py-1 border-b border-white/[0.03] last:border-0">
                <div>
                  <p className="text-[10px] text-white/50">{r.name}</p>
                  <p className="text-[8px] text-white/20">{r.desc}</p>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${pass ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {pass ? "PASS" : "FAIL"}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
      {surplus < 0 && <Alert type="danger">Spending exceeds take-home by {fN(Math.abs(surplus))}/mo. Review housing costs or loan repayment strategy.</Alert>}
    </div>
  );
}
