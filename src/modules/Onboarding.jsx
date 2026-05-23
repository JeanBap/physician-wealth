import { useState } from "react";
import { SPECIALTIES, STATE_NAMES, STAGES } from "../lib/data";
import { Inp, Btn, Card, Badge, Section, Toggle, Alert } from "../components/ui";

const STEPS = ["Basics", "Income & Debt", "Assets & Insurance", "Family & Estate", "Modules"];

export default function Onboarding({ profile, setProfile, navigate }) {
  const [step, setStep] = useState(0);
  const update = (k, v) => setProfile(prev => ({ ...prev, [k]: v }));

  const applyStage = (stageKey) => {
    const s = STAGES[stageKey];
    if (s) setProfile(prev => ({ ...prev, ...s.defaults, stage: stageKey, priorities: s.recommended }));
  };

  const next = () => step < STEPS.length - 1 ? setStep(step + 1) : finish();
  const back = () => step > 0 && setStep(step - 1);
  const finish = () => {
    setProfile(prev => ({ ...prev, onboardingComplete: true }));
    navigate("dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0a0b10" }}>
      <div className="w-full max-w-lg space-y-5">
        <div className="text-center">
          <p className="text-emerald-400 text-lg font-black" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>PhysicianWealth</p>
          <p className="text-sm text-white/55 mt-1">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full transition-all" style={{ background: i <= step ? "#34d399" : "rgba(255,255,255,0.06)" }} />
          ))}
        </div>

        {/* Step 0: Basics */}
        {step === 0 && (
          <Card>
            <p className="text-sm text-white/55 font-bold mb-4">Career Stage</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {Object.entries(STAGES).map(([k, s]) => (
                <button key={k} onClick={() => applyStage(k)}
                  className={`p-3 rounded-xl text-left transition ${profile.stage === k ? "bg-emerald-500/10 border-emerald-500/25" : "bg-white/[0.03] border-white/[0.06]"} border`}>
                  <p className="text-sm text-white/75 font-bold">{s.label}</p>
                  <p className="text-xs text-white/55">{s.sub}</p>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="First name" value={profile.firstName} onChange={v => update("firstName", v)} />
              <Inp label="Last name" value={profile.lastName} onChange={v => update("lastName", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Inp label="Specialty" value={profile.specialty} onChange={v => update("specialty", v)}
                options={Object.keys(SPECIALTIES).map(s => ({ v: s, l: s }))} />
              <Inp label="State" value={profile.state} onChange={v => update("state", v)}
                options={Object.entries(STATE_NAMES).map(([k, v]) => ({ v: k, l: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Inp label="Age" value={profile.age} onChange={v => update("age", +v)} type="number" />
              <Inp label="Married" value={profile.married ? "yes" : "no"} onChange={v => update("married", v === "yes")}
                options={[{v:"no",l:"Single"},{v:"yes",l:"Married"}]} />
            </div>
          </Card>
        )}

        {/* Step 1: Income & Debt */}
        {step === 1 && (
          <Card>
            <p className="text-sm text-white/55 font-bold mb-4">Income</p>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="W-2 salary" value={profile.salary} onChange={v => update("salary", +v)} type="number" pre="$" />
              <Inp label="Moonlighting income" value={profile.moonlightIncome} onChange={v => update("moonlightIncome", +v)} type="number" pre="$" />
              <Inp label="Rental income (annual)" value={profile.rentalIncome} onChange={v => update("rentalIncome", +v)} type="number" pre="$" />
            </div>
            <p className="text-sm text-white/55 font-bold mt-5 mb-4">Debt</p>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Student loans" value={profile.loans} onChange={v => update("loans", +v)} type="number" pre="$" />
              <Inp label="Mortgage balance" value={profile.mortgageBalance} onChange={v => update("mortgageBalance", +v)} type="number" pre="$" />
              <Inp label="Car loan" value={profile.carLoan} onChange={v => update("carLoan", +v)} type="number" pre="$" />
              <Inp label="Credit card debt" value={profile.creditCardDebt} onChange={v => update("creditCardDebt", +v)} type="number" pre="$" />
            </div>
          </Card>
        )}

        {/* Step 2: Assets & Insurance */}
        {step === 2 && (
          <Card>
            <p className="text-sm text-white/55 font-bold mb-4">Assets</p>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Liquid savings" value={profile.savings} onChange={v => update("savings", +v)} type="number" pre="$" />
              <Inp label="Retirement accounts" value={profile.retirement} onChange={v => update("retirement", +v)} type="number" pre="$" />
              <Inp label="Taxable investments" value={profile.investments} onChange={v => update("investments", +v)} type="number" pre="$" />
              <Inp label="HSA balance" value={profile.hsa} onChange={v => update("hsa", +v)} type="number" pre="$" />
              <Inp label="529 plans" value={profile.plan529} onChange={v => update("plan529", +v)} type="number" pre="$" />
              <Inp label="Crypto / alt assets" value={profile.cryptoAssets} onChange={v => update("cryptoAssets", +v)} type="number" pre="$" />
            </div>
            <p className="text-sm text-white/55 font-bold mt-5 mb-4">Real Estate</p>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Primary home value" value={profile.homeValue} onChange={v => update("homeValue", +v)} type="number" pre="$" />
              <Inp label="Rental property value" value={profile.rentalPropertyValue} onChange={v => update("rentalPropertyValue", +v)} type="number" pre="$" />
              <Inp label="Rental equity" value={profile.rentalPropertyEquity} onChange={v => update("rentalPropertyEquity", +v)} type="number" pre="$" />
            </div>
            <p className="text-sm text-white/55 font-bold mt-5 mb-4">Insurance</p>
            <div className="space-y-1">
              <Toggle label="Own-occupation disability" value={profile.hasDI} onChange={v => update("hasDI", v)} />
              <Toggle label="Umbrella policy ($2M+)" value={profile.hasUmbrella} onChange={v => update("hasUmbrella", v)} />
              <Toggle label="Term life insurance" value={profile.hasLifeInsurance} onChange={v => update("hasLifeInsurance", v)} />
            </div>
          </Card>
        )}

        {/* Step 3: Family & Estate */}
        {step === 3 && (
          <Card>
            <p className="text-sm text-white/55 font-bold mb-4">Family</p>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Number of children" value={profile.kids} onChange={v => update("kids", +v)} type="number" />
              <Inp label="Target retire age" value={profile.retireAge} onChange={v => update("retireAge", +v)} type="number" />
            </div>
            {profile.hasSpouse && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Inp label="Spouse specialty" value={profile.spouseSpecialty} onChange={v => update("spouseSpecialty", v)}
                  options={[{v:"Non-physician",l:"Non-physician"},...Object.keys(SPECIALTIES).map(s => ({ v: s, l: s }))]} />
                <Inp label="Spouse salary" value={profile.spouseSalary} onChange={v => update("spouseSalary", +v)} type="number" pre="$" />
                <Inp label="Spouse loans" value={profile.spouseLoans} onChange={v => update("spouseLoans", +v)} type="number" pre="$" />
              </div>
            )}
            <p className="text-sm text-white/55 font-bold mt-5 mb-4">Estate Planning</p>
            <div className="space-y-1">
              <Toggle label="Will / testament" value={profile.hasWill} onChange={v => update("hasWill", v)} />
              <Toggle label="Revocable living trust" value={profile.hasTrust} onChange={v => update("hasTrust", v)} />
              <Toggle label="Power of attorney" value={profile.hasPOA} onChange={v => update("hasPOA", v)} />
              <Toggle label="Healthcare directive" value={profile.hasHealthcareDirective} onChange={v => update("hasHealthcareDirective", v)} />
            </div>
          </Card>
        )}

        {/* Step 4: Module selection */}
        {step === 4 && (
          <Card>
            <p className="text-sm text-white/55 font-bold mb-2">Choose your focus areas</p>
            <p className="text-xs text-white/55 mb-4">We'll customize your dashboard. You can change this later in Settings.</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { k:"tax", l:"Tax Optimization", icon:"📊" },
                { k:"loans", l:"Loan Strategy", icon:"🎯" },
                { k:"retirement", l:"Retirement Planning", icon:"🏦" },
                { k:"realestate", l:"Real Estate", icon:"🏠" },
                { k:"estateplan", l:"Estate Planning", icon:"📋" },
                { k:"insurance", l:"Insurance Review", icon:"🛡️" },
                { k:"contracts", l:"Contract Analysis", icon:"📝" },
                { k:"moonlight", l:"Side Income", icon:"💰" },
                { k:"burnout", l:"Burnout Prevention", icon:"🔥" },
                { k:"statemove", l:"State Relocation", icon:"🗺️" },
              ].map(m => {
                const sel = profile.priorities?.includes(m.k);
                return (
                  <button key={m.k} onClick={() => setProfile(prev => ({
                    ...prev, priorities: sel ? prev.priorities.filter(p => p !== m.k) : [...(prev.priorities || []), m.k]
                  }))} className={`p-3 rounded-xl text-left transition border ${sel ? "bg-emerald-500/10 border-emerald-500/25" : "bg-white/[0.03] border-white/[0.06]"}`}>
                    <span className="text-lg">{m.icon}</span>
                    <p className={`text-sm mt-1 font-medium ${sel ? "text-emerald-400" : "text-white/75"}`}>{m.l}</p>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Nav buttons */}
        <div className="flex gap-3">
          {step > 0 && <Btn variant="secondary" onClick={back}>Back</Btn>}
          <div className="flex-1" />
          <button onClick={finish} className="text-xs text-white/40 hover:text-white/55 py-2 px-3">Skip All</button>
          <Btn onClick={next}>{step === STEPS.length - 1 ? "Launch Dashboard" : "Continue"}</Btn>
        </div>
      </div>
    </div>
  );
}
