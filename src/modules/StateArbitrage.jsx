import { useState, useMemo } from "react";
import { SPECIALTIES, STATE_TAX, STATE_NAMES, fedTax, fica, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Alert, Inp } from "../components/ui";

const NO_TAX = ["FL","TX","NV","WA","WY","SD","TN","NH","AK"];

export default function StateArbitrage({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [salary, setSalary] = useState(profile.salary || spec.m);
  const currentState = profile.state || "NY";
  const currentRate = STATE_TAX[currentState] || 0;
  const currentTax = Math.round(salary * currentRate);

  const rankings = useMemo(() => {
    return Object.entries(STATE_TAX)
      .map(([st, rate]) => ({
        st,
        name: STATE_NAMES[st] || st,
        rate,
        tax: Math.round(salary * rate),
        savings: currentTax - Math.round(salary * rate),
        twentyYr: (currentTax - Math.round(salary * rate)) * 20,
      }))
      .sort((a, b) => b.savings - a.savings)
      .slice(0, 15);
  }, [salary, currentState]);

  const bestSavings = rankings[0]?.savings || 0;
  const bestState = rankings[0]?.name || "";

  return (
    <div className="space-y-5 animate-in">
      <Section title="State Tax Arbitrage" sub="Geographic Optimization" />
      <div className="grid grid-cols-2 gap-2">
        <Inp label="Annual income" value={salary} onChange={setSalary} type="number" pre="$" />
        <Stat label={`Current (${currentState})`} value={`${(currentRate*100).toFixed(1)}%`} sub={fN(currentTax)} color="#f87171" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Max annual savings" value={fmt(bestSavings)} sub={`Move to ${bestState}`} color="#34d399" />
        <Stat label="20-year savings" value={fmt(bestSavings * 20)} sub="Cumulative at same income" color="#34d399" />
      </div>
      <Card>
        <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Top Savings Destinations</h3>
        <div className="space-y-1">
          {rankings.map((r, i) => (
            <div key={r.st} className={`flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0 ${r.st === currentState ? "bg-white/[0.03] rounded-lg px-2 -mx-2" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-white/15 w-4 text-right">{i+1}</span>
                <div>
                  <p className="text-[11px] text-white/60 font-medium">
                    {r.name} ({r.st})
                    {r.st === currentState && <span className="text-[8px] text-emerald-400 ml-1">current</span>}
                  </p>
                  <p className="text-[8px] text-white/20">{(r.rate*100).toFixed(1)}% state tax | {fN(r.tax)}/yr</p>
                </div>
              </div>
              <span className={`text-xs font-bold tabular-nums ${r.savings > 0 ? "text-emerald-400" : r.savings < 0 ? "text-red-400" : "text-white/20"}`}>
                {r.savings > 0 ? "+" : ""}{fmt(r.savings)}
              </span>
            </div>
          ))}
        </div>
      </Card>
      <div className="flex flex-wrap gap-1">
        {NO_TAX.map(st => (
          <span key={st} className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/60 font-medium">
            {STATE_NAMES[st]} (0%)
          </span>
        ))}
      </div>
      <Alert type="info">Consider total cost of living, not just tax rates. States like WA and TX have no income tax but may have higher property taxes or housing costs.</Alert>
    </div>
  );
}
