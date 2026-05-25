import { useState, useMemo } from "react";
import { SPECIALTIES, fN } from "../lib/data";
import { Section, Stat, Card, Alert, Inp , Takeaway } from "../components/ui";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { chartBarFill, chartCircle, chartGrid, chartText } from "../lib/chartColors";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/75 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: {p.value}</p>)}</div>);
};

const CARRIERS = [
  { name:"PIAA", premium:1.0, coverage:"1M/3M", rating:"A+", color:"#34d399" },
  { name:"MedPro", premium:0.95, coverage:"1M/3M", rating:"A++", color:"#60a5fa" },
  { name:"Doctors Co", premium:1.05, coverage:"1M/3M", rating:"A", color:"#a78bfa" },
  { name:"ProAssurance", premium:0.92, coverage:"1M/3M", rating:"A+", color:"#fbbf24" },
  { name:"Coverys", premium:0.88, coverage:"1M/3M", rating:"A-", color:"#f472b6" },
];

export default function MalpracticeRisk({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [yrsExp, setYrsExp] = useState(5);
  const [claims, setClaims] = useState(0);
  const [vol, setVol] = useState("medium");

  const baseRisk = spec.claimRate * 100;
  const expMod = yrsExp < 3 ? 1.3 : yrsExp < 10 ? 1.0 : 0.85;
  const claimMod = 1 + claims * 0.25;
  const volMod = vol === "high" ? 1.2 : vol === "low" ? 0.8 : 1.0;
  const riskScore = Math.min(100, Math.round(baseRisk * expMod * claimMod * volMod * 5));

  const riskRadar = [
    { factor: "Experience", value: yrsExp < 3 ? 80 : yrsExp < 10 ? 50 : 30 },
    { factor: "Claims Hx", value: Math.min(100, claims * 40) },
    { factor: "Volume", value: vol === "high" ? 80 : vol === "low" ? 30 : 50 },
    { factor: "Specialty", value: Math.round(baseRisk * 7) },
    { factor: "Burnout", value: Math.round(spec.burn) },
  ];

  const carrierData = CARRIERS.map(c => ({ name: c.name, premium: Math.round(spec.mal * c.premium / 1000), color: c.color, coverage: c.coverage, rating: c.rating }));

  // Claim rates by specialty (top 8)
  const claimRank = useMemo(() =>
    Object.entries(SPECIALTIES).sort((a,b) => b[1].claimRate - a[1].claimRate).slice(0,8).map(([k,s]) => ({
      name: k.length > 14 ? k.slice(0,13)+"." : k, rate: +(s.claimRate * 100).toFixed(1), yours: k === profile.specialty
    })), [profile.specialty]);

  return (
    <div className="space-y-5 animate-in">
      <Section title="Malpractice Risk" sub="Risk Assessment" />
      <div className="grid grid-cols-2 gap-2">
        <Inp label="Years experience" value={yrsExp} onChange={setYrsExp} type="number" />
        <Inp label="Prior claims" value={claims} onChange={setClaims} type="number" />
        <Inp label="Procedure volume" value={vol} onChange={setVol} options={[{v:"low",l:"Low"},{v:"medium",l:"Medium"},{v:"high",l:"High (surgical)"}]} />
      </div>

      {/* Risk gauge */}
      <div className="flex items-center justify-center py-3">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke={chartCircle()} strokeWidth="8"/>
            <circle cx="50" cy="50" r="42" fill="none"
              stroke={riskScore > 70 ? "#f87171" : riskScore > 40 ? "#fbbf24" : "#34d399"}
              strokeWidth="8" strokeDasharray={`${riskScore * 2.64} 264`} strokeLinecap="round"/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-black" style={{ color: riskScore > 70 ? "#f87171" : riskScore > 40 ? "#fbbf24" : "#34d399" }}>{riskScore}</p>
            <p className="text-sm text-white/55 uppercase">Risk Score</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Specialty base" value={`${baseRisk.toFixed(1)}%`} color="#a78bfa" />
        <Stat label="Avg premium" value={fN(spec.mal)} sub="/year" color="#fbbf24" />
        <Stat label="Burnout factor" value={`${spec.burn}%`} color="#f472b6" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Risk factors radar */}
        <Card>
          <p className="text-xs text-white/55 uppercase tracking-widest mb-1">Risk Factors</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={riskRadar} cx="50%" cy="50%" outerRadius="65%">
              <PolarGrid stroke={chartCircle()}/>
              <PolarAngleAxis dataKey="factor" tick={{ fontSize:7, fill:chartText() }}/>
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0,100]}/>
              <Radar name="Risk" dataKey="value" stroke="#f87171" fill="#f87171" fillOpacity={0.15} strokeWidth={2} dot={{ r:2, fill:"#f87171" }}/>
            </RadarChart>
          </ResponsiveContainer>
        </Card>
        {/* Carrier premiums */}
        <Card>
          <p className="text-xs text-white/55 uppercase tracking-widest mb-1">Carrier Premiums ($K/yr)</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={carrierData} barCategoryGap="20%">
              <XAxis dataKey="name" tick={{ fontSize:8, fill:chartText() }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:8, fill:chartText() }} axisLine={false} tickLine={false} unit="K"/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="premium" name="Premium ($K)" radius={[4,4,0,0]}>{carrierData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Claim rates by specialty */}
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-1">Claim Rates by Specialty (%)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={claimRank} layout="vertical" barCategoryGap="12%">
            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid()} horizontal={false}/>
            <XAxis type="number" tick={{ fontSize:8, fill:chartText() }} axisLine={false} tickLine={false} unit="%"/>
            <YAxis type="category" dataKey="name" tick={{ fontSize:8, fill:chartText() }} axisLine={false} tickLine={false} width={90}/>
            <Bar dataKey="rate" name="Claim Rate" radius={[0,4,4,0]}>{claimRank.map((d,i)=><Cell key={i} fill={d.yours?"#f87171":chartBarFill()}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {riskScore > 60 && <Alert type="warn">Elevated risk. Consider occurrence-based policy, detailed documentation, and consent review.</Alert>}

      <Takeaway items={[
        `Risk score: ${riskScore}/100. ${riskScore > 60 ? "Elevated. Focus on documentation." : "Within normal range."}`,
        `${profile.specialty} base claim rate: ${baseRisk.toFixed(1)}%. ${yrsExp < 3 ? "Early career adds 30% risk." : "Experience reduces risk."}`,
        `Always choose occurrence-based over claims-made policies. Shop carriers annually.`,
      ]} />
    </div>
  );
}
