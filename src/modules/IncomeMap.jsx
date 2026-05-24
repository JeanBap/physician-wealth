import { useState, useMemo } from "react";
import { SPECIALTIES, STATE_TAX, STATE_COL, STATE_NAMES, METROS_100, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Alert, Badge, Takeaway } from "../components/ui";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/50 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>);
};

export default function IncomeMap({ profile }) {
  const sal = profile.salary || 300000;
  const state = profile.state || "NY";
  const [showTop, setShowTop] = useState(20);
  const [sortBy, setSortBy] = useState("adjusted"); // adjusted | nominal | growth

  const rankings = useMemo(() => {
    return METROS_100.map(m => {
      const stRate = STATE_TAX[m.s] || 0;
      const afterTax = Math.round(m.avg * (1 - stRate - 0.28));
      const adjusted = Math.round(afterTax * (100 / m.col));
      return { ...m, city: `${m.c}, ${m.s}`, afterTax, adjusted, stRate, isYours: m.s === state };
    }).sort((a, b) => {
      if (sortBy === "nominal") return b.avg - a.avg;
      if (sortBy === "growth") return b.g - a.g;
      return b.adjusted - a.adjusted;
    });
  }, [state, sortBy]);

  const userAdj = Math.round(sal * (1 - (STATE_TAX[state]||0) - 0.28) * (100 / (STATE_COL[state]||100)));
  const userRank = rankings.filter(m => m.adjusted > userAdj).length + 1;
  const best = rankings[0];
  const national = 374000;

  const chartData = rankings.slice(0, Math.min(showTop, 25)).map(m => ({
    name: m.c.length > 12 ? m.c.slice(0,11)+"." : m.c,
    value: sortBy === "nominal" ? Math.round(m.avg/1000) : sortBy === "growth" ? m.g : Math.round(m.adjusted/1000),
    yours: m.isYours,
  }));

  return (
    <div className="space-y-5 animate-in">
      <Section title="Income & Location Intelligence" sub="100 US Metros Ranked" />

      <div className="grid grid-cols-4 gap-2">
        <Stat label="Your salary" value={fmt(sal)} color="#34d399" />
        <Stat label="COL-adjusted" value={fmt(userAdj)} sub={`${STATE_NAMES[state]} COL: ${STATE_COL[state]||100}`} color="#60a5fa" />
        <Stat label="Your rank" value={`#${userRank}/100`} color="#a78bfa" />
        <Stat label="Best metro" value={best?.c || ""} sub={fmt(best?.adjusted||0)} color="#fbbf24" />
      </div>

      {/* Sort + filter controls */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/[0.05]">
          {[{id:"adjusted",l:"COL-Adjusted"},{id:"nominal",l:"Nominal"},{id:"growth",l:"Growth %"}].map(s => (
            <button key={s.id} onClick={() => setSortBy(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${sortBy === s.id ? "bg-white/[0.06] text-white/65" : "text-white/40"}`}>
              {s.l}
            </button>
          ))}
        </div>
        <select value={showTop} onChange={e => setShowTop(+e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white/55 outline-none">
          <option value={20} className="bg-[#13141c]">Top 20</option>
          <option value={50} className="bg-[#13141c]">Top 50</option>
          <option value={100} className="bg-[#13141c]">All 100</option>
        </select>
      </div>

      {/* Chart */}
      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">
          {sortBy === "nominal" ? "Nominal Salary ($K)" : sortBy === "growth" ? "Annual Growth (%)" : "After-Tax, COL-Adjusted ($K)"}
        </p>
        <ResponsiveContainer width="100%" height={Math.min(600, showTop * 24 + 40)}>
          <BarChart data={chartData} layout="vertical" barCategoryGap="6%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize:10, fill:"rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize:10, fill:"rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} width={90} />
            <Tooltip content={<Tip />} />
            <Bar dataKey="value" name={sortBy === "growth" ? "Growth %" : "Income ($K)"} radius={[0,4,4,0]}>
              {chartData.map((d, i) => <Cell key={i} fill={d.yours ? "#34d399" : "rgba(255,255,255,0.06)"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Table */}
      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-2">Full Rankings</p>
        <div className="space-y-0.5 max-h-[400px] overflow-y-auto">
          {rankings.slice(0, showTop).map((m, i) => (
            <div key={i} className={`flex items-center justify-between py-2 px-2 rounded-lg text-sm ${m.isYours ? "bg-emerald-500/[0.04]" : ""} border-b border-white/[0.02]`}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs text-white/40 w-6 text-right font-bold">{i+1}</span>
                <div className="min-w-0">
                  <p className="text-sm text-white/55 font-medium truncate">
                    {m.city} {m.isYours && <span className="text-emerald-400 text-xs">you</span>}
                  </p>
                  <p className="text-xs text-white/40">
                    COL: {m.col} | Tax: {(m.stRate*100).toFixed(1)}% | Rent: ${m.rent?.toLocaleString()} | Home: ${m.home?.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-sm font-bold text-white/55 tabular-nums">{fN(m.adjusted)}</p>
                <p className="text-xs text-white/40">{fN(m.avg)} nom | {m.g}% growth</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Takeaway items={[
        `Your adjusted income ranks #${userRank}/100. ${userRank <= 20 ? "Top quintile." : userRank <= 50 ? "Upper half." : "Below median. Consider relocation."}`,
        `Best purchasing power: ${best?.c}, ${best?.s} (${fN(best?.adjusted||0)} adjusted). ${(STATE_TAX[best?.s]||0) === 0 ? "Zero state tax." : `${((STATE_TAX[best?.s]||0)*100).toFixed(1)}% state tax.`}`,
        `Midwest metros dominate COL-adjusted rankings. Rural demand + low COL = strong purchasing power.`,
      ]} />
    </div>
  );
}
