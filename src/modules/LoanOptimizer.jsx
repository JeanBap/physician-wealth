import { useState } from "react";
import { SPECIALTIES, fmt, fN, pmtCalc } from "../lib/data";
import { Section, Stat, Card, Inp, Alert } from "../components/ui";

const STRATEGIES = [
  { id:"pslf", name:"PSLF (10yr Forgiveness)", desc:"Public Service Loan Forgiveness. 120 qualifying payments at non-profit/government employer.", rate:0, years:10, forgives:true },
  { id:"aggressive", name:"Aggressive Payoff", desc:"Maximum payments. Debt-free fastest. Best if private practice/high income.", rate:0, years:5, forgives:false },
  { id:"refi", name:"Refinance (Private)", desc:"Lower rate through private lender. Loses federal protections. Best for high earners.", rate:4.5, years:10, forgives:false },
  { id:"standard", name:"Standard Repayment", desc:"Federal 10-year standard plan. Fixed payments, no forgiveness.", rate:6.8, years:10, forgives:false },
];

export default function LoanOptimizer({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [balance, setBalance] = useState(profile.loans || 250000);
  const [currentRate, setCurrentRate] = useState(6.8);
  const [salary, setSalary] = useState(profile.salary || spec.m);
  const [employer, setEmployer] = useState("private"); // private | nonprofit | government

  const results = STRATEGIES.map(s => {
    const r = s.id === "refi" ? s.rate : s.id === "pslf" ? currentRate : currentRate;
    let monthlyPmt, totalPaid, savings;

    if (s.id === "pslf" && employer !== "private") {
      monthlyPmt = Math.round(Math.max(0, (salary * 0.1 - 22790)) / 12);
      totalPaid = monthlyPmt * 120;
      savings = balance - totalPaid;
    } else if (s.id === "pslf") {
      return { ...s, monthlyPmt: 0, totalPaid: 0, totalInterest: 0, savings: 0, eligible: false };
    } else if (s.id === "aggressive") {
      const aggressivePmt = Math.round(salary * 0.25 / 12);
      let bal = balance, months = 0, paid = 0;
      while (bal > 0 && months < 600) {
        const interest = bal * currentRate / 1200;
        bal = bal + interest - aggressivePmt;
        paid += aggressivePmt;
        months++;
      }
      monthlyPmt = aggressivePmt;
      totalPaid = paid;
      savings = (pmtCalc(balance, currentRate, 120) * 120) - totalPaid;
      return { ...s, monthlyPmt, totalPaid, totalInterest: totalPaid - balance, savings, years: (months/12).toFixed(1), eligible: true };
    } else {
      monthlyPmt = Math.round(pmtCalc(balance, r, s.years * 12));
      totalPaid = monthlyPmt * s.years * 12;
      savings = (pmtCalc(balance, currentRate, 120) * 120) - totalPaid;
    }

    return { ...s, monthlyPmt, totalPaid, totalInterest: totalPaid - balance, savings, eligible: true };
  });

  const best = results.filter(r => r.eligible).sort((a, b) => a.totalPaid - b.totalPaid)[0];

  return (
    <div className="space-y-5 animate-in">
      <Section title="Loan Optimizer" sub="Student Debt Strategy" />
      <div className="grid grid-cols-2 gap-2">
        <Inp label="Loan balance" value={balance} onChange={setBalance} type="number" pre="$" />
        <Inp label="Current rate %" value={currentRate} onChange={setCurrentRate} type="number" />
        <Inp label="Annual salary" value={salary} onChange={setSalary} type="number" pre="$" />
        <Inp label="Employer type" value={employer} onChange={setEmployer}
          options={[{v:"private",l:"Private Practice"},{v:"nonprofit",l:"Non-Profit Hospital"},{v:"government",l:"Government/VA"}]} />
      </div>
      <div className="space-y-2">
        {results.filter(r => r.eligible).map((r, i) => {
          const isBest = r.id === best?.id;
          return (
            <Card key={r.id} className={isBest ? "border-emerald-500/20 bg-emerald-500/[0.03]" : ""}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-[11px] text-white/60 font-bold">{r.name} {isBest && <span className="text-emerald-400 text-[8px]">BEST</span>}</p>
                  <p className="text-[8px] text-white/20">{r.desc}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div><p className="text-[8px] text-white/20">Monthly</p><p className="text-xs font-bold text-white/50 tabular-nums">{fN(r.monthlyPmt)}</p></div>
                <div><p className="text-[8px] text-white/20">Total paid</p><p className="text-xs font-bold text-white/50 tabular-nums">{fmt(r.totalPaid)}</p></div>
                <div><p className="text-[8px] text-white/20">{r.forgives ? "Forgiven" : "vs Standard"}</p>
                  <p className={`text-xs font-bold tabular-nums ${r.savings > 0 ? "text-emerald-400" : "text-red-400"}`}>{r.savings > 0 ? "+" : ""}{fmt(r.savings)}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {employer !== "private" && <Alert type="success">PSLF eligible! Stay at qualifying employer, enroll in income-driven plan, certify employment annually.</Alert>}
    </div>
  );
}
