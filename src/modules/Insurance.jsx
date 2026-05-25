import { useState, useMemo } from "react";
import { Icon } from "../components/icons";
import { SPECIALTIES, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Alert , Takeaway } from "../components/ui";
import { BarChart, Bar, Cell, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { analyzeTriple, analyzeDouble } from "../lib/ai";
import { chartText } from "../lib/chartColors";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/75 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>);
};

const POLICIES = [
  { type: "Malpractice", icon: "scale", desc: "Professional liability", benchmark: "mal" },
  { type: "Disability (Own-Occ)", icon: "lock", desc: "Income replacement, own-specialty", benchmark: null },
  { type: "Life (Term 20yr)", icon: "shield", desc: "Income replacement for dependents", benchmark: null },
  { type: "Umbrella", icon: "insurance", desc: "Excess liability coverage", benchmark: null },
];

export default function Insurance({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const sal = profile.salary || spec.m;
  const [dependents, setDependents] = useState(2);
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const recommendations = useMemo(() => [
    { type: "Malpractice", need: fN(spec.mal) + "/yr", status: "Required", cost: spec.mal, color: "#f87171" },
    { type: "Disability (Own-Occ)", need: fN(Math.round(sal * 0.6 / 12)) + "/mo", status: "Critical", cost: Math.round(sal / 100000 * 180 * 12), color: "#fbbf24" },
    { type: "Life (Term 20yr)", need: fmt(sal * 10 + (profile.loans || 0)), status: dependents > 0 ? "Critical" : "Optional", cost: Math.round(sal / 100000 * 50 * 12), color: "#60a5fa" },
    { type: "Umbrella ($2M)", need: "$2M", status: "Recommended", cost: 600, color: "#a78bfa" },
  ], [spec, sal, dependents]);

  const totalCost = recommendations.reduce((s, r) => s + r.cost, 0);
  const pctIncome = ((totalCost / sal) * 100).toFixed(1);

  const costData = recommendations.map(r => ({ name: r.type.split(" ")[0], value: r.cost, color: r.color }));
  const pieData = [{ name: "Insurance", value: totalCost, color: "#f87171" }, { name: "Remaining", value: sal - totalCost, color: "#34d399" }];

  const handleUpload = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    setFile(f); setLoading(true);
    const text = await f.text();
    const result = await analyzeTriple("You are an insurance analyst.", text + "\n\n" + `Merge and deduplicate findings.`);
    setAnalysis(result); setLoading(false);
  };

  return (
    <div className="space-y-5 animate-in">
      <Section title="Insurance Optimizer" sub="Coverage Analysis" />
      <Inp label="Number of dependents" value={dependents} onChange={setDependents} type="number" />

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Total annual cost" value={fN(totalCost)} color="#f87171" />
        <Stat label="% of income" value={`${pctIncome}%`} color="#fbbf24" />
        <Stat label="Recommended" value="4 policies" color="#60a5fa" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Cost breakdown bar */}
        <Card>
          <p className="text-xs text-white/55 uppercase tracking-widest mb-1">Annual Cost Breakdown</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={costData} barCategoryGap="20%">
              <XAxis dataKey="name" tick={{ fontSize:8, fill:chartText() }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:8, fill:chartText() }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="value" name="Cost" radius={[4,4,0,0]}>{costData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        {/* Income share pie */}
        <Card>
          <p className="text-xs text-white/55 uppercase tracking-widest mb-1">Income Share</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value" stroke="none">
                {pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip content={<Tip/>}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Policy cards */}
      <div className="space-y-2">
        {recommendations.map((r, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white/75 font-bold">{r.type}</p>
                  <span className={`text-sm px-1.5 py-0.5 rounded-full font-bold ${
                    r.status === "Critical" ? "bg-red-500/10 text-red-400" :
                    r.status === "Required" ? "bg-amber-500/10 text-amber-400" :
                    "bg-blue-500/10 text-blue-400"}`}>{r.status}</span>
                </div>
                <p className="text-xs text-white/55 mt-0.5">Coverage needed: {r.need}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums" style={{ color: r.color }}>{fN(r.cost)}</p>
                <p className="text-sm text-white/65">/year</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* AI Upload */}
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-2">AI Policy Analysis</p>
        <p className="text-xs text-white/55 mb-2">Upload your insurance policy for AI double-pass analysis.</p>
        <input type="file" accept=".txt,.pdf" onChange={handleUpload}
          className="text-sm text-white/75 file:mr-3 file:rounded-lg file:bg-emerald-500/10 file:border-emerald-500/20 file:border file:text-emerald-400 file:text-xs file:font-bold file:px-3 file:py-1.5 file:cursor-pointer" />
        {loading && <p className="text-xs text-emerald-400/70 mt-2 animate-pulse">Analyzing with double-pass AI...</p>}
        {analysis && <div className="mt-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] text-sm text-white/55 whitespace-pre-wrap">{analysis}</div>}
      </Card>

      <Alert type="info">Own-occupation disability is critical for physicians. If you can't perform YOUR specialty, it pays. Any-occ only pays if you can't work at all.</Alert>

      <Takeaway items={[
        `Total insurance: ${fN(totalCost)}/yr (${pctIncome}% of income).`,
        `${recommendations.filter(r=>r.status==="Critical").length > 0 ? `Critical gaps: ${recommendations.filter(r=>r.status==="Critical").map(r=>r.type).join(", ")}.` : "All critical coverages addressed."}`,
        `Own-occ disability is the #1 priority for any physician. Malpractice: ${fN(spec.mal)}/yr.`,
      ]} />
    </div>
  );
}
