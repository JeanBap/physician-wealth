import { useState, useMemo } from "react";
import { SPECIALTIES, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Alert , Takeaway } from "../components/ui";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { chartBarFill, chartCircle, chartGrid, chartText } from "../lib/chartColors";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/75 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: {p.value}</p>)}</div>);
};

export default function BurnoutCost({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [emo, setEmo] = useState(5);
  const [phys, setPhys] = useState(4);
  const [cog, setCog] = useState(3);
  const [soc, setSoc] = useState(4);
  const score = Math.round((emo + phys + cog + soc) / 4 * 10);
  const sal = profile.salary || spec.m;

  const prodLoss = Math.round(sal * (score / 100) * 0.3);
  const healthCost = Math.round(score * 120);
  const turnoverRisk = Math.round(sal * 0.25 * (score / 100));
  const totalCost = prodLoss + healthCost + turnoverRisk;
  const divRisk = (spec.divRate * (1 + score / 200) * 100).toFixed(0);
  const claimRisk = (spec.claimRate * (1 + score / 300) * 100).toFixed(1);

  const radarData = [
    { dim: "Emotional", you: emo * 10, avg: spec.burn },
    { dim: "Physical", you: phys * 10, avg: spec.burn * 0.85 },
    { dim: "Cognitive", you: cog * 10, avg: spec.burn * 0.9 },
    { dim: "Social", you: soc * 10, avg: spec.burn * 0.75 },
  ];

  const costData = [
    { name: "Productivity", value: prodLoss, color: "#f87171" },
    { name: "Health", value: healthCost, color: "#fbbf24" },
    { name: "Turnover Risk", value: turnoverRisk, color: "#a78bfa" },
  ];

  const dims = [
    { label: "Emotional exhaustion", val: emo, set: setEmo, desc: "Feeling drained, overwhelmed" },
    { label: "Physical fatigue", val: phys, set: setPhys, desc: "Sleep issues, chronic tiredness" },
    { label: "Cognitive load", val: cog, set: setCog, desc: "Decision fatigue, brain fog" },
    { label: "Social withdrawal", val: soc, set: setSoc, desc: "Avoiding colleagues, isolation" },
  ];

  // Top 8 specialties by burnout
  const burnRank = useMemo(() =>
    Object.entries(SPECIALTIES).sort((a,b) => b[1].burn - a[1].burn).slice(0,8).map(([k,s]) => ({
      name: k.length > 14 ? k.slice(0,13)+"." : k, burn: s.burn, yours: k === profile.specialty
    })), [profile.specialty]);

  return (
    <div className="space-y-5 animate-in">
      <Section title="Burnout Cost Calculator" sub="Hidden Financial Impact" />

      {/* Score gauge */}
      <div className="flex items-center justify-center py-3">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke={chartCircle()} strokeWidth="8"/>
            <circle cx="50" cy="50" r="42" fill="none"
              stroke={score > 60 ? "#f87171" : score > 40 ? "#fbbf24" : "#34d399"}
              strokeWidth="8" strokeDasharray={`${score * 2.64} 264`} strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.5s ease" }}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-black" style={{ color: score > 60 ? "#f87171" : score > 40 ? "#fbbf24" : "#34d399" }}>{score}</p>
            <p className="text-sm text-white/55 uppercase">Burnout Score</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Annual cost" value={fmt(totalCost)} color="#f87171" />
        <Stat label="Specialty avg" value={`${spec.burn}%`} color="#a78bfa" />
        <Stat label="Divorce risk" value={`${divRisk}%`} color="#f472b6" />
      </div>

      {/* Sliders */}
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-3">Self-Assessment (1-10)</p>
        <div className="space-y-4">
          {dims.map((d, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <div><p className="text-sm text-white/65 font-medium">{d.label}</p><p className="text-xs text-white/55">{d.desc}</p></div>
                <span className="text-sm font-black tabular-nums w-6 text-right" style={{ color: d.val > 7 ? "#f87171" : d.val > 4 ? "#fbbf24" : "#34d399" }}>{d.val}</span>
              </div>
              <input type="range" min="1" max="10" value={d.val} onChange={e => d.set(+e.target.value)}
                className="w-full h-1.5 bg-white/[0.06] rounded-full appearance-none cursor-pointer accent-emerald-500"
                style={{ accentColor: d.val > 7 ? "#f87171" : d.val > 4 ? "#fbbf24" : "#34d399" }} />
            </div>
          ))}
        </div>
      </Card>

      {/* Radar + Cost bar side by side */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs text-white/55 uppercase tracking-widest mb-1">You vs Specialty Average</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
              <PolarGrid stroke={chartCircle()}/>
              <PolarAngleAxis dataKey="dim" tick={{ fontSize:8, fill:chartText() }}/>
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0,100]}/>
              <Radar name="You" dataKey="you" stroke="#f87171" fill="#f87171" fillOpacity={0.15} strokeWidth={2} dot={{ r:3, fill:"#f87171" }}/>
              <Radar name="Specialty" dataKey="avg" stroke="#a78bfa" fill="none" strokeWidth={1.5} strokeDasharray="4 4"/>
            </RadarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <p className="text-xs text-white/55 uppercase tracking-widest mb-1">Financial Impact</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={costData} barCategoryGap="25%">
              <XAxis dataKey="name" tick={{ fontSize:8, fill:chartText() }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:8, fill:chartText() }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="value" name="Cost" radius={[4,4,0,0]}>{costData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-center text-xs font-bold text-red-400 mt-1">Total: {fmt(totalCost)}/yr</p>
        </Card>
      </div>

      {/* Specialty burnout ranking */}
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-1">Burnout by Specialty (Top 8)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={burnRank} layout="vertical" barCategoryGap="12%">
            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid()} horizontal={false}/>
            <XAxis type="number" tick={{ fontSize:8, fill:chartText() }} axisLine={false} tickLine={false} unit="%"/>
            <YAxis type="category" dataKey="name" tick={{ fontSize:8, fill:chartText() }} axisLine={false} tickLine={false} width={90}/>
            <Bar dataKey="burn" name="Burnout %" radius={[0,4,4,0]}>{burnRank.map((d,i)=><Cell key={i} fill={d.yours?"#f87171":chartBarFill()}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Malpractice risk" value={`+${claimRisk}%`} sub="Burnout correlation" color="#f87171" />
        <Stat label="Replacement cost" value={fmt(Math.round(sal * 0.25))} sub="If you leave" color="#a78bfa" />
      </div>

      {score > 50 && <Alert type="danger">Elevated burnout. Consider reducing call, peer support, or physician wellness program. Costing you {fmt(totalCost)}/yr.</Alert>}

      <Takeaway items={[
        `Burnout score ${score}/100 costs ~${fmt(totalCost)}/yr in productivity, health, and turnover risk.`,
        `${profile.specialty} burnout rate: ${spec.burn}%. ${score > 50 ? "You're elevated. Consider reducing call or seeking peer support." : "Below average. Stay vigilant."}`,
        `Burnout correlates with ${claimRisk}% malpractice risk increase and ${divRisk}% divorce probability.`,
      ]} />
    </div>
  );
}
