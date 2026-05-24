import { useMemo } from "react";
import { SPECIALTIES, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Takeaway } from "../components/ui";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
const Tip=({active,payload,label})=>{if(!active||!payload?.length)return null;return(<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/50 mb-1">{label}</p>{payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>)};

const LOCUM_RATES = {
  "Cardiology":{daily:2800,weekly:14000},"Orthopedic Surgery":{daily:2500,weekly:12500},"Radiology":{daily:2200,weekly:11000},
  "General Surgery":{daily:2400,weekly:12000},"Anesthesiology":{daily:2600,weekly:13000},"Emergency Medicine":{daily:2000,weekly:10000},
  "Internal Medicine":{daily:1500,weekly:7500},"Family Medicine":{daily:1400,weekly:7000},"Psychiatry":{daily:2800,weekly:14000},
  "Dermatology":{daily:2200,weekly:11000},"Neurology":{daily:1800,weekly:9000},"Oncology":{daily:2000,weekly:10000},
  "Urology":{daily:2200,weekly:11000},"Gastroenterology":{daily:2400,weekly:12000},"Pulmonology":{daily:1800,weekly:9000},
  "Endocrinology":{daily:1600,weekly:8000},"Rheumatology":{daily:1700,weekly:8500},"Nephrology":{daily:1800,weekly:9000},
  "Ophthalmology":{daily:2000,weekly:10000},"Pediatrics":{daily:1400,weekly:7000},
};

export default function LocumRates({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const rates = LOCUM_RATES[profile.specialty] || { daily: 2000, weekly: 10000 };
  const annualLocum = rates.weekly * 46; // 46 working weeks
  const vsEmployed = annualLocum - spec.m;
  const chartData = useMemo(() => Object.entries(LOCUM_RATES).sort((a,b)=>b[1].daily-a[1].daily).slice(0,12).map(([k,v])=>({
    name:k.length>12?k.slice(0,11)+".":k, value:v.daily, yours:k===profile.specialty
  })), [profile.specialty]);

  return (
    <div className="space-y-5 animate-in">
      <Section title="Locum Tenens Rates" sub="What to Charge" />
      <div className="grid grid-cols-4 gap-2">
        <Stat label="Daily rate" value={`$${rates.daily.toLocaleString()}`} sub={profile.specialty} color="#34d399" />
        <Stat label="Weekly rate" value={`$${rates.weekly.toLocaleString()}`} color="#60a5fa" />
        <Stat label="Annual (46wk)" value={fmt(annualLocum)} color="#a78bfa" />
        <Stat label="vs employed" value={`${vsEmployed>0?"+":""}${fN(vsEmployed)}`} color={vsEmployed>0?"#34d399":"#f87171"} />
      </div>
      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Daily Rates by Specialty</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" barCategoryGap="8%">
            <XAxis type="number" tick={{fontSize:10,fill:"rgba(255,255,255,0.45)"}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v.toLocaleString()}`}/>
            <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:"rgba(255,255,255,0.5)"}} axisLine={false} tickLine={false} width={90}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="value" name="Daily Rate" radius={[0,4,4,0]}>{chartData.map((d,i)=><Cell key={i} fill={d.yours?"#34d399":"rgba(255,255,255,0.06)"}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <p className="text-sm text-white/55 font-bold mb-2">Tax Deductions for Locums</p>
        <div className="space-y-1 text-sm text-white/50">
          {["Travel expenses (flights, mileage at $0.67/mi)","Lodging (hotel or furnished apartment)","Meals (50% deductible while traveling)","Licensing fees for additional states","CME costs while on assignment","Professional liability (tail coverage)","Home office if managing assignments remotely"].map((d,i)=>(
            <div key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50"/><span>{d}</span></div>
          ))}
        </div>
      </Card>
      <Takeaway items={[
        `${profile.specialty} locum rate: $${rates.daily.toLocaleString()}/day, $${rates.weekly.toLocaleString()}/week. Annual potential: ${fmt(annualLocum)} (46 weeks).`,
        vsEmployed > 0 ? `That's ${fmt(vsEmployed)} more than employed median. But no benefits, retirement match, or stability.` : `Employed pays ${fmt(Math.abs(vsEmployed))} more. Locums makes sense for flexibility, not income.`,
        `Locum income is 1099. Budget 30-40% for taxes. Deduct travel, lodging, meals, and licensing fees.`,
      ]} />
    </div>
  );
}
