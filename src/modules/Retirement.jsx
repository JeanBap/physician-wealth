import { useState, useMemo } from "react";
import { SPECIALTIES, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Donut, Alert } from "../components/ui";
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl">
    <p className="text-[9px] text-white/30 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-[11px] font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}
  </div>);
};

export default function Retirement({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const sal = profile.salary || spec.m;
  const [age, setAge] = useState(profile.age || 35);
  const [retireAge, setRetireAge] = useState(60);
  const [current401k, setCurrent401k] = useState(profile.retirement || 100000);
  const [currentIRA, setCurrentIRA] = useState(0);
  const [currentTax, setCurrentTax] = useState(profile.investments || 80000);
  const [annualSave, setAnnualSave] = useState(Math.round(sal * 0.2));
  const [returnRate, setReturnRate] = useState(7);

  const yearsToRetire = Math.max(0, retireAge - age);
  const totalCurrent = current401k + currentIRA + currentTax;
  const fiTarget = sal * 0.6 / 0.04;

  const projection = useMemo(() => {
    let bal = totalCurrent;
    return Array.from({ length: yearsToRetire + 1 }, (_, i) => {
      const d = { age: age + i, balance: Math.round(bal), target: fiTarget, contributions: Math.round(annualSave * i) };
      bal = bal * (1 + returnRate / 100) + annualSave;
      return d;
    });
  }, [totalCurrent, yearsToRetire, age, returnRate, annualSave, fiTarget]);

  const fv = projection[projection.length - 1]?.balance || 0;
  const gap = fiTarget - fv;
  const funded = Math.min(100, Math.round((fv / fiTarget) * 100));
  const monthlyIncome = Math.round(fv * 0.04 / 12);

  const contribData = [
    { name: "401(k)", value: 23500, max: 23500, color: "#34d399" },
    { name: "Employer", value: 46500, max: 46500, color: "#60a5fa" },
    { name: "Roth IRA", value: 7000, max: 7000, color: "#a78bfa" },
    { name: "HSA", value: 8300, max: 8300, color: "#fbbf24" },
    ...(age >= 50 ? [{ name: "Catch-up", value: 7500, max: 7500, color: "#f472b6" }] : []),
  ];

  return (
    <div className="space-y-5 animate-in">
      <Section title="Retirement Planner" sub="FI Gap Analysis" />
      <div className="grid grid-cols-2 gap-2">
        <Inp label="Current age" value={age} onChange={setAge} type="number" />
        <Inp label="Target retirement" value={retireAge} onChange={setRetireAge} type="number" />
        <Inp label="401(k) balance" value={current401k} onChange={setCurrent401k} type="number" pre="$" />
        <Inp label="IRA balance" value={currentIRA} onChange={setCurrentIRA} type="number" pre="$" />
        <Inp label="Taxable investments" value={currentTax} onChange={setCurrentTax} type="number" pre="$" />
        <Inp label="Annual savings" value={annualSave} onChange={setAnnualSave} type="number" pre="$" />
      </div>

      {/* Funded donut */}
      <div className="flex justify-center py-2">
        <Donut value={funded} max={100} size={120} sw={9} color={funded >= 100 ? "#34d399" : funded > 60 ? "#fbbf24" : "#f87171"}>
          <p className="text-2xl font-black" style={{ color: funded >= 100 ? "#34d399" : funded > 60 ? "#fbbf24" : "#f87171" }}>{funded}%</p>
          <p className="text-[7px] text-white/15 uppercase">Funded</p>
        </Donut>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Projected" value={fmt(fv)} color="#34d399" />
        <Stat label="FI target" value={fmt(fiTarget)} color="#60a5fa" />
        <Stat label={gap > 0 ? "Gap" : "Surplus"} value={fmt(Math.abs(gap))} color={gap > 0 ? "#f87171" : "#34d399"} />
      </div>

      {/* Growth projection chart */}
      <Card>
        <p className="text-[9px] text-white/15 uppercase tracking-widest mb-1">Growth Projection to Age {retireAge}</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={projection}>
            <defs>
              <linearGradient id="retG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity={0.3}/><stop offset="100%" stopColor="#34d399" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)"/>
            <XAxis dataKey="age" tick={{ fontSize:9, fill:"rgba(255,255,255,0.2)" }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:9, fill:"rgba(255,255,255,0.2)" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1e6).toFixed(1)}M`}/>
            <Tooltip content={<Tip/>}/>
            <Area type="monotone" dataKey="balance" name="Portfolio" stroke="#34d399" fill="url(#retG)" strokeWidth={2.5} dot={false}/>
            <Area type="monotone" dataKey="target" name="FI Target" stroke="#fbbf24" fill="none" strokeWidth={1.5} strokeDasharray="6 4" dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Contribution limits */}
      <Card>
        <p className="text-[9px] text-white/15 uppercase tracking-widest mb-2">2025 Contribution Limits</p>
        <ResponsiveContainer width="100%" height={contribData.length * 35 + 10}>
          <BarChart data={contribData} layout="vertical" barCategoryGap="20%">
            <XAxis type="number" tick={{ fontSize:8, fill:"rgba(255,255,255,0.2)" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
            <YAxis type="category" dataKey="name" tick={{ fontSize:9, fill:"rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} width={60}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="value" name="Limit" radius={[0,4,4,0]}>{contribData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Monthly retirement income" value={fN(monthlyIncome)} sub="4% withdrawal" color="#a78bfa" />
        <Stat label="Years to retire" value={yearsToRetire} sub={`Age ${retireAge}`} color="#fbbf24" />
      </div>

      {gap > 0 && <Alert type="warn">Gap of {fmt(gap)}. Increase savings by {fN(Math.round(gap / yearsToRetire))}/yr or delay {Math.ceil(gap / (annualSave + totalCurrent * returnRate / 100))} years.</Alert>}
      {gap <= 0 && <Alert type="success">On track. Surplus of {fmt(Math.abs(gap))} at age {retireAge}.</Alert>}
    </div>
  );
}
