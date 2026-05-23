import { useState } from "react";
import { SPECIALTIES, fN } from "../lib/data";
import { Section, Stat, Card, Alert, Inp } from "../components/ui";

const CLAUSES = [
  { name: "Non-compete radius", good: "< 10 miles", bad: "> 25 miles", weight: 3 },
  { name: "Non-compete duration", good: "< 1 year", bad: "> 2 years", weight: 3 },
  { name: "Tail coverage", good: "Employer-paid", bad: "Physician-paid", weight: 2 },
  { name: "Termination notice", good: "> 90 days", bad: "< 30 days", weight: 2 },
  { name: "Without cause termination", good: "Mutual right", bad: "Employer only", weight: 3 },
  { name: "Partnership track", good: "Defined timeline", bad: "Vague/none", weight: 1 },
  { name: "Benefits start date", good: "Day 1", bad: "After 90 days", weight: 1 },
  { name: "CME allowance", good: "> $3,000/yr", bad: "< $1,000/yr", weight: 1 },
];

export default function Contracts({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [scores, setScores] = useState(CLAUSES.map(() => 5));

  const toggleScore = (i) => {
    setScores(prev => prev.map((s, j) => j === i ? (s === 5 ? 0 : s === 0 ? 10 : 0) : s));
  };

  const totalWeight = CLAUSES.reduce((s, c) => s + c.weight, 0);
  const weighted = CLAUSES.reduce((s, c, i) => s + (scores[i] / 10) * c.weight, 0);
  const overallScore = Math.round((weighted / totalWeight) * 100);
  const redFlags = CLAUSES.filter((_, i) => scores[i] === 0 && CLAUSES[i].weight >= 2).length;

  return (
    <div className="space-y-5 animate-in">
      <Section title="Contract Analyzer" sub="Employment Agreement Review" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Contract score" value={`${overallScore}/100`} color={overallScore > 70 ? "#34d399" : overallScore > 40 ? "#fbbf24" : "#f87171"} />
        <Stat label="Red flags" value={redFlags} color={redFlags > 0 ? "#f87171" : "#34d399"} />
        <Stat label="Specialty median" value={fN(spec.m)} color="#60a5fa" />
      </div>
      <Card>
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Key Clauses (tap to rate)</h3>
        <div className="space-y-1">
          {CLAUSES.map((c, i) => (
            <button key={i} onClick={() => toggleScore(i)}
              className="w-full flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0 text-left">
              <div className="flex-1">
                <p className="text-[11px] text-white/60 font-medium">{c.name}</p>
                <p className="text-[8px] text-white/20">
                  Good: {c.good} | Bad: {c.bad}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {"★".repeat(c.weight).split("").map((_, j) => (
                  <span key={j} className="text-[6px] text-white/10">★</span>
                ))}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                  scores[i] === 10 ? "bg-emerald-500/15 text-emerald-400" :
                  scores[i] === 0 ? "bg-red-500/15 text-red-400" :
                  "bg-white/[0.05] text-white/25"
                }`}>
                  {scores[i] === 10 ? "Good" : scores[i] === 0 ? "Bad" : "N/A"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </Card>
      {redFlags > 0 && <Alert type="warn">{redFlags} critical clause(s) flagged. Non-compete and termination clauses have the highest financial impact. Consider attorney review before signing.</Alert>}
      {overallScore > 80 && <Alert type="success">Strong contract. Ensure verbal promises are documented in writing before signing.</Alert>}
    </div>
  );
}
