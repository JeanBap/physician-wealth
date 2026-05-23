import { useState } from "react";
import { SPECIALTIES, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Donut, Alert } from "../components/ui";

export default function Retirement({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const sal = profile.salary || spec.m;
  const [age, setAge] = useState(profile.age || 35);
  const [retireAge, setRetireAge] = useState(60);
  const [current401k, setCurrent401k] = useState(profile.retirement || 100000);
  const [currentIRA, setCurrentIRA] = useState(0);
  const [currentTax, setCurrentTax] = useState(profile.investments || 80000);
  const [annualSave, setAnnualSave] = useState(Math.round(sal * 0.2));
  const [returnRate, setReturnRate] = useState(7);

  const yearsToRetire = Math.max(0, retireAge - age);
  const totalCurrent = current401k + currentIRA + currentTax;
  const fiTarget = sal * 0.6 / 0.04;

  // Project future value
  let fv = totalCurrent;
  for (let y = 0; y < yearsToRetire; y++) {
    fv = fv * (1 + returnRate / 100) + annualSave;
  }

  const gap = fiTarget - fv;
  const funded = Math.min(100, Math.round((fv / fiTarget) * 100));
  const monthlyIncome = Math.round(fv * 0.04 / 12);

  return (
    <div className="space-y-5 animate-in">
      <Section title="Retirement Planner" sub="FI Gap Analysis" />
      <div className="grid grid-cols-2 gap-2">
        <Inp label="Current age" value={age} onChange={setAge} type="number" />
        <Inp label="Target retirement" value={retireAge} onChange={setRetireAge} type="number" />
        <Inp label="401(k) balance" value={current401k} onChange={setCurrent401k} type="number" pre="$" />
        <Inp label="IRA balance" value={currentIRA} onChange={setCurrentIRA} type="number" pre="$" />
        <Inp label="Taxable investments" value={currentTax} onChange={setCurrentTax} type="number" pre="$" />
        <Inp label="Annual savings" value={annualSave} onChange={setAnnualSave} type="number" pre="$" />
      </div>
      <div className="flex justify-center py-3">
        <Donut value={funded} max={100} size={120} sw={8} color={funded >= 100 ? "#34d399" : funded > 60 ? "#fbbf24" : "#f87171"}>
          <p className="text-2xl font-black" style={{ color: funded >= 100 ? "#34d399" : funded > 60 ? "#fbbf24" : "#f87171" }}>{funded}%</p>
          <p className="text-[7px] text-white/20">FUNDED</p>
        </Donut>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Projected at retire" value={fmt(fv)} color="#34d399" />
        <Stat label="FI target" value={fmt(fiTarget)} color="#60a5fa" />
        <Stat label={gap > 0 ? "Gap" : "Surplus"} value={fmt(Math.abs(gap))} color={gap > 0 ? "#f87171" : "#34d399"} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Monthly retirement income" value={fN(monthlyIncome)} sub="4% withdrawal rate" color="#a78bfa" />
        <Stat label="Years to retire" value={yearsToRetire} sub={`At age ${retireAge}`} color="#fbbf24" />
      </div>
      <Card>
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Contribution Limits (2025)</h3>
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between"><span className="text-white/30">401(k) elective</span><span className="text-white/60">$23,500</span></div>
          <div className="flex justify-between"><span className="text-white/30">401(k) total (incl employer)</span><span className="text-white/60">$70,000</span></div>
          <div className="flex justify-between"><span className="text-white/30">Backdoor Roth IRA</span><span className="text-white/60">$7,000</span></div>
          <div className="flex justify-between"><span className="text-white/30">HSA (family)</span><span className="text-white/60">$8,300</span></div>
          {age >= 50 && <div className="flex justify-between"><span className="text-white/30">Catch-up (50+)</span><span className="text-emerald-400">+$7,500</span></div>}
        </div>
      </Card>
      {gap > 0 && <Alert type="warn">Gap of {fmt(gap)}. Increase annual savings by {fN(Math.round(gap / yearsToRetire))} or delay retirement by {Math.ceil(gap / (annualSave + totalCurrent * returnRate / 100))} years.</Alert>}
      {gap <= 0 && <Alert type="success">On track! Projected surplus of {fmt(Math.abs(gap))} at retirement.</Alert>}
    </div>
  );
}
