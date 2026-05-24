import { useState } from "react";
import { SPECIALTIES, fmt, fN } from "../lib/data";
import { Section, Card, Alert, Badge, Takeaway } from "../components/ui";

const ITEMS = [
  { cat:"Compensation", items:[
    { name:"Base salary", desc:"Benchmark against Doximity/MGMA data. Ask for 75th percentile.", priority:"high", negotiable:true },
    { name:"RVU/productivity bonus", desc:"Structure matters more than base. Get threshold and rate in writing.", priority:"high", negotiable:true },
    { name:"Sign-on bonus", desc:"$10-100K typical. Higher for rural or hard-to-fill. Often repayable if leaving early.", priority:"medium", negotiable:true },
    { name:"Relocation allowance", desc:"$5-25K. Negotiate separate from sign-on so it's not clawed back.", priority:"medium", negotiable:true },
  ]},
  { cat:"Benefits & Time", items:[
    { name:"PTO / vacation weeks", desc:"4-6 weeks standard. Push for 5+. Separate CME days from PTO.", priority:"high", negotiable:true },
    { name:"CME allowance", desc:"$2-10K typical. Negotiate higher + dedicated CME days (5-7).", priority:"medium", negotiable:true },
    { name:"Loan repayment", desc:"Some employers offer $10-50K/yr. Tax-free up to $5,250 under CARES.", priority:"high", negotiable:true },
    { name:"Retirement match", desc:"3-6% typical. Push for dollar-for-dollar match up to 6%.", priority:"medium", negotiable:false },
  ]},
  { cat:"Protection", items:[
    { name:"Malpractice tail coverage", desc:"CRITICAL. If leaving, who pays? Tail can be $20-100K+. Get employer to cover.", priority:"high", negotiable:true },
    { name:"Non-compete clause", desc:"Push for narrower radius (10mi vs 30mi) and shorter duration (1yr vs 2yr).", priority:"high", negotiable:true },
    { name:"Termination without cause", desc:"90-180 day notice both ways. Avoid 30-day termination clauses.", priority:"high", negotiable:true },
    { name:"Disability provisions", desc:"Own-occupation definition. What happens to partnership buy-in if disabled?", priority:"medium", negotiable:false },
  ]},
  { cat:"Career Growth", items:[
    { name:"Partnership track", desc:"Timeline (2-3yr typical), buy-in amount, equity vesting, governance rights.", priority:"high", negotiable:true },
    { name:"Call schedule", desc:"1:4 minimum. Negotiate call pay separately. No unpaid call.", priority:"high", negotiable:true },
    { name:"Administrative time", desc:"0.5-1 day/wk for charting, admin. Don't accept 100% clinical.", priority:"medium", negotiable:true },
    { name:"Academic appointment", desc:"If desired, negotiate title and protected research time.", priority:"low", negotiable:true },
  ]},
];

export default function NegotiationKit({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [checked, setChecked] = useState({});
  const toggle = (name) => setChecked(prev => ({ ...prev, [name]: !prev[name] }));
  const totalItems = ITEMS.reduce((s, c) => s + c.items.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-5 animate-in">
      <Section title="Negotiation Toolkit" sub="Know What to Ask For" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Items reviewed" value={`${checkedCount}/${totalItems}`} color={checkedCount === totalItems ? "#34d399" : "#fbbf24"} />
        <Stat label="Specialty median" value={fmt(spec.m)} color="#60a5fa" />
        <Stat label="75th percentile" value={fmt(spec.hi)} sub="Your target" color="#34d399" />
      </div>

      {ITEMS.map((cat, ci) => (
        <Card key={ci}>
          <p className="text-sm text-white/55 font-bold mb-3">{cat.cat}</p>
          <div className="space-y-2">
            {cat.items.map((item, i) => (
              <button key={i} onClick={() => toggle(item.name)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition ${checked[item.name] ? "bg-emerald-500/[0.04] border-emerald-500/15" : "border-white/[0.04] hover:bg-white/[0.02]"}`}>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 text-xs ${checked[item.name] ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.04] text-white/20"}`}>
                  {checked[item.name] ? "O" : ""}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${checked[item.name] ? "text-emerald-400/70" : "text-white/55"}`}>{item.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${item.priority==="high"?"bg-red-500/10 text-red-400":item.priority==="medium"?"bg-amber-500/10 text-amber-400":"bg-blue-500/10 text-blue-400"}`}>{item.priority}</span>
                    {item.negotiable && <span className="text-xs text-emerald-400/50">negotiable</span>}
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      ))}

      <Takeaway items={[
        `${checkedCount}/${totalItems} items reviewed. ${checkedCount < totalItems ? "Review all before signing." : "Fully prepared."}`,
        `Target ${fmt(spec.hi)} (75th percentile for ${profile.specialty}). That's ${fmt(spec.hi - spec.m)} above median.`,
        `Tail coverage and non-compete are the two most expensive items physicians fail to negotiate. Get them in writing.`,
      ]} />
    </div>
  );
}
