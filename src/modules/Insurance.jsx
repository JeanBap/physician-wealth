import { useState } from "react";
import { SPECIALTIES, fN, fmt } from "../lib/data";
import { Section, Stat, Card, Alert } from "../components/ui";

const COVERAGE_TYPES = [
  { id: "malpractice", name: "Malpractice", icon: "◉", essential: true },
  { id: "disability", name: "Disability (Own-Occ)", icon: "◇", essential: true },
  { id: "life", name: "Term Life", icon: "◈", essential: true },
  { id: "umbrella", name: "Umbrella", icon: "◎", essential: true },
  { id: "health", name: "Health Insurance", icon: "◆", essential: true },
  { id: "cyber", name: "Cyber Liability", icon: "◇", essential: false },
  { id: "business", name: "Business Overhead", icon: "◈", essential: false },
];

export default function Insurance({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const sal = profile.salary || spec.m;
  const [has, setHas] = useState(COVERAGE_TYPES.reduce((o, c) => ({ ...o, [c.id]: c.essential }), {}));

  const toggle = (id) => setHas(prev => ({ ...prev, [id]: !prev[id] }));

  const costs = {
    malpractice: spec.mal,
    disability: Math.round(sal / 100000 * 2100),
    life: Math.round(sal * 0.003),
    umbrella: 500,
    health: 7200,
    cyber: 800,
    business: 1200,
  };

  const totalCost = Object.entries(costs).filter(([k]) => has[k]).reduce((s, [, v]) => s + v, 0);
  const missing = COVERAGE_TYPES.filter(c => c.essential && !has[c.id]);
  const gapScore = Math.round(((COVERAGE_TYPES.filter(c => has[c.id]).length) / COVERAGE_TYPES.length) * 100);

  return (
    <div className="space-y-5 animate-in">
      <Section title="Insurance Analysis" sub="Coverage Review" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Coverage score" value={`${gapScore}%`} color={gapScore > 80 ? "#34d399" : gapScore > 50 ? "#fbbf24" : "#f87171"} />
        <Stat label="Annual premium" value={fmt(totalCost)} color="#60a5fa" />
        <Stat label="Gaps" value={missing.length} color={missing.length > 0 ? "#f87171" : "#34d399"} />
      </div>
      <Card>
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Coverage Checklist</h3>
        <div className="space-y-1">
          {COVERAGE_TYPES.map(c => (
            <button key={c.id} onClick={() => toggle(c.id)}
              className="w-full flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded flex items-center justify-center text-[8px] ${has[c.id] ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.05] text-white/15"}`}>
                  {has[c.id] ? "✓" : ""}
                </div>
                <div>
                  <p className={`text-[11px] font-medium ${has[c.id] ? "text-white/60" : "text-white/25"}`}>{c.name}</p>
                  <p className="text-[8px] text-white/15">{c.essential ? "Essential" : "Recommended"} | Est. {fN(costs[c.id])}/yr</p>
                </div>
              </div>
              {!has[c.id] && c.essential && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">GAP</span>
              )}
            </button>
          ))}
        </div>
      </Card>
      {missing.length > 0 && <Alert type="danger">Missing essential coverage: {missing.map(m => m.name).join(", ")}. High-earning physicians are high-value lawsuit targets.</Alert>}
    </div>
  );
}
