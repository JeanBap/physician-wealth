import { useState, useMemo } from "react";
import { SPECIALTIES, STATE_TAX, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Alert , Takeaway } from "../components/ui";
import { BarChart, Bar, Cell, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { chartText } from "../lib/chartColors";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/75 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>);
};

export default function EstatePlan({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const sal = profile.salary || spec.m;
  const netWorth = (profile.savings||0) + (profile.retirement||0) + (profile.investments||0) - (profile.loans||0);
  const [kids, setKids] = useState(2);
  const [kidAge, setKidAge] = useState(5);
  const [estatePlan, setEstatePlan] = useState("none"); // none, will, trust
  const [umbrellaPolicy, setUmbrellaPolicy] = useState(false);
  const [assetProtection, setAssetProtection] = useState(false);

  const yearsToCollege = Math.max(0, 18 - kidAge);
  const collegeCost = 85000 * 4; // avg private 4yr
  const totalCollegeCost = collegeCost * kids;

  // 529 projection per child
  const monthly529 = 500;
  const annual529 = monthly529 * 12;
  const projected529 = useMemo(() => {
    let bal = 0;
    return Array.from({ length: yearsToCollege + 1 }, (_, yr) => {
      const d = { year: yr, balance: Math.round(bal), target: Math.round(collegeCost * (yr / yearsToCollege || 0)) };
      bal = bal * 1.07 + annual529;
      return d;
    });
  }, [yearsToCollege, collegeCost, annual529]);

  const finalBal = projected529[projected529.length - 1]?.balance || 0;
  const gap529 = collegeCost - finalBal;

  // Estate tax exposure
  const estateExemption = 13610000; // 2024 exemption
  const estateExposure = Math.max(0, netWorth - estateExemption);
  const estateTax = Math.round(estateExposure * 0.40);

  // Asset protection checklist
  const protectionItems = [
    { name: "Umbrella Insurance ($2-5M)", done: umbrellaPolicy, priority: "Critical", cost: "$400-800/yr", desc: "Covers beyond auto/home limits. Essential for high-income physicians." },
    { name: "Revocable Living Trust", done: estatePlan === "trust", priority: "High", cost: "$2,000-5,000", desc: "Avoids probate, maintains privacy, controls distribution." },
    { name: "Irrevocable Life Insurance Trust", done: false, priority: netWorth > 5000000 ? "High" : "Medium", cost: "$3,000-8,000", desc: "Removes life insurance from estate. Critical above $5M net worth." },
    { name: "LLC for Rental Properties", done: false, priority: "Medium", cost: "$500-1,500/yr", desc: "Separates personal assets from real estate liability." },
    { name: "Disability Buy-Out Agreement", done: false, priority: "Medium", cost: "Varies", desc: "Protects practice ownership if partner becomes disabled." },
    { name: "Durable Power of Attorney", done: false, priority: "High", cost: "$200-500", desc: "Designates financial decision-maker if incapacitated." },
    { name: "Healthcare Directive", done: false, priority: "High", cost: "$200-500", desc: "Medical wishes documented. Ironic that physicians often skip this." },
  ];

  const doneCount = protectionItems.filter(p => p.done).length;
  const protectionScore = Math.round((doneCount / protectionItems.length) * 100);

  // Sheltering allocation
  const shelterData = [
    { name: "401(k)", value: 23500, color: "#34d399" },
    { name: "Backdoor Roth", value: 7000, color: "#a78bfa" },
    { name: "HSA", value: 8300, color: "#fbbf24" },
    { name: `529 x${kids}`, value: annual529 * kids, color: "#60a5fa" },
    { name: "DAF", value: Math.round(sal * 0.05), color: "#f472b6" },
  ];

  return (
    <div className="space-y-5 animate-in">
      <Section title="Estate & Legacy Planning" sub="529, Asset Protection, Estate Tax" />

      <div className="grid grid-cols-2 gap-2">
        <Inp label="Number of children" value={kids} onChange={setKids} type="number" />
        <Inp label="Youngest child age" value={kidAge} onChange={setKidAge} type="number" />
        <Inp label="Estate plan" value={estatePlan} onChange={setEstatePlan}
          options={[{v:"none",l:"No plan"},{v:"will",l:"Will only"},{v:"trust",l:"Revocable trust"}]} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Protection score" value={`${protectionScore}%`} color={protectionScore > 60 ? "#34d399" : "#f87171"} />
        <Stat label="529 gap/child" value={gap529 > 0 ? fmt(gap529) : "Funded"} color={gap529 > 0 ? "#fbbf24" : "#34d399"} />
        <Stat label="Estate exposure" value={estateExposure > 0 ? fmt(estateExposure) : "None"} color={estateExposure > 0 ? "#f87171" : "#34d399"} />
      </div>

      {/* 529 projection */}
      {kids > 0 && (
        <Card>
          <p className="text-xs text-white/55 uppercase tracking-widest mb-1">529 Growth (${monthly529}/mo per child, {yearsToCollege}yr)</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={shelterData} barCategoryGap="20%">
              <XAxis dataKey="name" tick={{ fontSize:10, fill:"rgba(255,255,255,0.55)" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:9, fill:chartText() }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="value" name="Annual" radius={[4,4,0,0]}>{shelterData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-between text-xs">
            <span className="text-white/55">Total sheltered/yr</span>
            <span className="text-emerald-400 font-bold">{fN(shelterData.reduce((s,d) => s + d.value, 0))}</span>
          </div>
        </Card>
      )}

      {/* Asset protection checklist */}
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-2">Asset Protection Checklist</p>
        <div className="space-y-2">
          {protectionItems.map((p, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-white/[0.03] last:border-0">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs ${p.done ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.04] text-white/55"}`}>
                {p.done ? "O" : ""}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${p.done ? "text-white/75 line-through" : "text-white/65"}`}>{p.name}</p>
                  <span className={`text-sm px-1.5 py-0.5 rounded-full font-bold ${
                    p.priority === "Critical" ? "bg-red-500/10 text-red-400" :
                    p.priority === "High" ? "bg-amber-500/10 text-amber-400" :
                    "bg-blue-500/10 text-blue-400"}`}>{p.priority}</span>
                </div>
                <p className="text-xs text-white/55 mt-0.5">{p.desc}</p>
                <p className="text-sm text-white/65">Cost: {p.cost}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* College costs */}
      {kids > 0 && (
        <Card>
          <p className="text-xs text-white/55 uppercase tracking-widest mb-2">College Cost Estimates (per child)</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-white/65">Public in-state (4yr)</span><span className="text-white/65">{fN(110000)}</span></div>
            <div className="flex justify-between"><span className="text-white/65">Public out-of-state</span><span className="text-white/65">{fN(180000)}</span></div>
            <div className="flex justify-between"><span className="text-white/65">Private (4yr)</span><span className="text-white/65">{fN(340000)}</span></div>
            <div className="flex justify-between"><span className="text-white/65">Medical school (4yr)</span><span className="text-red-400/80">{fN(280000)}</span></div>
            <div className="flex justify-between border-t border-white/[0.05] pt-1.5 mt-1.5">
              <span className="text-white/55 font-bold">529 projected at 18</span>
              <span className={`font-bold ${finalBal >= collegeCost ? "text-emerald-400" : "text-fbbf24"}`}>{fmt(finalBal)}</span>
            </div>
          </div>
        </Card>
      )}

      {estatePlan === "none" && <Alert type="danger">No estate plan. A physician earning {fmt(sal)} with {kids} dependents needs at minimum a will and healthcare directive. Cost: $500-2,000.</Alert>}
      {protectionScore < 30 && <Alert type="warn">Protection score {protectionScore}%. High-income physicians are lawsuit targets. Prioritize umbrella insurance and asset protection.</Alert>}
      {estateExposure > 0 && <Alert type="info">Estate above {fmt(estateExemption)} exemption. Consider irrevocable trusts, gifting strategies, or Donor Advised Fund to reduce exposure.</Alert>}

      <Takeaway items={[
        `Protection: ${protectionScore}%. ${protectionScore < 30 ? "Critical gaps. You're a lawsuit target." : protectionScore < 70 ? "Partial. Address remaining items." : "Well protected."}`,
        kids > 0 ? `529: ${fmt(finalBal)}/child at 18. ${gap529 > 0 ? `${fmt(gap529)} short.` : "Fully funded."}` : "No children. Focus on asset protection.",
        `${!profile.hasWill ? "Priority #1: Create a will ($500-2K)." : !profile.hasTrust ? "Consider revocable trust to avoid probate." : "Estate plan in place. Review annually."}`,
      ]} />
    </div>
  );
}
