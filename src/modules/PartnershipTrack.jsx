import { useState, useMemo } from "react";
import { SPECIALTIES, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Alert, Takeaway } from "../components/ui";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { chartGrid, chartText } from "../lib/chartColors";
const Tip=({active,payload,label})=>{if(!active||!payload?.length)return null;return(<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/50 mb-1">{label}</p>{payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>)};

export default function PartnershipTrack({ profile }) {
  const [buyIn, setBuyIn] = useState(200000);
  const [yearsToPartner, setYearsToPartner] = useState(3);
  const [partnerIncome, setPartnerIncome] = useState(Math.round((profile.salary||300000) * 1.4));
  const [equityGrowth, setEquityGrowth] = useState(5);
  const currentSal = profile.salary || 300000;
  const incomeBoost = partnerIncome - currentSal;

  const projection = useMemo(() => {
    let equity = 0, cumIncome = 0;
    return Array.from({ length: 16 }, (_, yr) => {
      const isPartner = yr >= yearsToPartner;
      const salary = isPartner ? partnerIncome : currentSal;
      equity = isPartner ? (yr === yearsToPartner ? buyIn : equity * (1 + equityGrowth/100)) : 0;
      cumIncome += salary;
      return { year:yr, salary:Math.round(salary/1000), equity:Math.round(equity/1000), cumIncome:Math.round(cumIncome/1000) };
    });
  }, [buyIn, yearsToPartner, partnerIncome, currentSal, equityGrowth]);

  const roi = buyIn > 0 ? Math.round(incomeBoost / buyIn * 100) : 0;
  const payback = incomeBoost > 0 ? (buyIn / incomeBoost).toFixed(1) : "N/A";
  const equity10yr = Math.round(buyIn * Math.pow(1 + equityGrowth/100, 10));

  return (
    <div className="space-y-5 animate-in">
      <Section title="Partnership Track" sub="Buy-In Analysis" />
      <div className="grid grid-cols-2 gap-3">
        <Inp label="Buy-in amount" value={buyIn} onChange={v=>setBuyIn(+v)} type="number" pre="$" />
        <Inp label="Years to partnership" value={yearsToPartner} onChange={v=>setYearsToPartner(+v)} type="number" />
        <Inp label="Partner income" value={partnerIncome} onChange={v=>setPartnerIncome(+v)} type="number" pre="$" />
        <Inp label="Equity growth %/yr" value={equityGrowth} onChange={v=>setEquityGrowth(+v)} type="number" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Stat label="Income boost" value={fmt(incomeBoost)} sub="/yr as partner" color="#34d399" />
        <Stat label="ROI on buy-in" value={`${roi}%`} color={roi>50?"#34d399":"#fbbf24"} />
        <Stat label="Payback" value={`${payback} yr`} color="#60a5fa" />
        <Stat label="Equity at 10yr" value={fmt(equity10yr)} color="#a78bfa" />
      </div>
      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Income & Equity Trajectory</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={projection}>
            <defs>
              <linearGradient id="eqPart" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3}/><stop offset="100%" stopColor="#a78bfa" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid()}/>
            <XAxis dataKey="year" tick={{fontSize:11,fill:chartText()}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:chartText()}} axisLine={false} tickLine={false} unit="K"/>
            <Tooltip content={<Tip/>}/>
            <Area type="monotone" dataKey="salary" name="Salary ($K)" stroke="#34d399" fill="none" strokeWidth={2} dot={false}/>
            <Area type="monotone" dataKey="equity" name="Equity ($K)" stroke="#a78bfa" fill="url(#eqPart)" strokeWidth={2} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <p className="text-sm text-white/55 font-bold mb-2">What to Negotiate</p>
        <div className="space-y-1 text-sm text-white/50">
          {["Buy-in amount and payment terms (lump sum vs installments)","Vesting schedule (what happens if you leave early?)","Governance rights and voting power","Profit-sharing formula (equal split vs productivity-based)","Buy-out provisions and valuation method","Non-compete terms post-departure","Call schedule changes at partnership","Disability/death buy-out provisions"].map((d,i)=>(
            <div key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50"/><span>{d}</span></div>
          ))}
        </div>
      </Card>
      <Takeaway items={[
        `${fmt(buyIn)} buy-in yields ${fmt(incomeBoost)}/yr income boost (${roi}% ROI). Payback: ${payback} years.`,
        `Equity grows to ${fmt(equity10yr)} over 10 years at ${equityGrowth}%/yr. This is on top of higher income.`,
        `Key risks: non-compete if leaving, governance disputes, practice valuation method. Get everything in writing.`,
      ]} />
    </div>
  );
}
