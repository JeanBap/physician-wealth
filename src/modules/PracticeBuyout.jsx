import { useState } from "react";
import { SPECIALTIES, fmt, fN, pmtCalc } from "../lib/data";
import { Section, Stat, Card, Inp, Alert } from "../components/ui";

export default function PracticeBuyout({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [revenue, setRevenue] = useState(1200000);
  const [multiple, setMultiple] = useState(0.8);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(7);
  const [term, setTerm] = useState(10);
  const [ownerSalary, setOwnerSalary] = useState(spec.m);

  const price = Math.round(revenue * multiple);
  const down = Math.round(price * downPct / 100);
  const loan = price - down;
  const monthlyPmt = Math.round(pmtCalc(loan, rate, term * 12));
  const annualDebt = monthlyPmt * 12;
  const netAfterDebt = Math.round(revenue * 0.35 - annualDebt); // ~35% profit margin
  const roi = down > 0 ? ((netAfterDebt / down) * 100).toFixed(0) : "N/A";
  const payback = netAfterDebt > 0 ? (price / netAfterDebt).toFixed(1) : "N/A";
  const totalInterest = Math.round(monthlyPmt * term * 12 - loan);
  const equity = Math.round(price * 0.05 * term); // assume 5% annual appreciation

  return (
    <div className="space-y-5 animate-in">
      <Section title="Practice Buyout" sub="Acquisition Calculator" />
      <div className="grid grid-cols-2 gap-2">
        <Inp label="Annual revenue" value={revenue} onChange={setRevenue} type="number" pre="$" />
        <Inp label="Revenue multiple" value={multiple} onChange={setMultiple} type="number" />
        <Inp label="Down payment %" value={downPct} onChange={setDownPct} type="number" />
        <Inp label="Loan rate %" value={rate} onChange={setRate} type="number" />
        <Inp label="Term (years)" value={term} onChange={setTerm} type="number" />
        <Inp label="Owner salary" value={ownerSalary} onChange={setOwnerSalary} type="number" pre="$" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Purchase price" value={fmt(price)} color="#60a5fa" />
        <Stat label="Down payment" value={fmt(down)} color="#fbbf24" />
        <Stat label="Monthly payment" value={fN(monthlyPmt)} color="#f87171" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Annual ROI" value={`${roi}%`} color={+roi > 20 ? "#34d399" : "#fbbf24"} />
        <Stat label="Payback period" value={`${payback} yr`} color="#a78bfa" />
        <Stat label="Net after debt" value={fmt(netAfterDebt)} sub="/year" color={netAfterDebt > 0 ? "#34d399" : "#f87171"} />
      </div>
      <Card>
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">10-Year Projection</h3>
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between"><span className="text-white/30">Total loan interest</span><span className="text-red-400">{fN(totalInterest)}</span></div>
          <div className="flex justify-between"><span className="text-white/30">Estimated equity buildup</span><span className="text-emerald-400">{fmt(equity)}</span></div>
          <div className="flex justify-between"><span className="text-white/30">Cumulative net income</span><span className="text-emerald-400">{fmt(netAfterDebt * term)}</span></div>
          <div className="flex justify-between border-t border-white/[0.05] pt-1 mt-1">
            <span className="text-white/50 font-bold">Total value created</span>
            <span className="text-emerald-400 font-bold">{fmt(netAfterDebt * term + equity - totalInterest)}</span>
          </div>
        </div>
      </Card>
      <Alert type="info">Typical medical practice multiples: 0.5-1.2x revenue. Higher multiples for specialties with recurring revenue (derm, pain management, ophthalmology).</Alert>
    </div>
  );
}
