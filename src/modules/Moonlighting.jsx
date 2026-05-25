import { useState, useMemo } from "react";
import { SPECIALTIES, STATE_TAX, fmt, fN, marginalRate } from "../lib/data";
import { Section, Stat, Card, Inp, Alert , Takeaway } from "../components/ui";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { chartGrid, chartText } from "../lib/chartColors";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/75 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>);
};

const GIGS = [
  { id:"locums", name:"Locum Tenens", hrRate:175, hrsPerWk:12, desc:"Hospital staffing", startup:500, taxDeduct:0.15, flex:40, demand:85 },
  { id:"telehealth", name:"Telehealth", hrRate:120, hrsPerWk:8, desc:"Virtual consults", startup:200, taxDeduct:0.10, flex:90, demand:75 },
  { id:"expert", name:"Expert Witness", hrRate:500, hrsPerWk:4, desc:"Legal testimony", startup:0, taxDeduct:0.05, flex:70, demand:60 },
  { id:"surveys", name:"Medical Surveys", hrRate:200, hrsPerWk:3, desc:"Pharma advisory", startup:0, taxDeduct:0.05, flex:95, demand:70 },
  { id:"teaching", name:"Med Education", hrRate:100, hrsPerWk:6, desc:"CME, precepting", startup:300, taxDeduct:0.10, flex:60, demand:80 },
  { id:"consult", name:"Startup Consulting", hrRate:250, hrsPerWk:5, desc:"Healthtech advisory", startup:0, taxDeduct:0.08, flex:80, demand:65 },
];

export default function Moonlighting({ profile }) {
  const [weeksPerYear, setWeeksPerYear] = useState(40);
  const mRate = marginalRate(profile.state || "NY");

  const gigsCalc = useMemo(() =>
    GIGS.map(g => {
      const gross = g.hrRate * g.hrsPerWk * weeksPerYear;
      const deductions = gross * g.taxDeduct;
      const taxable = gross - deductions;
      const tax = Math.round(taxable * mRate);
      const se = Math.round(taxable * 0.153 * 0.9235);
      const net = gross - tax - se + Math.round(deductions * mRate);
      return { ...g, gross, net, tax: tax + se, effectiveRate: gross > 0 ? ((gross - net) / gross * 100).toFixed(0) : "0", netPerHr: Math.round(net / (g.hrsPerWk * weeksPerYear)) };
    }).sort((a, b) => b.net - a.net)
  , [weeksPerYear, mRate]);

  const bestGig = gigsCalc[0];
  const chartData = gigsCalc.map(g => ({ name: g.name, net: Math.round(g.net / 1000), color: g === bestGig ? "#34d399" : "#60a5fa" }));
  const radarData = gigsCalc.map(g => ({ gig: g.name.split(" ")[0], netHr: g.netPerHr, flex: g.flex, demand: g.demand }));

  return (
    <div className="space-y-5 animate-in">
      <Section title="Moonlighting ROI" sub="Side Income Analysis" />
      <Inp label="Working weeks per year" value={weeksPerYear} onChange={setWeeksPerYear} type="number" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Best net income" value={fmt(bestGig.net)} sub={bestGig.name} color="#34d399" />
        <Stat label="Best $/hr" value={`$${Math.max(...gigsCalc.map(g => g.netPerHr))}`} sub="After-tax" color="#fbbf24" />
        <Stat label="Marginal tax" value={`${(mRate * 100).toFixed(0)}%`} sub={profile.state || "NY"} color="#a78bfa" />
      </div>

      {/* Net income comparison */}
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-1">Net Annual Income by Gig ($K)</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid()} />
            <XAxis dataKey="name" tick={{ fontSize: 8, fill: chartText() }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 8, fill: chartText() }} axisLine={false} tickLine={false} unit="K" />
            <Tooltip content={<Tip />} />
            <Bar dataKey="net" name="Net Income ($K)" radius={[4, 4, 0, 0]}>
              {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Gig cards */}
      <div className="space-y-2">
        {gigsCalc.map((g, i) => (
          <Card key={g.id} className={i === 0 ? "border-emerald-500/15 bg-emerald-500/[0.02]" : ""}>
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-sm text-white/75 font-bold">{g.name} {i === 0 && <span className="text-emerald-400 text-xs">TOP</span>}</p>
                <p className="text-xs text-white/55">{g.desc} | {g.hrsPerWk}hr/wk @ ${g.hrRate}/hr</p>
              </div>
              <p className="text-sm font-black text-emerald-400 tabular-nums">{fmt(g.net)}</p>
            </div>
            <div className="flex gap-3 text-xs text-white/55">
              <span>Gross: {fN(g.gross)}</span>
              <span>Tax: {fN(g.tax)}</span>
              <span>Eff: {g.effectiveRate}%</span>
              <span className="text-emerald-400/70">Net/hr: ${g.netPerHr}</span>
            </div>
            <div className="mt-1.5 h-1 bg-white/[0.03] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500/40 rounded-full" style={{ width: `${(g.net / bestGig.net) * 100}%` }} />
            </div>
          </Card>
        ))}
      </div>

      <Alert type="info">Self-employment adds 15.3% tax. Expert witness has highest net $/hr due to low time commitment.</Alert>

      <Takeaway items={[
        `Best ROI: ${bestGig.name} at $${bestGig.netPerHr}/hr after tax (${fmt(bestGig.net)}/yr).`,
        `Expert witness has highest $/hr but lowest volume. Locums has highest total income.`,
        `At your marginal rate, every $1 moonlighting nets ~$${(1 - mRate - 0.15).toFixed(2)} after tax + SE tax.`,
      ]} />
    </div>
  );
}
