import { useState } from "react";
import { SPECIALTIES, fmt, fN } from "../lib/data";
import { Section, Stat, Inp, Alert, Card } from "../components/ui";

const CARRIERS = [
  { name: "Guardian", monthlyPer100k: 180, waitDays: 90, maxBenefit: 15000, ownOcc: true },
  { name: "MassMutual", monthlyPer100k: 195, waitDays: 90, maxBenefit: 20000, ownOcc: true },
  { name: "Northwestern", monthlyPer100k: 170, waitDays: 90, maxBenefit: 15000, ownOcc: true },
  { name: "Principal", monthlyPer100k: 160, waitDays: 90, maxBenefit: 12000, ownOcc: false },
  { name: "Standard", monthlyPer100k: 150, waitDays: 180, maxBenefit: 10000, ownOcc: false },
];

export default function DisabilitySim({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [salary, setSalary] = useState(profile.salary || spec.m);
  const [expenses, setExpenses] = useState(Math.round(salary * 0.6));
  const [savings, setSavings] = useState(profile.savings || 50000);
  const [coverage, setCoverage] = useState(0);

  const monthlyNeed = Math.round(expenses / 12);
  const monthlyGap = monthlyNeed - coverage;
  const runway = monthlyGap > 0 ? Math.round(savings / monthlyGap) : 999;
  const annualPremium = Math.round(salary / 100000 * 2100);

  return (
    <div className="space-y-5 animate-in">
      <Section title="Disability Simulator" sub="Income Protection" />
      <div className="grid grid-cols-2 gap-2">
        <Inp label="Annual salary" value={salary} onChange={setSalary} type="number" pre="$" />
        <Inp label="Annual expenses" value={expenses} onChange={setExpenses} type="number" pre="$" />
        <Inp label="Liquid savings" value={savings} onChange={setSavings} type="number" pre="$" />
        <Inp label="Current DI coverage/mo" value={coverage} onChange={setCoverage} type="number" pre="$" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Monthly gap" value={fmt(monthlyGap)} color={monthlyGap > 0 ? "#f87171" : "#34d399"} />
        <Stat label="Runway" value={`${runway} mo`} color={runway < 6 ? "#f87171" : runway < 12 ? "#fbbf24" : "#34d399"} />
        <Stat label="Est. premium" value={`${fN(annualPremium)}/yr`} color="#60a5fa" />
      </div>
      <Card>
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Carrier Comparison</h3>
        <div className="space-y-1">
          {CARRIERS.map((c, i) => {
            const mo = Math.round(salary / 100000 * c.monthlyPer100k);
            return (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                <div>
                  <p className="text-[11px] text-white/60 font-medium">{c.name}</p>
                  <p className="text-[8px] text-white/20">{c.waitDays}d wait | Max {fN(c.maxBenefit)}/mo | {c.ownOcc ? "Own-occ" : "Any-occ"}</p>
                </div>
                <p className="text-xs font-bold text-white/50 tabular-nums">{fN(mo)}/mo</p>
              </div>
            );
          })}
        </div>
      </Card>
      {monthlyGap > 0 && <Alert type="warn">Without DI, you have {runway} months before savings run out. {spec.burn > 40 ? `${profile.specialty} has ${spec.burn}% burnout rate, increasing disability risk.` : ""}</Alert>}
    </div>
  );
}
