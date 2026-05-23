import { useState } from "react";
import { SPECIALTIES, fedTax, fica, STATE_TAX, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Alert } from "../components/ui";

export default function DualPhysician({ profile }) {
  const specA = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [salA, setSalA] = useState(profile.salary || specA.m);
  const [specBKey, setSpecBKey] = useState(profile.spouseSpecialty || "Internal Medicine");
  const specB = SPECIALTIES[specBKey] || SPECIALTIES["Internal Medicine"];
  const [salB, setSalB] = useState(profile.spouseSalary || specB.m);
  const [loansA, setLoansA] = useState(profile.loans || 250000);
  const [loansB, setLoansB] = useState(profile.spouseLoans || 200000);
  const state = profile.state || "NY";
  const stateRate = STATE_TAX[state] || 0;

  const combined = salA + salB;
  const combinedLoans = loansA + loansB;
  const marriedTax = fedTax(combined, true) + combined * stateRate + fica(salA) + fica(salB);
  const singleTax = fedTax(salA, false) + salA * stateRate + fica(salA) + fedTax(salB, false) + salB * stateRate + fica(salB);
  const penalty = marriedTax - singleTax;

  const max401k = 23500 * 2;
  const maxRoth = combined > 240000 ? 0 : 7000 * 2;
  const maxHSA = 8300;
  const maxDefer = max401k + maxRoth + maxHSA;

  const pslfA = loansA > 0 ? Math.round((salA * 0.1 - 22790) / 12 * 120) : 0;
  const pslfB = loansB > 0 ? Math.round((salB * 0.1 - 22790) / 12 * 120) : 0;
  const pslfSavingsA = loansA - pslfA;
  const pslfSavingsB = loansB - pslfB;

  return (
    <div className="space-y-5 animate-in">
      <Section title="Dual-Physician Household" sub="Combined Optimization" />
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <p className="text-[9px] text-emerald-400/50 uppercase font-bold">Physician A (You)</p>
          <Inp label="Salary" value={salA} onChange={setSalA} type="number" pre="$" />
          <Inp label="Loans" value={loansA} onChange={setLoansA} type="number" pre="$" />
          <p className="text-[8px] text-white/20">{profile.specialty}</p>
        </div>
        <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <p className="text-[9px] text-blue-400/50 uppercase font-bold">Physician B (Spouse)</p>
          <Inp label="Salary" value={salB} onChange={setSalB} type="number" pre="$" />
          <Inp label="Loans" value={loansB} onChange={setLoansB} type="number" pre="$" />
          <Inp label="Specialty" value={specBKey} onChange={setSpecBKey}
            options={Object.keys(SPECIALTIES).map(s => ({ v: s, l: s }))} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Combined income" value={fmt(combined)} color="#34d399" />
        <Stat label="Marriage penalty" value={fmt(Math.abs(penalty))} sub={penalty > 0 ? "Pay more married" : "Save filing jointly"} color={penalty > 0 ? "#f87171" : "#34d399"} />
        <Stat label="Combined loans" value={fmt(combinedLoans)} color="#fbbf24" />
      </div>
      <Card>
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Coordinated Tax Sheltering</h3>
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between"><span className="text-white/30">Dual 401(k) max</span><span className="text-emerald-400">{fN(max401k)}/yr</span></div>
          <div className="flex justify-between"><span className="text-white/30">Backdoor Roth (both)</span><span className="text-emerald-400">{maxRoth > 0 ? fN(maxRoth) : "Income too high"}</span></div>
          <div className="flex justify-between"><span className="text-white/30">HSA (family)</span><span className="text-emerald-400">{fN(maxHSA)}/yr</span></div>
          <div className="flex justify-between border-t border-white/[0.05] pt-1 mt-1">
            <span className="text-white/50 font-bold">Total annual deferral</span>
            <span className="text-emerald-400 font-bold">{fN(maxDefer)}</span>
          </div>
        </div>
      </Card>
      {(loansA > 0 || loansB > 0) && (
        <Card>
          <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">PSLF Strategy (File Separately)</h3>
          <div className="space-y-1 text-[10px]">
            {loansA > 0 && <div className="flex justify-between"><span className="text-white/30">Physician A PSLF payment</span><span className="text-emerald-400">{fN(pslfA)} over 10yr | Forgiven: {fmt(pslfSavingsA)}</span></div>}
            {loansB > 0 && <div className="flex justify-between"><span className="text-white/30">Physician B PSLF payment</span><span className="text-emerald-400">{fN(pslfB)} over 10yr | Forgiven: {fmt(pslfSavingsB)}</span></div>}
          </div>
          <p className="text-[8px] text-white/15 mt-2">Filing separately lowers PSLF payments but increases tax. Run both scenarios.</p>
        </Card>
      )}
      {penalty > 5000 && <Alert type="warn">Marriage penalty of {fN(penalty)}: consider filing MFS if pursuing PSLF. Check state rules -- some states require same filing status.</Alert>}
    </div>
  );
}
