import { useState, useMemo } from "react";
import { SPECIALTIES, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Alert, Takeaway } from "../components/ui";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { chartText } from "../lib/chartColors";
const Tip=({active,payload,label})=>{if(!active||!payload?.length)return null;return(<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/50 mb-1">{label}</p>{payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: {p.value}</p>)}</div>)};

// MGMA 2025 median wRVUs by specialty
const WRVU_DATA = {
  "Cardiology":{median:8200,p75:10500,rate:55},"Orthopedic Surgery":{median:9800,p75:12000,rate:52},
  "Radiology":{median:9500,p75:12000,rate:38},"General Surgery":{median:7200,p75:9000,rate:50},
  "Anesthesiology":{median:0,p75:0,rate:0},"Emergency Medicine":{median:0,p75:0,rate:0},
  "Internal Medicine":{median:5200,p75:6500,rate:48},"Family Medicine":{median:5800,p75:7200,rate:42},
  "Psychiatry":{median:4500,p75:6000,rate:55},"Dermatology":{median:7500,p75:9500,rate:62},
  "Neurology":{median:5800,p75:7500,rate:50},"Oncology":{median:7000,p75:9000,rate:52},
  "Urology":{median:8500,p75:10500,rate:48},"Gastroenterology":{median:8800,p75:11000,rate:50},
  "Pulmonology":{median:6200,p75:8000,rate:46},"Endocrinology":{median:4800,p75:6200,rate:48},
  "Rheumatology":{median:5000,p75:6500,rate:46},"Nephrology":{median:5500,p75:7000,rate:45},
  "Ophthalmology":{median:7200,p75:9500,rate:55},"Pediatrics":{median:5600,p75:7000,rate:40},
};

export default function RVUCalculator({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const rvuData = WRVU_DATA[profile.specialty] || { median:6000, p75:8000, rate:48 };
  const [myWRVUs, setMyWRVUs] = useState(rvuData.median);
  const [myRate, setMyRate] = useState(rvuData.rate);
  const [baseSalary, setBaseSalary] = useState(Math.round((profile.salary||spec.m) * 0.7));
  const [threshold, setThreshold] = useState(rvuData.median * 0.9);

  const bonusRVUs = Math.max(0, myWRVUs - threshold);
  const rvuBonus = bonusRVUs * myRate;
  const totalComp = baseSalary + rvuBonus;
  const effectiveRate = myWRVUs > 0 ? Math.round(totalComp / myWRVUs) : 0;
  const vsMedian = myWRVUs - rvuData.median;

  // What-if: more RVUs
  const scenarios = [
    { label:"Current", wrvus:myWRVUs },
    { label:"+500 RVUs", wrvus:myWRVUs+500 },
    { label:"+1000 RVUs", wrvus:myWRVUs+1000 },
    { label:"75th pctl", wrvus:rvuData.p75 },
  ].map(s => ({ ...s, bonus: Math.max(0, s.wrvus - threshold) * myRate, total: Math.round((baseSalary + Math.max(0, s.wrvus - threshold) * myRate)/1000) }));

  return (
    <div className="space-y-5 animate-in">
      <Section title="RVU Calculator" sub="Productivity & Compensation" />
      {rvuData.median === 0 && <Alert type="info">{profile.specialty} typically uses shift-based or hourly compensation, not wRVUs.</Alert>}
      <div className="grid grid-cols-2 gap-3">
        <Inp label="My annual wRVUs" value={myWRVUs} onChange={v=>setMyWRVUs(+v)} type="number" />
        <Inp label="$/wRVU rate" value={myRate} onChange={v=>setMyRate(+v)} type="number" pre="$" />
        <Inp label="Base salary" value={baseSalary} onChange={v=>setBaseSalary(+v)} type="number" pre="$" />
        <Inp label="Bonus threshold (wRVUs)" value={threshold} onChange={v=>setThreshold(+v)} type="number" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Stat label="RVU bonus" value={fN(rvuBonus)} color="#34d399" />
        <Stat label="Total comp" value={fmt(totalComp)} color="#60a5fa" />
        <Stat label="Effective $/RVU" value={`$${effectiveRate}`} color="#a78bfa" />
        <Stat label="vs median" value={`${vsMedian>=0?"+":""}${vsMedian.toLocaleString()}`} color={vsMedian>=0?"#34d399":"#f87171"} />
      </div>

      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">What-If Scenarios (Total Comp $K)</p>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={scenarios} barCategoryGap="20%">
            <XAxis dataKey="label" tick={{fontSize:11,fill:chartText()}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:chartText()}} axisLine={false} tickLine={false} unit="K"/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="total" name="Total ($K)" radius={[4,4,0,0]}>{scenarios.map((d,i)=><Cell key={i} fill={i===0?"#60a5fa":"#34d399"}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <p className="text-sm text-white/55 font-bold mb-2">{profile.specialty} Benchmarks (MGMA 2025)</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between py-1"><span className="text-white/50">Median wRVUs</span><span className="text-white/65">{rvuData.median.toLocaleString()}</span></div>
          <div className="flex justify-between py-1"><span className="text-white/50">75th percentile</span><span className="text-white/65">{rvuData.p75.toLocaleString()}</span></div>
          <div className="flex justify-between py-1"><span className="text-white/50">Median $/wRVU</span><span className="text-white/65">${rvuData.rate}</span></div>
        </div>
      </Card>

      <Takeaway items={[
        `At ${myWRVUs.toLocaleString()} wRVUs and $${myRate}/RVU, your bonus is ${fN(rvuBonus)}. Total comp: ${fmt(totalComp)}.`,
        `${vsMedian >= 0 ? `You're ${vsMedian.toLocaleString()} wRVUs above median.` : `${Math.abs(vsMedian).toLocaleString()} below median. Adding 500 RVUs = +${fN(500*myRate)}/yr.`}`,
        `Effective rate (total comp / wRVUs) of $${effectiveRate} ${effectiveRate > rvuData.rate ? "exceeds" : "is below"} the $${rvuData.rate} benchmark. ${effectiveRate < rvuData.rate ? "Negotiate a higher conversion rate." : ""}`,
      ]} />
    </div>
  );
}
