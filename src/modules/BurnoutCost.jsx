import { useState } from "react";
import { SPECIALTIES, fmt, fN, STATE_TAX } from "../lib/data";
import { Section, Stat, Inp, Card, Alert } from "../components/ui";

export default function BurnoutCost({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [emo, setEmo] = useState(5);
  const [phys, setPhys] = useState(4);
  const [cog, setCog] = useState(3);
  const [soc, setSoc] = useState(4);
  const score = Math.round((emo + phys + cog + soc) / 4 * 10);

  const sal = profile.salary || spec.m;
  const prodLoss = Math.round(sal * (score / 100) * 0.3);
  const turnoverCost = Math.round(sal * 0.25);
  const healthCost = Math.round(score * 120);
  const divRisk = (spec.divRate * (1 + score / 200) * 100).toFixed(0);
  const totalCost = prodLoss + healthCost;
  const claimRisk = (spec.claimRate * (1 + score / 300) * 100).toFixed(1);

  const dims = [
    { label: "Emotional exhaustion", val: emo, set: setEmo, desc: "Feeling drained, overwhelmed" },
    { label: "Physical fatigue", val: phys, set: setPhys, desc: "Sleep issues, chronic tiredness" },
    { label: "Cognitive load", val: cog, set: setCog, desc: "Decision fatigue, brain fog" },
    { label: "Social withdrawal", val: soc, set: setSoc, desc: "Avoiding colleagues, isolation" },
  ];

  return (
    <div className="space-y-5 animate-in">
      <Section title="Burnout Cost Calculator" sub="Hidden Financial Impact" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Burnout score" value={`${score}/100`} color={score > 60 ? "#f87171" : score > 40 ? "#fbbf24" : "#34d399"} />
        <Stat label="Annual cost" value={fmt(totalCost)} color="#f87171" />
        <Stat label="Specialty avg" value={`${spec.burn}%`} color="#a78bfa" />
      </div>
      <Card>
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Self-Assessment (1-10)</h3>
        <div className="space-y-3">
          {dims.map((d, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-[11px] text-white/50 font-medium">{d.label}</p>
                  <p className="text-[8px] text-white/20">{d.desc}</p>
                </div>
                <span className="text-sm font-bold text-white/60 tabular-nums w-6 text-right">{d.val}</span>
              </div>
              <input type="range" min="1" max="10" value={d.val} onChange={e => d.set(+e.target.value)}
                className="w-full h-1 bg-white/[0.06] rounded-full appearance-none cursor-pointer accent-emerald-500" />
            </div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Productivity loss" value={fmt(prodLoss)} sub="Reduced patient volume" color="#f87171" />
        <Stat label="Health costs" value={fmt(healthCost)} sub="Therapy, medication, sick days" color="#fbbf24" />
        <Stat label="Divorce risk" value={`${divRisk}%`} sub={`${profile.specialty} baseline: ${(spec.divRate*100).toFixed(0)}%`} color="#f87171" />
        <Stat label="Malpractice risk" value={`+${claimRisk}%`} sub="Burnout increases claim probability" color="#f87171" />
      </div>
      {score > 50 && <Alert type="danger">Your burnout score is elevated. Consider reducing call shifts, engaging peer support, or consulting a physician wellness program.</Alert>}
    </div>
  );
}
