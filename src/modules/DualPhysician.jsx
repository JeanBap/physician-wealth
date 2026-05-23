import { useState, useMemo } from "react";
import { SPECIALTIES, fedTax, fica, STATE_TAX, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Alert } from "../components/ui";
import { BarChart, Bar, Cell, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-[9px] text-white/30 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-[11px] font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>);
};

export default function DualPhysician({ profile }) {
  const specA = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [salA, setSalA] = useState(profile.salary || specA.m);
  const [specBKey, setSpecBKey] = useState(profile.spouseSpecialty || "Internal Medicine");
  const specB = SPECIALTIES[specBKey] || SPECIALTIES["Internal Medicine"];
  const [salB, setSalB] = useState(profile.spouseSalary || specB.m);
  const [loansA, setLoansA] = useState(profile.loans || 250000);
  const [loansB, setLoansB] = useState(200000);
  const state = profile.state || "NY";
  const stateRate = STATE_TAX[state] || 0;

  const combined = salA + salB;
  const marriedTax = fedTax(combined, true) + combined * stateRate + fica(salA) + fica(salB);
  const singleTax = fedTax(salA, false) + salA * stateRate + fica(salA) + fedTax(salB, false) + salB * stateRate + fica(salB);
  const penalty = marriedTax - singleTax;

  const max401k = 23500 * 2;
  const maxHSA = 8300;
  const maxRoth = 14000;
  const maxDefer = max401k + maxRoth + maxHSA;

  const pslfA = loansA > 0 ? Math.round((salA * 0.1 - 22790) / 12 * 120) : 0;
  const pslfB = loansB > 0 ? Math.round((salB * 0.1 - 22790) / 12 * 120) : 0;

  const incomeData = [
    { name: "Physician A", value: Math.round(salA/1000), color: "#34d399" },
    { name: "Physician B", value: Math.round(salB/1000), color: "#60a5fa" },
  ];

  const shelterData = [
    { name: "Dual 401(k)", value: max401k, color: "#34d399" },
    { name: "Roth IRAs", value: maxRoth, color: "#a78bfa" },
    { name: "HSA Family", value: maxHSA, color: "#fbbf24" },
  ];

  return (
    <div className="space-y-5 animate-in">
      <Section title="Dual-Physician Household" sub="Combined Optimization" />

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2 p-3 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10">
          <p className="text-[9px] text-emerald-400/50 uppercase font-bold">Physician A</p>
          <Inp label="Salary" value={salA} onChange={setSalA} type="number" pre="$" />
          <Inp label="Loans" value={loansA} onChange={setLoansA} type="number" pre="$" />
          <p className="text-[8px] text-white/15">{profile.specialty}</p>
        </div>
        <div className="space-y-2 p-3 rounded-xl bg-blue-500/[0.03] border border-blue-500/10">
          <p className="text-[9px] text-blue-400/50 uppercase font-bold">Physician B</p>
          <Inp label="Salary" value={salB} onChange={setSalB} type="number" pre="$" />
          <Inp label="Loans" value={loansB} onChange={setLoansB} type="number" pre="$" />
          <Inp label="Specialty" value={specBKey} onChange={setSpecBKey}
            options={Object.keys(SPECIALTIES).map(s => ({ v:s, l:s }))} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Combined" value={fmt(combined)} color="#34d399" />
        <Stat label="Marriage penalty" value={fmt(Math.abs(penalty))} sub={penalty > 0 ? "Pay more" : "Save jointly"} color={penalty > 0 ? "#f87171" : "#34d399"} />
        <Stat label="Combined loans" value={fmt(loansA + loansB)} color="#fbbf24" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Income split */}
        <Card>
          <p className="text-[9px] text-white/15 uppercase tracking-widest mb-1">Income Split ($K)</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={incomeData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={4} dataKey="value" stroke="none">
                {incomeData.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip content={<Tip/>}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>
        {/* Tax sheltering */}
        <Card>
          <p className="text-[9px] text-white/15 uppercase tracking-widest mb-1">Annual Sheltering</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={shelterData} barCategoryGap="20%">
              <XAxis dataKey="name" tick={{ fontSize:8, fill:"rgba(255,255,255,0.25)" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:8, fill:"rgba(255,255,255,0.2)" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
              <Bar dataKey="value" name="Max" radius={[4,4,0,0]}>{shelterData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-center text-xs font-bold text-emerald-400 mt-1">Total: {fN(maxDefer)}/yr</p>
        </Card>
      </div>

      {(loansA > 0 || loansB > 0) && (
        <Card>
          <p className="text-[9px] text-white/15 uppercase tracking-widest mb-2">PSLF Strategy (File Separately)</p>
          <div className="space-y-1.5 text-[10px]">
            {loansA > 0 && <div className="flex justify-between"><span className="text-white/25">A: 10yr payment</span><span className="text-emerald-400">{fN(pslfA)} | Forgiven: {fmt(loansA - pslfA)}</span></div>}
            {loansB > 0 && <div className="flex justify-between"><span className="text-white/25">B: 10yr payment</span><span className="text-emerald-400">{fN(pslfB)} | Forgiven: {fmt(loansB - pslfB)}</span></div>}
          </div>
          <p className="text-[8px] text-white/10 mt-2">Filing MFS lowers PSLF payments but may increase tax. Run both scenarios.</p>
        </Card>
      )}

      {penalty > 5000 && <Alert type="warn">Marriage penalty of {fN(penalty)}. Consider MFS if pursuing PSLF.</Alert>}
    </div>
  );
}
