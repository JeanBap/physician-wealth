import { useState } from "react";
import { SPECIALTIES, fN } from "../lib/data";
import { Section, Stat, Card, Alert, Inp } from "../components/ui";

const CARRIERS = [
  { name: "PIAA (Physician's)", premium: 1.0, coverage: "1M/3M", rating: "A+", settlement: 0.85 },
  { name: "MedPro (Berkshire)", premium: 0.95, coverage: "1M/3M", rating: "A++", settlement: 0.90 },
  { name: "Doctors Company", premium: 1.05, coverage: "1M/3M", rating: "A", settlement: 0.80 },
  { name: "ProAssurance", premium: 0.92, coverage: "1M/3M", rating: "A+", settlement: 0.82 },
  { name: "Coverys", premium: 0.88, coverage: "1M/3M", rating: "A-", settlement: 0.78 },
];

export default function MalpracticeRisk({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [yrsExperience, setYrsExperience] = useState(5);
  const [priorClaims, setPriorClaims] = useState(0);
  const [procedureVol, setProcedureVol] = useState("medium");

  const baseRisk = spec.claimRate * 100;
  const expMod = yrsExperience < 3 ? 1.3 : yrsExperience < 10 ? 1.0 : 0.85;
  const claimMod = 1 + priorClaims * 0.25;
  const volMod = procedureVol === "high" ? 1.2 : procedureVol === "low" ? 0.8 : 1.0;
  const riskScore = Math.min(100, Math.round(baseRisk * expMod * claimMod * volMod * 5));
  const annualProb = (spec.claimRate * expMod * claimMod * volMod * 100).toFixed(1);

  return (
    <div className="space-y-5 animate-in">
      <Section title="Malpractice Risk" sub="Risk Assessment" />
      <div className="grid grid-cols-2 gap-2">
        <Inp label="Years experience" value={yrsExperience} onChange={setYrsExperience} type="number" />
        <Inp label="Prior claims" value={priorClaims} onChange={setPriorClaims} type="number" />
        <Inp label="Procedure volume" value={procedureVol} onChange={setProcedureVol}
          options={[{v:"low",l:"Low"},{v:"medium",l:"Medium"},{v:"high",l:"High (surgical)"}]} />
      </div>
      <div className="flex items-center justify-center py-4">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
            <circle cx="50" cy="50" r="42" fill="none"
              stroke={riskScore > 70 ? "#f87171" : riskScore > 40 ? "#fbbf24" : "#34d399"}
              strokeWidth="8" strokeDasharray={`${riskScore * 2.64} 264`} strokeLinecap="round"/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-black" style={{ color: riskScore > 70 ? "#f87171" : riskScore > 40 ? "#fbbf24" : "#34d399" }}>
              {riskScore}
            </p>
            <p className="text-[8px] text-white/25 uppercase">Risk Score</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Annual claim prob" value={`${annualProb}%`} color="#f87171" />
        <Stat label="Specialty base" value={`${baseRisk}%`} color="#a78bfa" />
        <Stat label="Avg premium" value={fN(spec.mal)} sub="/year" color="#fbbf24" />
      </div>
      <Card>
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Carrier Comparison</h3>
        <div className="space-y-1">
          {CARRIERS.map((c, i) => {
            const premium = Math.round(spec.mal * c.premium);
            return (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                <div>
                  <p className="text-[11px] text-white/60 font-medium">{c.name}</p>
                  <p className="text-[8px] text-white/20">{c.coverage} | {c.rating} rated | {(c.settlement*100).toFixed(0)}% settlement rate</p>
                </div>
                <p className="text-xs font-bold text-white/50 tabular-nums">{fN(premium)}/yr</p>
              </div>
            );
          })}
        </div>
      </Card>
      {riskScore > 60 && <Alert type="warn">Elevated risk. Consider occurrence-based policy over claims-made, maintain detailed documentation, and review consent procedures.</Alert>}
    </div>
  );
}
