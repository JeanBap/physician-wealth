import { useState, useMemo } from "react";
import { SPECIALTIES, STATE_TAX, fedTax, fica, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Alert, Takeaway } from "../components/ui";

export default function W4Optimizer({ profile }) {
  const sal = profile.salary || 300000;
  const state = profile.state || "NY";
  const [currentWithholding, setCurrentWithholding] = useState(0); // extra per paycheck
  const [payFrequency, setPayFrequency] = useState(24); // semi-monthly
  const [otherIncome, setOtherIncome] = useState(profile.moonlightIncome || 0);
  const [deductions, setDeductions] = useState(30000); // itemized
  const [dependents, setDependents] = useState(profile.kids || 0);

  const totalIncome = sal + otherIncome;
  const taxableIncome = Math.max(0, totalIncome - deductions);
  const actualTax = fedTax(taxableIncome, profile.married);
  const ficaTax = Math.round(fica(sal));
  const stateTax = Math.round(totalIncome * (STATE_TAX[state] || 0));
  const totalOwed = actualTax + ficaTax + stateTax;

  // Standard withholding (rough estimate based on W-4 defaults)
  const baseWithholding = Math.round(fedTax(sal, profile.married) + ficaTax);
  const extraPerPaycheck = currentWithholding;
  const totalWithheld = baseWithholding + extraPerPaycheck * payFrequency;
  const refundOrOwe = totalWithheld - totalOwed;
  const isRefund = refundOrOwe > 0;

  // Optimal extra withholding to hit ~$0
  const optimalExtra = Math.max(0, Math.round((totalOwed - baseWithholding) / payFrequency));
  const safeHarborExtra = Math.max(0, Math.round((totalOwed * 1.1 - baseWithholding) / payFrequency)); // 110% safe harbor

  return (
    <div className="space-y-5 animate-in">
      <Section title="W-4 Optimizer" sub="Stop Over/Under-Withholding" />

      <div className="grid grid-cols-2 gap-3">
        <Inp label="Annual salary" value={sal} onChange={() => {}} type="number" pre="$" />
        <Inp label="Other income (1099, moonlight)" value={otherIncome} onChange={v => setOtherIncome(+v)} type="number" pre="$" />
        <Inp label="Itemized deductions" value={deductions} onChange={v => setDeductions(+v)} type="number" pre="$" />
        <Inp label="Dependents" value={dependents} onChange={v => setDependents(+v)} type="number" />
        <Inp label="Pay frequency" value={payFrequency} onChange={v => setPayFrequency(+v)}
          options={[{v:12,l:"Monthly (12)"},{v:24,l:"Semi-Monthly (24)"},{v:26,l:"Bi-Weekly (26)"}]} />
        <Inp label="Extra withholding/paycheck" value={currentWithholding} onChange={v => setCurrentWithholding(+v)} type="number" pre="$" />
      </div>

      <div className={`p-5 rounded-xl text-center ${isRefund ? "bg-amber-500/[0.06] border border-amber-500/15" : "bg-red-500/[0.06] border border-red-500/15"}`}>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">{isRefund ? "Projected Refund (Free Loan to IRS)" : "Projected Amount Owed"}</p>
        <p className="text-3xl font-black" style={{ color: isRefund ? "#fbbf24" : "#f87171" }}>{fmt(Math.abs(refundOrOwe))}</p>
        <p className="text-sm text-white/50 mt-1">{isRefund ? `You're over-withholding ${fN(Math.round(refundOrOwe/12))}/mo. That's money sitting at 0% return.` : `Underpayment penalty risk. Increase withholding by ${fN(optimalExtra)}/paycheck.`}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Total tax owed" value={fmt(totalOwed)} color="#f87171" />
        <Stat label="Currently withheld" value={fmt(totalWithheld)} color="#60a5fa" />
        <Stat label="Optimal extra" value={`$${optimalExtra}/pay`} sub="to hit ~$0" color="#34d399" />
      </div>

      <Card>
        <p className="text-sm text-white/55 font-bold mb-3">W-4 Recommendation</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-white/[0.04]"><span className="text-white/50">Filing status</span><span className="text-white/65">{profile.married ? "Married Filing Jointly" : "Single"}</span></div>
          <div className="flex justify-between py-2 border-b border-white/[0.04]"><span className="text-white/50">Step 3: Dependents</span><span className="text-white/65">{dependents > 0 ? `$${(dependents * 2000).toLocaleString()}` : "$0"}</span></div>
          <div className="flex justify-between py-2 border-b border-white/[0.04]"><span className="text-white/50">Step 4a: Other income</span><span className="text-white/65">{fN(otherIncome)}</span></div>
          <div className="flex justify-between py-2 border-b border-white/[0.04]"><span className="text-white/50">Step 4b: Deductions</span><span className="text-white/65">{fN(Math.max(0, deductions - (profile.married ? 29200 : 14600)))}</span></div>
          <div className="flex justify-between py-2 border-t border-white/[0.05] mt-2 pt-3">
            <span className="text-white/65 font-bold">Step 4c: Extra withholding</span>
            <span className="text-emerald-400 font-bold text-lg">${optimalExtra}/paycheck</span>
          </div>
          <p className="text-xs text-white/40 mt-1">Safe harbor (110%): ${safeHarborExtra}/paycheck to guarantee no penalty.</p>
        </div>
      </Card>

      <Takeaway items={[
        isRefund ? `You're over-withholding by ${fmt(refundOrOwe)}/yr. That's a 0% loan to the IRS. Reduce withholding and invest the difference.` : `Under-withholding by ${fmt(Math.abs(refundOrOwe))}. Risk of underpayment penalty. Increase to $${optimalExtra}/paycheck.`,
        `Set W-4 Step 4c to $${optimalExtra}/paycheck for a near-zero refund/balance. Safe harbor: $${safeHarborExtra}.`,
        otherIncome > 0 ? `1099 income of ${fN(otherIncome)} requires quarterly estimated payments or increased W-4 withholding.` : `No side income reported. W-4 adjustment should suffice.`,
      ]} />
    </div>
  );
}
