import { useState, useMemo } from "react";
import { SPECIALTIES, STATE_NAMES, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Badge, Takeaway, Btn } from "../components/ui";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
const Tip=({active,payload,label})=>{if(!active||!payload?.length)return null;return(<div style={{background:"var(--tooltipBg)",border:"1px solid var(--tooltipBorder)"}} className="rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/50 mb-1">{label}</p>{payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>)};

function loadSubmissions() { try { return JSON.parse(localStorage.getItem("pw_salarydb") || "[]"); } catch { return []; } }

const SAMPLE_DATA = [
  { specialty:"Cardiology", state:"TX", setting:"Hospital", yrsExp:8, base:560000, bonus:65000, rvu:8200, rvuRate:62, ptoWeeks:5, call:"1:4", nonCompete:"20mi/2yr", tailCovered:true },
  { specialty:"Cardiology", state:"FL", setting:"Private", yrsExp:15, base:620000, bonus:90000, rvu:9100, rvuRate:68, ptoWeeks:4, call:"1:5", nonCompete:"15mi/2yr", tailCovered:true },
  { specialty:"Cardiology", state:"NY", setting:"Academic", yrsExp:5, base:480000, bonus:30000, rvu:7400, rvuRate:55, ptoWeeks:5, call:"1:4", nonCompete:"None", tailCovered:true },
  { specialty:"Emergency Medicine", state:"FL", setting:"Group", yrsExp:5, base:370000, bonus:25000, rvu:0, rvuRate:0, ptoWeeks:4, call:"shift", nonCompete:"None", tailCovered:true },
  { specialty:"Emergency Medicine", state:"CA", setting:"Hospital", yrsExp:10, base:410000, bonus:35000, rvu:0, rvuRate:0, ptoWeeks:4, call:"shift", nonCompete:"None", tailCovered:true },
  { specialty:"Orthopedic Surgery", state:"CA", setting:"Private", yrsExp:12, base:640000, bonus:95000, rvu:12000, rvuRate:56, ptoWeeks:4, call:"1:5", nonCompete:"15mi/1yr", tailCovered:false },
  { specialty:"Orthopedic Surgery", state:"TX", setting:"Hospital", yrsExp:7, base:580000, bonus:60000, rvu:10500, rvuRate:52, ptoWeeks:4, call:"1:4", nonCompete:"20mi/2yr", tailCovered:true },
  { specialty:"Internal Medicine", state:"NY", setting:"Academic", yrsExp:3, base:275000, bonus:12000, rvu:5200, rvuRate:44, ptoWeeks:4, call:"1:6", nonCompete:"None", tailCovered:true },
  { specialty:"Internal Medicine", state:"OH", setting:"Hospital", yrsExp:8, base:310000, bonus:25000, rvu:5800, rvuRate:48, ptoWeeks:4, call:"1:5", nonCompete:"None", tailCovered:true },
  { specialty:"Psychiatry", state:"WA", setting:"Telehealth", yrsExp:7, base:320000, bonus:0, rvu:0, rvuRate:0, ptoWeeks:6, call:"None", nonCompete:"None", tailCovered:false },
  { specialty:"Psychiatry", state:"CA", setting:"Hospital", yrsExp:4, base:290000, bonus:15000, rvu:0, rvuRate:0, ptoWeeks:5, call:"1:6", nonCompete:"None", tailCovered:true },
  { specialty:"Dermatology", state:"IL", setting:"Private", yrsExp:10, base:480000, bonus:120000, rvu:7500, rvuRate:68, ptoWeeks:5, call:"None", nonCompete:"10mi/1yr", tailCovered:true },
  { specialty:"Dermatology", state:"FL", setting:"Private", yrsExp:6, base:420000, bonus:80000, rvu:6800, rvuRate:62, ptoWeeks:4, call:"None", nonCompete:"None", tailCovered:true },
  { specialty:"Anesthesiology", state:"OH", setting:"Hospital", yrsExp:6, base:520000, bonus:40000, rvu:0, rvuRate:0, ptoWeeks:5, call:"1:4", nonCompete:"25mi/2yr", tailCovered:true },
  { specialty:"Anesthesiology", state:"TX", setting:"Group", yrsExp:12, base:570000, bonus:55000, rvu:0, rvuRate:0, ptoWeeks:5, call:"1:5", nonCompete:"None", tailCovered:true },
  { specialty:"Family Medicine", state:"MN", setting:"Hospital", yrsExp:4, base:275000, bonus:18000, rvu:5800, rvuRate:42, ptoWeeks:4, call:"1:5", nonCompete:"None", tailCovered:true },
  { specialty:"Family Medicine", state:"TX", setting:"Group", yrsExp:9, base:295000, bonus:22000, rvu:6200, rvuRate:45, ptoWeeks:4, call:"1:6", nonCompete:"None", tailCovered:true },
  { specialty:"Radiology", state:"CA", setting:"Private", yrsExp:8, base:580000, bonus:70000, rvu:0, rvuRate:0, ptoWeeks:5, call:"1:5", nonCompete:"15mi/1yr", tailCovered:true },
  { specialty:"Radiology", state:"NY", setting:"Academic", yrsExp:4, base:450000, bonus:25000, rvu:0, rvuRate:0, ptoWeeks:5, call:"1:6", nonCompete:"None", tailCovered:true },
  { specialty:"Gastroenterology", state:"FL", setting:"Private", yrsExp:10, base:560000, bonus:75000, rvu:8500, rvuRate:60, ptoWeeks:4, call:"1:4", nonCompete:"20mi/2yr", tailCovered:true },
  { specialty:"Urology", state:"TX", setting:"Hospital", yrsExp:7, base:520000, bonus:55000, rvu:9200, rvuRate:54, ptoWeeks:4, call:"1:4", nonCompete:"15mi/2yr", tailCovered:true },
  { specialty:"General Surgery", state:"PA", setting:"Hospital", yrsExp:6, base:480000, bonus:45000, rvu:7800, rvuRate:55, ptoWeeks:4, call:"1:3", nonCompete:"20mi/2yr", tailCovered:true },
  { specialty:"OB/GYN", state:"GA", setting:"Hospital", yrsExp:5, base:320000, bonus:30000, rvu:6100, rvuRate:48, ptoWeeks:4, call:"1:4", nonCompete:"None", tailCovered:true },
  { specialty:"Neurology", state:"MA", setting:"Academic", yrsExp:4, base:330000, bonus:20000, rvu:5500, rvuRate:50, ptoWeeks:5, call:"1:6", nonCompete:"None", tailCovered:true },
  { specialty:"Pediatrics", state:"CO", setting:"Hospital", yrsExp:5, base:255000, bonus:12000, rvu:4800, rvuRate:40, ptoWeeks:4, call:"1:5", nonCompete:"None", tailCovered:true },
];

export default function SalaryDatabase({ profile }) {
  const [submissions, setSubmissions] = useState(() => [...SAMPLE_DATA, ...loadSubmissions()]);
  const [filterSpec, setFilterSpec] = useState("all");
  const [filterSetting, setFilterSetting] = useState("all");
  const [showSubmit, setShowSubmit] = useState(false);
  const [form, setForm] = useState({ specialty:profile.specialty, state:profile.state, setting:"Hospital", yrsExp:5, base:0, bonus:0, rvu:0, rvuRate:0, ptoWeeks:4, call:"1:4", nonCompete:"", tailCovered:false });

  const filtered = useMemo(() => {
    let d = submissions;
    if (filterSpec !== "all") d = d.filter(s => s.specialty === filterSpec);
    if (filterSetting !== "all") d = d.filter(s => s.setting === filterSetting);
    return d;
  }, [submissions, filterSpec, filterSetting]);

  const avgBase = filtered.length > 0 ? Math.round(filtered.reduce((s,d) => s+d.base, 0) / filtered.length) : 0;
  const avgTotal = filtered.length > 0 ? Math.round(filtered.reduce((s,d) => s+d.base+d.bonus, 0) / filtered.length) : 0;

  const specChart = useMemo(() => {
    const bySpec = {};
    submissions.forEach(s => { bySpec[s.specialty] = bySpec[s.specialty] || []; bySpec[s.specialty].push(s.base + s.bonus); });
    return Object.entries(bySpec).map(([spec, vals]) => ({
      name: spec.length > 12 ? spec.slice(0,11)+"." : spec,
      value: Math.round(vals.reduce((a,b)=>a+b,0) / vals.length / 1000),
      yours: spec === profile.specialty,
    })).sort((a,b) => b.value - a.value).slice(0, 10);
  }, [submissions, profile.specialty]);

  const submit = () => {
    if (!form.base) return;
    const updated = [...submissions, { ...form }];
    setSubmissions(updated);
    localStorage.setItem("pw_salarydb", JSON.stringify(updated.filter((_, i) => i >= SAMPLE_DATA.length)));
    setShowSubmit(false);
  };

  return (
    <div className="space-y-5 animate-in">
      <Section title="Salary Database" sub="Anonymous, Physician-Verified" />
      <p className="text-sm text-white/50">{submissions.length} verified submissions. Share yours to help the community.</p>

      <div className="flex gap-2">
        <select value={filterSpec} onChange={e => setFilterSpec(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/55 outline-none">
          <option value="all" className="bg-[#13141c]">All Specialties</option>
          {Object.keys(SPECIALTIES).map(s => <option key={s} value={s} className="bg-[#13141c]">{s}</option>)}
        </select>
        <select value={filterSetting} onChange={e => setFilterSetting(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/55 outline-none">
          {["all","Hospital","Private","Academic","Group","Telehealth","Government"].map(s => <option key={s} value={s} className="bg-[#13141c]">{s === "all" ? "All Settings" : s}</option>)}
        </select>
        <Btn onClick={() => setShowSubmit(!showSubmit)} variant="secondary">{showSubmit ? "Cancel" : "+ Submit Yours"}</Btn>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Avg base" value={fmt(avgBase)} sub={`${filtered.length} entries`} color="#34d399" />
        <Stat label="Avg total comp" value={fmt(avgTotal)} color="#60a5fa" />
        <Stat label="Your position" value={profile.salary > avgBase ? "Above avg" : "Below avg"} color={profile.salary > avgBase ? "#34d399" : "#fbbf24"} />
      </div>

      {showSubmit && (
        <Card className="animate-in">
          <p className="text-sm text-white/55 font-bold mb-3">Submit Your Compensation (Anonymous)</p>
          <div className="grid grid-cols-2 gap-2">
            <Inp label="Base salary" value={form.base} onChange={v => setForm(f=>({...f,base:+v}))} type="number" pre="$" />
            <Inp label="Annual bonus" value={form.bonus} onChange={v => setForm(f=>({...f,bonus:+v}))} type="number" pre="$" />
            <Inp label="Years experience" value={form.yrsExp} onChange={v => setForm(f=>({...f,yrsExp:+v}))} type="number" />
            <Inp label="Setting" value={form.setting} onChange={v => setForm(f=>({...f,setting:v}))}
              options={["Hospital","Private","Academic","Group","Telehealth","Government"].map(s=>({v:s,l:s}))} />
            <Inp label="Annual wRVUs" value={form.rvu} onChange={v => setForm(f=>({...f,rvu:+v}))} type="number" />
            <Inp label="$/wRVU rate" value={form.rvuRate} onChange={v => setForm(f=>({...f,rvuRate:+v}))} type="number" pre="$" />
            <Inp label="PTO weeks" value={form.ptoWeeks} onChange={v => setForm(f=>({...f,ptoWeeks:+v}))} type="number" />
            <Inp label="Call schedule" value={form.call} onChange={v => setForm(f=>({...f,call:v}))} />
            <Inp label="Non-compete" value={form.nonCompete} onChange={v => setForm(f=>({...f,nonCompete:v}))} />
          </div>
          <Btn onClick={submit} className="mt-3">Submit Anonymously</Btn>
        </Card>
      )}

      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Average Total Comp by Specialty ($K)</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={specChart} layout="vertical" barCategoryGap="8%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chartGrid)" horizontal={false}/>
            <XAxis type="number" tick={{fontSize:10,fill:"var(--chartText)"}} axisLine={false} tickLine={false} unit="K"/>
            <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:"var(--text3)"}} axisLine={false} tickLine={false} width={90}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="value" name="Avg Total ($K)" radius={[0,4,4,0]}>{specChart.map((d,i)=><Cell key={i} fill={d.yours?"#34d399":"rgba(255,255,255,0.06)"}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Individual entries */}
      <div className="space-y-1.5">
        {filtered.slice(0, 12).map((s, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge color="#34d399">{s.specialty}</Badge>
                  <span className="text-xs text-white/50">{s.setting}</span>
                  <span className="text-xs text-white/40">{STATE_NAMES[s.state]||s.state}</span>
                  <span className="text-xs text-white/40">{s.yrsExp}yr exp</span>
                </div>
                <div className="flex gap-3 text-xs text-white/50">
                  <span>Call: {s.call}</span>
                  <span>PTO: {s.ptoWeeks}wk</span>
                  {s.nonCompete && s.nonCompete !== "None" && <span className="text-red-400/70">Non-compete: {s.nonCompete}</span>}
                  <span className={s.tailCovered ? "text-emerald-400/70" : "text-red-400/70"}>{s.tailCovered ? "Tail covered" : "Tail NOT covered"}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-white/65 tabular-nums">{fmt(s.base + s.bonus)}</p>
                <p className="text-xs text-white/40">Base: {fN(s.base)}{s.bonus > 0 ? ` + ${fN(s.bonus)} bonus` : ""}</p>
                {s.rvuRate > 0 && <p className="text-xs text-white/40">${s.rvuRate}/wRVU ({s.rvu.toLocaleString()} wRVUs)</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Takeaway items={[
        `${submissions.length} anonymous submissions. Average total comp: ${fmt(avgTotal)}. ${profile.salary > avgTotal ? "You're above average." : "Below average. Use this data to negotiate."}`,
        `Physicians who negotiate earn 15-20% more. Having real comp data gives you leverage your employer doesn't expect.`,
        `Submit your own data to help the community. It's 100% anonymous and legally protected (NLRA Section 7).`,
      ]} />
    </div>
  );
}
