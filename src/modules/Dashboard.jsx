import { useState, useEffect } from "react";
import { SPECIALTIES, MODULES, STATE_TAX, fedTax, fica, fmt, fN } from "../lib/data";
import { Stat, Card, Alert, Donut, Spark } from "../components/ui";

export default function Dashboard({ profile, navigate }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const sal = profile.salary || spec.m;
  const state = profile.state || "NY";

  // FI countdown ticker
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => { const t = setInterval(() => setElapsed(p => p + 1), 1000); return () => clearInterval(t); }, []);

  const savings = profile.savings || 50000;
  const retirement = profile.retirement || 100000;
  const investments = profile.investments || 80000;
  const loans = profile.loans || 250000;
  const netWorth = savings + retirement + investments - loans;
  const fiTarget = sal * 0.6 / 0.04;
  const fiPct = Math.min(100, Math.round((netWorth / fiTarget) * 100));
  const totalTax = fedTax(sal, profile.married) + Math.round(sal * (STATE_TAX[state] || 0)) + Math.round(fica(sal));
  const takeHome = sal - totalTax;
  const savingsRate = sal > 0 ? Math.round(((sal - takeHome * 0.8) / sal) * 100) : 0;

  // FI countdown
  const annualSave = sal * 0.2;
  const gap = fiTarget - netWorth;
  const yearsToFI = gap > 0 ? Math.max(0, Math.log(1 + gap / annualSave * 0.07) / Math.log(1.07)) : 0;
  const fiDate = new Date(Date.now() + yearsToFI * 365.25 * 86400000);
  const daysLeft = Math.max(0, Math.round((fiDate - Date.now()) / 86400000));
  const hoursLeft = Math.max(0, Math.round((fiDate - Date.now()) / 3600000) % 24);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  const quickNav = Object.entries(MODULES)
    .filter(([k, m]) => !m.always && (profile.priorities?.includes(k) || m.tier === "free"))
    .slice(0, 6);

  return (
    <div className="space-y-5 animate-in">
      {/* Greeting */}
      <div>
        <p className="text-sm text-white/30">{greeting()}, Dr. {profile.lastName || "Physician"}</p>
        <p className="text-white/10 text-[9px]">{profile.specialty} | {state}</p>
      </div>

      {/* FI Countdown */}
      <Card className="text-center py-4 bg-gradient-to-b from-emerald-500/[0.04] to-transparent">
        <p className="text-[8px] text-emerald-400/40 uppercase tracking-[0.2em]">Financial Independence In</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <div>
            <p className="text-3xl font-black text-emerald-400 tabular-nums">{Math.floor(yearsToFI)}</p>
            <p className="text-[7px] text-white/15 uppercase">years</p>
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-400/60 tabular-nums">{daysLeft % 365}</p>
            <p className="text-[7px] text-white/15 uppercase">days</p>
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-400/30 tabular-nums">{hoursLeft}</p>
            <p className="text-[7px] text-white/15 uppercase">hours</p>
          </div>
        </div>
        <div className="mt-3 mx-auto w-48">
          <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${fiPct}%` }} />
          </div>
          <p className="text-[8px] text-white/15 mt-1">{fiPct}% to FI target ({fmt(fiTarget)})</p>
        </div>
      </Card>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Net worth" value={fmt(netWorth)} color={netWorth >= 0 ? "#34d399" : "#f87171"} />
        <Stat label="Take-home" value={fmt(takeHome)} sub={`Tax: ${((totalTax/sal)*100).toFixed(0)}%`} color="#60a5fa" />
        <Stat label="Savings rate" value={`${savingsRate}%`} color={savingsRate >= 20 ? "#34d399" : "#fbbf24"} />
        <Stat label="Specialty rank" value={`#${Object.entries(SPECIALTIES).sort((a,b)=>b[1].m-a[1].m).findIndex(([k])=>k===profile.specialty)+1}/20`} color="#a78bfa" />
      </div>

      {/* Quick nav */}
      <div>
        <p className="text-[9px] text-white/15 uppercase tracking-widest mb-2">Your Modules</p>
        <div className="grid grid-cols-3 gap-1.5">
          {quickNav.map(([k, m]) => (
            <button key={k} onClick={() => navigate(k)}
              className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-emerald-500/20 transition text-left">
              <p className="text-[10px] text-white/40 font-medium">{m.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {loans > 200000 && <Alert type="warn">Student loans exceed $200K. Review Loan Optimizer for PSLF/refinance options.</Alert>}
      {savingsRate < 15 && <Alert type="warn">Savings rate below 15%. Consider increasing retirement contributions.</Alert>}
    </div>
  );
}
