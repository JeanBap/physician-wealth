import { useState } from "react";
import { SPECIALTIES, STAGES, STATE_TAX, STATE_NAMES, MODULES } from "../lib/data";
import { Inp, Btn, Card, Badge } from "../components/ui";

export default function Onboarding({ profile, setProfile, navigate }) {
  const [step, setStep] = useState(0);
  const specKeys = Object.keys(SPECIALTIES);
  const stateKeys = Object.keys(STATE_TAX);
  const stageKeys = Object.keys(STAGES);

  const update = (k, v) => setProfile(prev => ({ ...prev, [k]: v }));

  const applyStage = (stg) => {
    const d = STAGES[stg].defaults;
    setProfile(prev => ({
      ...prev,
      stage: stg,
      salary: prev.salary || d.salary,
      loans: prev.loans || d.loans,
      savings: prev.savings || d.savings,
      retirement: prev.retirement || d.retirement,
      age: prev.age || d.age,
      priorities: STAGES[stg].recommended,
    }));
  };

  const steps = [
    // Step 0: Identity
    <div className="space-y-3">
      <p className="text-sm text-white/50 font-bold">Tell us about you</p>
      <div className="grid grid-cols-2 gap-2">
        <Inp label="First name" value={profile.firstName} onChange={v => update("firstName", v)} />
        <Inp label="Last name" value={profile.lastName} onChange={v => update("lastName", v)} />
      </div>
      <Inp label="Specialty" value={profile.specialty} onChange={v => update("specialty", v)}
        options={specKeys.map(s => ({ v: s, l: s }))} />
      <Inp label="State" value={profile.state} onChange={v => update("state", v)}
        options={stateKeys.map(s => ({ v: s, l: `${STATE_NAMES[s]} (${s})` }))} />
    </div>,
    // Step 1: Career stage
    <div className="space-y-3">
      <p className="text-sm text-white/50 font-bold">Career stage</p>
      <div className="grid grid-cols-1 gap-2">
        {stageKeys.map(k => {
          const s = STAGES[k];
          const active = profile.stage === k;
          return (
            <button key={k} onClick={() => applyStage(k)}
              className={`p-3 rounded-xl border text-left transition ${active ? "border-emerald-500/30 bg-emerald-500/[0.05]" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"}`}>
              <p className={`text-[11px] font-bold ${active ? "text-emerald-400" : "text-white/50"}`}>{s.label}</p>
              <p className="text-[9px] text-white/20">{s.sub}</p>
            </button>
          );
        })}
      </div>
    </div>,
    // Step 2: Finances
    <div className="space-y-3">
      <p className="text-sm text-white/50 font-bold">Your numbers</p>
      <Inp label="Annual salary" value={profile.salary} onChange={v => update("salary", +v)} type="number" pre="$" />
      <Inp label="Student loans" value={profile.loans} onChange={v => update("loans", +v)} type="number" pre="$" />
      <Inp label="Liquid savings" value={profile.savings} onChange={v => update("savings", +v)} type="number" pre="$" />
      <Inp label="Retirement accounts" value={profile.retirement} onChange={v => update("retirement", +v)} type="number" pre="$" />
      <Inp label="Age" value={profile.age} onChange={v => update("age", +v)} type="number" />
    </div>,
    // Step 3: Module picker
    <div className="space-y-3">
      <p className="text-sm text-white/50 font-bold">Pick your modules</p>
      <p className="text-[9px] text-white/20">We've recommended modules for your career stage. Customize below.</p>
      <div className="grid grid-cols-2 gap-1.5">
        {Object.entries(MODULES).filter(([k, m]) => !m.always).map(([k, mod]) => {
          const active = profile.priorities?.includes(k);
          return (
            <button key={k} onClick={() => {
              setProfile(prev => ({
                ...prev,
                priorities: active ? prev.priorities.filter(p => p !== k) : [...(prev.priorities || []), k]
              }));
            }} className={`p-2 rounded-xl border text-left transition ${active ? "border-emerald-500/20 bg-emerald-500/[0.04]" : "border-white/[0.06] bg-white/[0.02]"}`}>
              <p className={`text-[10px] font-medium ${active ? "text-white/60" : "text-white/25"}`}>{mod.label}</p>
              {mod.tier !== "free" && <Badge color={mod.tier === "premium" ? "#fbbf24" : "#60a5fa"}>{mod.tier}</Badge>}
            </button>
          );
        })}
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0a0b10" }}>
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <p className="text-emerald-400 text-xl font-black" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            Setup ({step + 1}/4)
          </p>
        </div>
        <div className="flex gap-1 justify-center">
          {[0,1,2,3].map(i => (
            <div key={i} className={`h-1 rounded-full transition-all ${i <= step ? "w-12 bg-emerald-500" : "w-8 bg-white/[0.06]"}`} />
          ))}
        </div>
        <Card>{steps[step]}</Card>
        <div className="flex gap-2">
          {step > 0 && <Btn variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">Back</Btn>}
          <Btn onClick={() => {
            if (step < 3) setStep(step + 1);
            else {
              setProfile(prev => ({ ...prev, onboardingComplete: true }));
              navigate("dashboard");
            }
          }} className="flex-1">
            {step < 3 ? "Next" : "Launch Dashboard"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
