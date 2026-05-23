import { useState, useMemo } from "react";
import { SPECIALTIES, STATE_TAX, fedTax, fica, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Alert } from "../components/ui";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl">
    <p className="text-[9px] text-white/30 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-[11px] font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}
  </div>);
};

const RULES = [
  { name:"Housing 28% rule", pct:0.28, desc:"Housing under 28% of gross", idx:0 },
  { name:"Total debt 36% rule", pct:0.36, desc:"All debt under 36% of gross", idx:1 },
  { name:"Savings 20% rule", pct:0.20, desc:"Save at least 20% of gross", idx:2 },
];

export default function Spending({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const sal = profile.salary || spec.m;
  const state = profile.state || "NY";
  const totalTax = fedTax(sal, profile.married) + Math.round(sal * (STATE_TAX[state] || 0)) + Math.round(fica(sal));
  const takeHome = sal - totalTax;
  const monthly = Math.round(takeHome / 12);

  const [housing, setHousing] = useState(Math.round(sal * 0.25 / 12));
  const [loanPmt, setLoanPmt] = useState(profile.loans > 0 ? Math.round(profile.loans * 0.068 / 12 + profile.loans / 120) : 0);
  const [food, setFood] = useState(Math.round(monthly * 0.12));
  const [transport, setTransport] = useState(Math.round(monthly * 0.08));
  const [insurance, setInsurance] = useState(Math.round(monthly * 0.05));
  const [other, setOther] = useState(Math.round(monthly * 0.1));

  const totalSpend = housing + loanPmt + food + transport + insurance + other;
  const surplus = monthly - totalSpend;
  const savingsAmt = Math.max(0, surplus);

  const pieData = useMemo(() => [
    { name:"Housing", value:housing, color:"#60a5fa" },
    { name:"Loans", value:loanPmt, color:"#f87171" },
    { name:"Food", value:food, color:"#fbbf24" },
    { name:"Transport", value:transport, color:"#a78bfa" },
    { name:"Insurance", value:insurance, color:"#f472b6" },
    { name:"Other", value:other, color:"#818cf8" },
    { name:"Savings", value:savingsAmt, color:"#34d399" },
  ].filter(d => d.value > 0), [housing, loanPmt, food, transport, insurance, other, savingsAmt]);

  const taxBreakdown = useMemo(() => {
    const f = fedTax(sal, profile.married); const s = Math.round(sal * (STATE_TAX[state] || 0)); const fc = Math.round(fica(sal));
    return [{ name:"Federal", value:Math.round(f/12), color:"#f87171" },{ name:"State", value:Math.round(s/12), color:"#fbbf24" },{ name:"FICA", value:Math.round(fc/12), color:"#60a5fa" }];
  }, [sal, state, profile.married]);

  const ruleResults = RULES.map(r => {
    const limit = Math.round(sal * r.pct / 12);
    const actual = r.idx === 0 ? housing : r.idx === 1 ? housing + loanPmt : savingsAmt;
    const pass = r.idx === 2 ? actual >= limit : actual <= limit;
    return { ...r, limit, actual, pass };
  });

  return (
    <div className="space-y-5 animate-in">
      <Section title="Spending Analysis" sub="Monthly Budget Breakdown" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Gross monthly" value={fN(Math.round(sal/12))} color="#60a5fa" />
        <Stat label="Tax monthly" value={fN(Math.round(totalTax/12))} sub={`${((totalTax/sal)*100).toFixed(0)}%`} color="#f87171" />
        <Stat label="Take-home" value={fN(monthly)} color="#34d399" />
      </div>

      {/* Budget inputs */}
      <Card>
        <p className="text-[9px] text-white/15 uppercase tracking-widest mb-3">Monthly Expenses</p>
        <div className="grid grid-cols-2 gap-2">
          <Inp label="Housing" value={housing} onChange={setHousing} type="number" pre="$" />
          <Inp label="Loan payments" value={loanPmt} onChange={setLoanPmt} type="number" pre="$" />
          <Inp label="Food & dining" value={food} onChange={setFood} type="number" pre="$" />
          <Inp label="Transportation" value={transport} onChange={setTransport} type="number" pre="$" />
          <Inp label="Insurance" value={insurance} onChange={setInsurance} type="number" pre="$" />
          <Inp label="Other" value={other} onChange={setOther} type="number" pre="$" />
        </div>
        <div className="mt-3 flex justify-between border-t border-white/[0.05] pt-2">
          <span className="text-[10px] text-white/30">Monthly surplus</span>
          <span className={`text-lg font-black tabular-nums ${surplus >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fN(surplus)}</span>
        </div>
      </Card>

      {/* Spending pie chart */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-[9px] text-white/15 uppercase tracking-widest mb-1">Budget Allocation</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none" animationDuration={800}>
                {pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip content={<Tip/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-2 gap-y-1 justify-center">
            {pieData.map((d,i)=>(
              <div key={i} className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{background:d.color}}/><span className="text-[7px] text-white/20">{d.name}</span></div>
            ))}
          </div>
        </Card>

        {/* Tax breakdown bar */}
        <Card>
          <p className="text-[9px] text-white/15 uppercase tracking-widest mb-1">Monthly Tax Breakdown</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={taxBreakdown} barCategoryGap="25%">
              <XAxis dataKey="name" tick={{ fontSize:9, fill:"rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:8, fill:"rgba(255,255,255,0.2)" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(1)}K`}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="value" name="Tax" radius={[4,4,0,0]}>{taxBreakdown.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[8px] text-white/10 text-center mt-1">Total: {fN(Math.round(totalTax/12))}/mo</p>
        </Card>
      </div>

      {/* Financial rules */}
      <Card>
        <p className="text-[9px] text-white/15 uppercase tracking-widest mb-2">Financial Rules Check</p>
        <div className="space-y-3">
          {ruleResults.map((r, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-[10px] text-white/50 font-medium">{r.name}</p>
                  <p className="text-[8px] text-white/15">{r.desc}</p>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${r.pass ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {r.pass ? "PASS" : "FAIL"}
                </span>
              </div>
              <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{
                  width: `${Math.min(100, (r.actual / r.limit) * 100)}%`,
                  background: r.pass ? "#34d399" : "#f87171",
                }} />
              </div>
              <div className="flex justify-between text-[7px] text-white/10 mt-0.5">
                <span>Actual: {fN(r.actual)}</span>
                <span>Limit: {fN(r.limit)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {surplus < 0 && <Alert type="danger">Spending exceeds take-home by {fN(Math.abs(surplus))}/mo. Review housing or loan strategy.</Alert>}
      {surplus > 0 && surplus < monthly * 0.15 && <Alert type="warn">Savings rate below 15%. Target {fN(Math.round(monthly * 0.2))} monthly savings.</Alert>}
      {surplus >= monthly * 0.2 && <Alert type="success">Strong savings rate of {Math.round(surplus/monthly*100)}%. Consider maximizing tax-advantaged accounts.</Alert>}
    </div>
  );
}
