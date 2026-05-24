import { useState, useMemo } from "react";
import { SPECIALTIES, STATE_TAX, STATE_COL, STATE_NAMES, REGION_SALARY, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Alert, Badge, Takeaway } from "../components/ui";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/50 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>);
};

export default function IncomeMap({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const sal = profile.salary || spec.m;
  const state = profile.state || "NY";

  // Rank metros by COL-adjusted compensation
  const metroRankings = useMemo(() => {
    return Object.entries(REGION_SALARY.metros)
      .map(([city, d]) => {
        const colAdj = Math.round(d.avg * (100 / d.col));
        const taxState = city.split(", ")[1];
        const stateRate = STATE_TAX[taxState] || 0;
        const afterTax = Math.round(d.avg * (1 - stateRate - 0.28)); // rough federal+state
        const afterTaxAdj = Math.round(afterTax * (100 / d.col));
        return { city, avg: d.avg, col: d.col, growth: d.growth, colAdj, afterTax, afterTaxAdj, state: taxState };
      })
      .sort((a, b) => b.afterTaxAdj - a.afterTaxAdj);
  }, []);

  // Where does the user sit?
  const userColAdj = Math.round(sal * (100 / (STATE_COL[state] || 100)));
  const userRank = metroRankings.filter(m => m.afterTaxAdj < userColAdj).length + 1;
  const national = REGION_SALARY.national;
  const vsNational = sal - national;
  const bestCity = metroRankings[0];
  const worstCity = metroRankings[metroRankings.length - 1];

  const chartData = metroRankings.slice(0, 12).map(m => ({
    name: m.city.split(",")[0],
    value: Math.round(m.afterTaxAdj / 1000),
    yours: m.state === state,
    color: m.state === state ? "#34d399" : m.afterTaxAdj > userColAdj ? "#60a5fa" : "rgba(255,255,255,0.08)",
  }));

  // Regional comparison
  const regionData = Object.entries(REGION_SALARY.regions).map(([name, avg]) => ({
    name, value: Math.round(avg / 1000), color: avg > national ? "#34d399" : "#fbbf24",
  }));

  return (
    <div className="space-y-5 animate-in">
      <Section title="Income & Location Intelligence" sub="Where You Stand Nationally" />

      <div className="grid grid-cols-4 gap-2">
        <Stat label="Your salary" value={fmt(sal)} color="#34d399" />
        <Stat label="vs National avg" value={`${vsNational >= 0 ? "+" : ""}${fN(vsNational)}`} sub={`Avg: ${fN(national)}`} color={vsNational >= 0 ? "#34d399" : "#f87171"} />
        <Stat label="COL-adjusted" value={fmt(userColAdj)} sub={`${STATE_NAMES[state]} COL: ${STATE_COL[state] || 100}`} color="#60a5fa" />
        <Stat label="Purchasing power rank" value={`#${userRank}/20`} color="#a78bfa" />
      </div>

      {/* Top metros by COL-adjusted after-tax income */}
      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Top Metros: After-Tax, COL-Adjusted ($K)</p>
        <p className="text-xs text-white/40 mb-2">Your purchasing power compared to top physician markets</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" barCategoryGap="10%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize:10, fill:"rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} unit="K" />
            <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:"rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} width={100} />
            <Tooltip content={<Tip />} />
            <Bar dataKey="value" name="Adj. Income ($K)" radius={[0,4,4,0]}>
              {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Regional averages */}
      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Regional Averages ($K)</p>
        <p className="text-xs text-white/40 mb-2">Medscape 2025: Midwest leads due to rural demand + lower COL</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={regionData} barCategoryGap="25%">
            <XAxis dataKey="name" tick={{ fontSize:11, fill:"rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:10, fill:"rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} domain={[300, 'auto']} unit="K" />
            <Tooltip content={<Tip />} />
            <Bar dataKey="value" name="Avg ($K)" radius={[4,4,0,0]}>
              {regionData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Metro details table */}
      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-2">Metro Details</p>
        <div className="space-y-1">
          {metroRankings.slice(0, 10).map((m, i) => (
            <div key={i} className={`flex items-center justify-between py-2 px-2 rounded-lg border-b border-white/[0.03] last:border-0 ${m.state === state ? "bg-emerald-500/[0.04]" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 w-5 text-right font-bold">{i+1}</span>
                <div>
                  <p className="text-sm text-white/55 font-medium">
                    {m.city} {m.state === state && <span className="text-emerald-400 text-xs ml-1">you</span>}
                  </p>
                  <p className="text-xs text-white/40">COL: {m.col} | Growth: {m.growth}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white/55 tabular-nums">{fN(m.afterTaxAdj)}</p>
                <p className="text-xs text-white/40">adj. after tax</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Takeaway items={[
        `Your COL-adjusted income is ${fmt(userColAdj)}, ranking #${userRank} out of 20 major metros.`,
        `Best purchasing power: ${bestCity.city} (${fN(bestCity.afterTaxAdj)} adjusted). Worst: ${worstCity.city} (${fN(worstCity.afterTaxAdj)}).`,
        `Midwest pays ${fN(REGION_SALARY.regions.Midwest - national)} above national average due to rural demand and lower COL. Consider locums if open to relocation.`,
      ]} />
    </div>
  );
}
