import { useMemo } from "react";
import { SPECIALTIES, STATE_TAX, fedTax, fica, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Alert, Donut } from "../components/ui";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/50 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>);
};

export default function EmergencyFund({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const sal = profile.salary || spec.m;
  const state = profile.state || "NY";
  const totalTax = fedTax(sal, profile.married) + Math.round(sal * (STATE_TAX[state]||0)) + Math.round(fica(sal));
  const monthlyTakeHome = Math.round((sal - totalTax) / 12);
  const savings = profile.savings || 0;

  // Risk factors determine recommended months
  const riskFactors = useMemo(() => {
    const factors = [];
    if (profile.kids > 0) factors.push({ name:`${profile.kids} dependents`, months:1, color:"#fbbf24" });
    if (!profile.hasDI) factors.push({ name:"No disability insurance", months:2, color:"#f87171" });
    if (profile.moonlightIncome > 0) factors.push({ name:"Variable income (moonlighting)", months:1, color:"#a78bfa" });
    if (spec.burn > 45) factors.push({ name:`High burnout specialty (${spec.burn}%)`, months:1, color:"#f472b6" });
    if (profile.mortgageBalance > 0) factors.push({ name:"Mortgage obligations", months:1, color:"#60a5fa" });
    if (profile.stage === "resident") factors.push({ name:"Training (limited earning)", months:1, color:"#818cf8" });
    return factors;
  }, [profile, spec]);

  const baseMonths = 6;
  const extraMonths = riskFactors.reduce((s, f) => s + f.months, 0);
  const recommendedMonths = baseMonths + extraMonths;
  const targetFund = monthlyTakeHome * recommendedMonths;
  const funded = targetFund > 0 ? Math.min(100, Math.round((savings / targetFund) * 100)) : 0;
  const gap = Math.max(0, targetFund - savings);
  const monthlyNeeded = gap > 0 ? Math.round(gap / 12) : 0;
  const runwayMonths = monthlyTakeHome > 0 ? Math.round(savings / monthlyTakeHome) : 0;

  const whereToKeep = [
    { name:"HYSA (Ally/Marcus)", rate:"4.5-5.0%", access:"1-2 days", color:"#34d399" },
    { name:"Money Market", rate:"4.0-5.0%", access:"Same day", color:"#60a5fa" },
    { name:"T-Bills (4wk)", rate:"5.0-5.3%", access:"4 weeks", color:"#a78bfa" },
    { name:"I-Bonds", rate:"Variable", access:"1 year lock", color:"#fbbf24" },
  ];

  return (
    <div className="space-y-5 animate-in">
      <Section title="Emergency Fund" sub="Financial Safety Net" />

      <div className="flex justify-center py-2">
        <Donut value={funded} max={100} size={130} sw={10} color={funded >= 100 ? "#34d399" : funded > 50 ? "#fbbf24" : "#f87171"}>
          <p className="text-2xl font-black" style={{ color:funded >= 100 ? "#34d399" : funded > 50 ? "#fbbf24" : "#f87171" }}>{funded}%</p>
          <p className="text-xs text-white/40">Funded</p>
        </Donut>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Stat label="Current" value={fmt(savings)} color="#60a5fa" />
        <Stat label="Target" value={fmt(targetFund)} sub={`${recommendedMonths} months`} color="#34d399" />
        <Stat label="Gap" value={gap > 0 ? fmt(gap) : "Funded"} color={gap > 0 ? "#f87171" : "#34d399"} />
        <Stat label="Runway" value={`${runwayMonths} mo`} color={runwayMonths >= 6 ? "#34d399" : "#fbbf24"} />
      </div>

      {/* Risk factors */}
      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-2">Why {recommendedMonths} Months (Not Just 6)</p>
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm"><span className="text-white/55">Base recommendation</span><span className="text-white/55 font-bold">{baseMonths} months</span></div>
          {riskFactors.map((f, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-white/50">{f.name}</span>
              <span className="font-bold" style={{ color:f.color }}>+{f.months} month{f.months>1?"s":""}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm border-t border-white/[0.05] pt-2 mt-2">
            <span className="text-white/65 font-bold">Total recommended</span>
            <span className="text-emerald-400 font-bold">{recommendedMonths} months ({fN(targetFund)})</span>
          </div>
        </div>
      </Card>

      {/* Where to keep */}
      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-2">Where to Keep It</p>
        <div className="space-y-2">
          {whereToKeep.map((w, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
              <div>
                <p className="text-sm text-white/55 font-medium">{w.name}</p>
                <p className="text-xs text-white/40">Access: {w.access}</p>
              </div>
              <span className="text-sm font-bold" style={{ color:w.color }}>{w.rate}</span>
            </div>
          ))}
        </div>
      </Card>

      {gap > 0 && <Alert type="warn">Fund gap of {fmt(gap)}. Save {fN(monthlyNeeded)}/mo to fully fund in 12 months.</Alert>}
      {funded >= 100 && <Alert type="success">Emergency fund fully funded. Consider investing excess in taxable brokerage for growth.</Alert>}
    </div>
  );
}
