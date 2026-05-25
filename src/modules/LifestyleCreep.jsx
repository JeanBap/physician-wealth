import { useState, useMemo } from "react";
import { SPECIALTIES, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Alert, Takeaway } from "../components/ui";
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { chartGrid, chartText } from "../lib/chartColors";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/50 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>);
};

const LIFESTYLE_ITEMS = [
  { name:"Housing upgrade", monthly:2000, cat:"housing", desc:"Bigger house, better neighborhood" },
  { name:"Luxury car lease", monthly:800, cat:"transport", desc:"BMW, Audi, Tesla upgrade from reliable used" },
  { name:"Private school (per kid)", monthly:2500, cat:"kids", desc:"$30K/yr tuition vs public" },
  { name:"Country club", monthly:500, cat:"lifestyle", desc:"Membership + monthly dues" },
  { name:"Dining out lifestyle", monthly:1200, cat:"food", desc:"Restaurants 4x/wk vs cooking" },
  { name:"Vacation upgrade", monthly:800, cat:"travel", desc:"Business class, luxury hotels vs economy" },
  { name:"Designer shopping", monthly:600, cat:"lifestyle", desc:"Clothes, accessories, watches" },
  { name:"Home services", monthly:500, cat:"housing", desc:"Landscaping, cleaning, handyman" },
];

export default function LifestyleCreep({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const sal = profile.salary || spec.m;
  const [selectedCreep, setSelectedCreep] = useState([]);
  const [yearsToProject, setYearsToProject] = useState(20);

  const monthlyCreep = selectedCreep.reduce((s, idx) => s + LIFESTYLE_ITEMS[idx].monthly, 0);
  const annualCreep = monthlyCreep * 12;

  // What that creep costs over time with compound opportunity cost
  const projection = useMemo(() => {
    let withCreep = 0, withoutCreep = 0;
    return Array.from({ length: yearsToProject + 1 }, (_, yr) => {
      const d = { year: yr, withCreep: Math.round(withCreep), withoutCreep: Math.round(withoutCreep), lost: Math.round(withoutCreep - withCreep) };
      withCreep = withCreep * 1.07; // only invested savings minus creep
      withoutCreep = withoutCreep * 1.07 + annualCreep; // what you'd have if invested instead
      return d;
    });
  }, [annualCreep, yearsToProject]);

  const totalLost = projection[projection.length - 1]?.lost || 0;
  const lostRetireYears = annualCreep > 0 ? Math.round(totalLost / (sal * 0.04)) : 0;

  const catBreakdown = useMemo(() => {
    const cats = {};
    selectedCreep.forEach(idx => {
      const item = LIFESTYLE_ITEMS[idx];
      cats[item.cat] = (cats[item.cat] || 0) + item.monthly;
    });
    return Object.entries(cats).map(([cat, monthly]) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: monthly,
      color: { housing:"#60a5fa", transport:"#a78bfa", kids:"#fbbf24", lifestyle:"#f472b6", food:"#f87171", travel:"#34d399" }[cat] || "#fff",
    }));
  }, [selectedCreep]);

  return (
    <div className="space-y-5 animate-in">
      <Section title="Lifestyle Creep Calculator" sub="The Silent Wealth Killer" />

      <Alert type="info">
        The average physician's spending increases 2-3x faster than inflation after training. Every $1,000/mo in lifestyle creep costs ~$500K over 20 years at 7% returns.
      </Alert>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Monthly creep" value={fN(monthlyCreep)} color={monthlyCreep > 3000 ? "#f87171" : monthlyCreep > 1000 ? "#fbbf24" : "#34d399"} />
        <Stat label="Annual cost" value={fN(annualCreep)} color="#f87171" />
        <Stat label={`${yearsToProject}yr opportunity cost`} value={fmt(totalLost)} color="#f87171" />
      </div>

      {/* Select lifestyle creep items */}
      <Card>
        <p className="text-sm text-white/55 font-bold mb-3">What upgrades are you considering?</p>
        <div className="space-y-2">
          {LIFESTYLE_ITEMS.map((item, idx) => {
            const selected = selectedCreep.includes(idx);
            return (
              <button key={idx} onClick={() => setSelectedCreep(prev => selected ? prev.filter(i => i !== idx) : [...prev, idx])}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left ${selected ? "bg-red-500/[0.04] border-red-500/15" : "border-white/[0.04] hover:bg-white/[0.02]"}`}>
                <div>
                  <p className={`text-sm font-medium ${selected ? "text-red-400/80" : "text-white/55"}`}>{item.name}</p>
                  <p className="text-xs text-white/40">{item.desc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${selected ? "text-red-400" : "text-white/50"}`}>${item.monthly.toLocaleString()}/mo</p>
                  <p className="text-xs text-white/40">${(item.monthly*12).toLocaleString()}/yr</p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {monthlyCreep > 0 && (
        <>
          {/* Opportunity cost chart */}
          <Card>
            <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Opportunity Cost Over {yearsToProject} Years</p>
            <p className="text-xs text-white/40 mb-2">What you'd have if you invested {fN(monthlyCreep)}/mo at 7% instead</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={projection}>
                <defs>
                  <linearGradient id="lostG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f87171" stopOpacity={0.3}/><stop offset="100%" stopColor="#f87171" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid()}/>
                <XAxis dataKey="year" tick={{ fontSize:11, fill:chartText() }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10, fill:chartText() }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1e6).toFixed(1)}M`}/>
                <Tooltip content={<Tip/>}/>
                <Area type="monotone" dataKey="lost" name="Wealth Lost" stroke="#f87171" fill="url(#lostG)" strokeWidth={2.5} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {catBreakdown.length > 0 && (
            <Card>
              <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Creep by Category (Monthly)</p>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={catBreakdown} barCategoryGap="20%">
                  <XAxis dataKey="name" tick={{ fontSize:11, fill:chartText() }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:10, fill:chartText() }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(1)}K`}/>
                  <Bar dataKey="value" name="Monthly" radius={[4,4,0,0]}>{catBreakdown.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          <Takeaway items={[
            `${fN(monthlyCreep)}/mo in lifestyle upgrades costs ${fmt(totalLost)} over ${yearsToProject} years (at 7% compound returns).`,
            `That's equivalent to ${lostRetireYears} extra years of retirement income at 4% withdrawal rate.`,
            `Live like a resident for 2-5 years after training. The physician who saves 40% in years 1-5 reaches FI a decade earlier than the one who doesn't.`,
          ]} />
        </>
      )}

      <Inp label="Years to project" value={yearsToProject} onChange={v => setYearsToProject(+v)} type="number" />
    </div>
  );
}
