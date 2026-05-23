import { useState, useMemo } from "react";
import { SPECIALTIES, fmt, fN } from "../lib/data";
import { Section, Stat, Inp, Alert, Card } from "../components/ui";
import { BarChart, Bar, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-[9px] text-white/30 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-[11px] font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>);
};

const CARRIERS = [
  { name:"Guardian", per100k:180, wait:90, max:15000, ownOcc:true, color:"#34d399" },
  { name:"MassMutual", per100k:195, wait:90, max:20000, ownOcc:true, color:"#60a5fa" },
  { name:"Northwestern", per100k:170, wait:90, max:15000, ownOcc:true, color:"#a78bfa" },
  { name:"Principal", per100k:160, wait:90, max:12000, ownOcc:false, color:"#fbbf24" },
  { name:"Standard", per100k:150, wait:180, max:10000, ownOcc:false, color:"#f472b6" },
];

export default function DisabilitySim({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [salary, setSalary] = useState(profile.salary || spec.m);
  const [expenses, setExpenses] = useState(Math.round((profile.salary || spec.m) * 0.6));
  const [savings, setSavings] = useState(profile.savings || 50000);
  const [coverage, setCoverage] = useState(0);

  const monthlyNeed = Math.round(expenses / 12);
  const monthlyGap = monthlyNeed - coverage;
  const runway = monthlyGap > 0 ? Math.round(savings / monthlyGap) : 999;

  // Runway depletion chart
  const runwayData = useMemo(() => {
    let bal = savings;
    return Array.from({ length: Math.min(37, runway + 6) }, (_, i) => {
      const d = { month: i, savings: Math.max(0, Math.round(bal)), zero: 0 };
      bal -= monthlyGap;
      return d;
    });
  }, [savings, monthlyGap, runway]);

  // Carrier comparison
  const carrierData = CARRIERS.map(c => ({
    name: c.name, premium: Math.round(salary / 100000 * c.per100k), color: c.color,
    ownOcc: c.ownOcc, max: c.max, wait: c.wait,
  }));

  return (
    <div className="space-y-5 animate-in">
      <Section title="Disability Simulator" sub="Income Protection" />
      <div className="grid grid-cols-2 gap-2">
        <Inp label="Annual salary" value={salary} onChange={setSalary} type="number" pre="$" />
        <Inp label="Annual expenses" value={expenses} onChange={setExpenses} type="number" pre="$" />
        <Inp label="Liquid savings" value={savings} onChange={setSavings} type="number" pre="$" />
        <Inp label="Current DI coverage/mo" value={coverage} onChange={setCoverage} type="number" pre="$" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Monthly gap" value={fN(monthlyGap)} color={monthlyGap > 0 ? "#f87171" : "#34d399"} />
        <Stat label="Runway" value={`${Math.min(runway, 999)} mo`} color={runway < 6 ? "#f87171" : runway < 12 ? "#fbbf24" : "#34d399"} />
        <Stat label="Recommended DI" value={fN(monthlyNeed)} sub="/month" color="#60a5fa" />
      </div>

      {/* Savings depletion chart */}
      {monthlyGap > 0 && (
        <Card>
          <p className="text-[9px] text-white/15 uppercase tracking-widest mb-1">Savings Depletion Without DI</p>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={runwayData}>
              <defs>
                <linearGradient id="depG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f87171" stopOpacity={0.3}/><stop offset="100%" stopColor="#f87171" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)"/>
              <XAxis dataKey="month" tick={{ fontSize:8, fill:"rgba(255,255,255,0.2)" }} axisLine={false} tickLine={false} label={{ value:"Months", position:"insideBottom", offset:-5, fontSize:8, fill:"rgba(255,255,255,0.15)" }}/>
              <YAxis tick={{ fontSize:8, fill:"rgba(255,255,255,0.2)" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
              <Tooltip content={<Tip/>}/>
              <Area type="monotone" dataKey="savings" name="Savings" stroke="#f87171" fill="url(#depG)" strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Carrier comparison */}
      <Card>
        <p className="text-[9px] text-white/15 uppercase tracking-widest mb-1">Carrier Premiums (Monthly)</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={carrierData} barCategoryGap="20%">
            <XAxis dataKey="name" tick={{ fontSize:8, fill:"rgba(255,255,255,0.25)" }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:8, fill:"rgba(255,255,255,0.2)" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="premium" name="Premium" radius={[4,4,0,0]}>{carrierData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 space-y-1">
          {carrierData.map((c,i) => (
            <div key={i} className="flex items-center justify-between text-[8px]">
              <span className="text-white/25">{c.name}</span>
              <span className="text-white/15">{c.wait}d wait | Max {fN(c.max)}/mo | {c.ownOcc ? <span className="text-emerald-400/50">Own-occ</span> : <span className="text-white/15">Any-occ</span>}</span>
            </div>
          ))}
        </div>
      </Card>

      {monthlyGap > 0 && <Alert type="warn">Without DI, savings run out in {runway} months. {spec.burn > 40 ? `${profile.specialty} has ${spec.burn}% burnout rate.` : ""}</Alert>}
      {monthlyGap <= 0 && <Alert type="success">Current coverage meets your monthly needs. Review annually.</Alert>}
    </div>
  );
}
