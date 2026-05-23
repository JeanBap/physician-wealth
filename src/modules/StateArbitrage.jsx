import { useState, useMemo } from "react";
import { SPECIALTIES, STATE_TAX, STATE_NAMES, STATE_COL, fedTax, fica, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Alert, Inp } from "../components/ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

const NO_TAX = ["FL","TX","NV","WA","WY","SD","TN","NH","AK"];

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl">
      <p className="text-[9px] text-white/30 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[11px] font-bold" style={{ color: p.color }}>{p.name}: ${p.value?.toLocaleString()}</p>
      ))}
    </div>
  );
};

export default function StateArbitrage({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [salary, setSalary] = useState(profile.salary || spec.m);
  const [showCOL, setShowCOL] = useState(true);
  const currentState = profile.state || "NY";
  const currentRate = STATE_TAX[currentState] || 0;
  const currentCOL = STATE_COL[currentState] || 100;
  const currentTax = Math.round(salary * currentRate);

  const rankings = useMemo(() => {
    return Object.entries(STATE_TAX)
      .map(([st, rate]) => {
        const tax = Math.round(salary * rate);
        const taxSavings = currentTax - tax;
        const col = STATE_COL[st] || 100;
        // COL-adjusted: normalize salary purchasing power
        const colMultiplier = currentCOL / col;
        const adjustedIncome = Math.round((salary - tax) * colMultiplier);
        const currentAdjusted = Math.round((salary - currentTax));
        const realGain = adjustedIncome - currentAdjusted;
        return {
          st,
          name: STATE_NAMES[st] || st,
          rate,
          tax,
          taxSavings,
          col,
          colDiff: Math.round((currentCOL - col) / currentCOL * 100),
          adjustedIncome,
          realGain,
          twentyYr: (showCOL ? realGain : taxSavings) * 20,
          sortValue: showCOL ? realGain : taxSavings,
        };
      })
      .sort((a, b) => b.sortValue - a.sortValue)
      .slice(0, 15);
  }, [salary, currentState, showCOL]);

  const best = rankings[0];
  const chartData = rankings.slice(0, 10).map(r => ({
    name: r.st,
    value: r.sortValue,
    yours: r.st === currentState,
  }));

  return (
    <div className="space-y-5 animate-in">
      <Section title="State Tax Arbitrage" sub="Tax + Cost of Living Analysis" />
      <div className="grid grid-cols-2 gap-2">
        <Inp label="Annual income" value={salary} onChange={setSalary} type="number" pre="$" />
        <Stat label={`Current (${currentState})`} value={`${(currentRate*100).toFixed(1)}%`} sub={`COL: ${currentCOL} | Tax: ${fN(currentTax)}`} color="#f87171" />
      </div>

      {/* Toggle COL adjustment */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
        <button onClick={() => setShowCOL(false)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${!showCOL ? "bg-emerald-500/15 text-emerald-400" : "text-white/20"}`}>
          Tax Only
        </button>
        <button onClick={() => setShowCOL(true)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${showCOL ? "bg-emerald-500/15 text-emerald-400" : "text-white/20"}`}>
          Tax + Cost of Living
        </button>
        <p className="text-[8px] text-white/15 ml-auto">MERIC 2025 Index (100 = US avg)</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Max annual gain" value={fmt(best?.sortValue || 0)} sub={`Move to ${best?.name || ""}`} color="#34d399" />
        <Stat label="20-year impact" value={fmt(best?.twentyYr || 0)} sub="Cumulative at same income" color="#34d399" />
      </div>

      {/* Chart */}
      <Card>
        <p className="text-[9px] text-white/15 uppercase tracking-widest mb-2">
          Top 10 {showCOL ? "Real Income Gain" : "Tax Savings"} vs {currentState}
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical" barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 8, fill: "rgba(255,255,255,0.2)" }} axisLine={false} tickLine={false}
              tickFormatter={v => v >= 0 ? `+$${(v/1000).toFixed(0)}K` : `-$${(Math.abs(v)/1000).toFixed(0)}K`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} width={35} />
            <Tooltip content={<ChartTip />} />
            <Bar dataKey="value" name={showCOL ? "Real Gain" : "Tax Savings"} radius={[0, 4, 4, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.yours ? "#60a5fa" : d.value > 0 ? "#34d39960" : "#f8717160"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* State table */}
      <Card>
        <p className="text-[9px] text-white/15 uppercase tracking-widest mb-2">Detailed Comparison</p>
        <div className="space-y-1">
          {rankings.map((r, i) => (
            <div key={r.st} className={`flex items-center justify-between py-1.5 px-2 rounded-lg border-b border-white/[0.02] last:border-0 ${r.st === currentState ? "bg-white/[0.03]" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="text-[8px] text-white/10 w-4 text-right">{i+1}</span>
                <div>
                  <p className="text-[11px] text-white/50 font-medium">
                    {r.name} ({r.st})
                    {r.st === currentState && <span className="text-[8px] text-blue-400 ml-1">you</span>}
                    {NO_TAX.includes(r.st) && <span className="text-[8px] text-emerald-400/40 ml-1">0% tax</span>}
                  </p>
                  <p className="text-[8px] text-white/15">
                    Tax: {(r.rate*100).toFixed(1)}% ({fN(r.tax)}) | COL: {r.col} ({r.colDiff > 0 ? `${r.colDiff}% cheaper` : `${Math.abs(r.colDiff)}% pricier`})
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold tabular-nums ${r.sortValue > 0 ? "text-emerald-400" : r.sortValue < 0 ? "text-red-400" : "text-white/20"}`}>
                  {r.sortValue > 0 ? "+" : ""}{fmt(r.sortValue)}
                </span>
                <p className="text-[7px] text-white/10">{showCOL ? "real gain" : "tax savings"}/yr</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-1">
        {NO_TAX.map(st => (
          <span key={st} className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/50 font-medium">
            {STATE_NAMES[st]} (0%)
          </span>
        ))}
      </div>

      <Alert type="info">
        {showCOL
          ? "COL-adjusted gains account for purchasing power differences. A $20K tax saving in WA may be offset by 14% higher living costs vs. TX."
          : "Tax-only view shows raw state income tax savings. Toggle to COL-adjusted for real purchasing power comparison."}
      </Alert>
    </div>
  );
}
