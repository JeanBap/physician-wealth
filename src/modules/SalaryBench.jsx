import { useState, useMemo } from "react";
import { SPECIALTIES, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp , Takeaway } from "../components/ui";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div style={{background:"var(--tooltipBg)",border:"1px solid var(--tooltipBorder)"}} className="rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/75 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value}K</p>)}</div>);
};

export default function SalaryBench({ profile }) {
  const [salary, setSalary] = useState(profile.salary || 0);
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const displaySal = salary || spec.m;

  const pctile = displaySal <= spec.lo ? 25 : displaySal >= spec.hi ? 75 :
    25 + ((displaySal - spec.lo) / (spec.hi - spec.lo)) * 50;
  const sorted = Object.entries(SPECIALTIES).sort((a, b) => b[1].m - a[1].m);
  const rank = sorted.findIndex(([k]) => k === profile.specialty) + 1;
  const gap = spec.hi - displaySal;

  const chartData = useMemo(() =>
    sorted.map(([k, s]) => ({
      name: k.length > 14 ? k.slice(0, 13) + "." : k,
      salary: Math.round(s.m / 1000),
      yours: k === profile.specialty,
    })), [profile.specialty]);

  // Range chart for your specialty
  const rangeData = [{ name: profile.specialty, lo: Math.round(spec.lo/1000), med: Math.round(spec.m/1000), hi: Math.round(spec.hi/1000), you: Math.round(displaySal/1000) }];

  return (
    <div className="space-y-5 animate-in">
      <Section title="Salary Benchmarking" sub="Compensation Analysis" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Your salary" value={fmt(displaySal)} color="#34d399" />
        <Stat label="Percentile" value={`${pctile.toFixed(0)}th`} color={pctile > 50 ? "#34d399" : "#fbbf24"} />
        <Stat label="Gap to 75th" value={gap > 0 ? fmt(gap) : "Above"} color={gap > 0 ? "#f87171" : "#34d399"} />
      </div>

      <Inp label="Enter your salary" value={salary} onChange={setSalary} type="number" pre="$" />

      {/* Percentile gauge */}
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-2">{profile.specialty} Salary Range</p>
        <div className="relative h-8 bg-white/[0.04] rounded-full overflow-visible mx-4">
          {/* 25th-75th range */}
          <div className="absolute h-full bg-gradient-to-r from-emerald-500/10 to-emerald-500/20 rounded-full" style={{ left: "0%", width: "100%" }} />
          {/* Your position marker */}
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 z-10" style={{ background:"var(--bg2)",
            left: `${Math.min(100, Math.max(0, pctile / 75 * 100))}%`,
            borderColor: pctile > 50 ? "#34d399" : "#fbbf24",
            boxShadow: `0 0 8px ${pctile > 50 ? "#34d39940" : "#fbbf2440"}`
          }} />
          {/* Median marker */}
          <div className="absolute top-0 h-full w-0.5 bg-white/15" style={{ left: "50%" }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-white/55 mx-4">
          <span>{fN(spec.lo)} (25th)</span>
          <span>{fN(spec.m)} (50th)</span>
          <span>{fN(spec.hi)} (75th)</span>
        </div>
      </Card>

      {/* All specialties chart */}
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-1">All Specialties - Median Salary ($K)</p>
        <p className="text-xs text-white/55 mb-2">Rank #{rank}/{Object.keys(SPECIALTIES).length}</p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="vertical" barCategoryGap="8%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chartGrid)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 8, fill: "var(--chartText)" }} axisLine={false} tickLine={false} unit="K" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fill: "var(--text3)" }} axisLine={false} tickLine={false} width={100} />
            <Tooltip content={<Tip />} />
            <Bar dataKey="salary" name="Median" radius={[0, 4, 4, 0]} animationDuration={800}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.yours ? "#34d399" : "rgba(255,255,255,0.06)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Takeaway items={[
        `${pctile.toFixed(0)}th percentile for ${profile.specialty}. ${pctile > 60 ? "Above median." : "Below median. Negotiation opportunity."}`,
        gap > 0 ? `${fmt(gap)} gap to 75th percentile. Use this data in your next contract negotiation.` : `Top quartile. Strong compensation position.`,
        `${profile.specialty} ranks #${rank}/20 across all specialties.`,
      ]} />
    </div>
  );
}
