import { useState, useMemo } from "react";
import { Section, Card, Alert, Badge } from "../components/ui";

const DEADLINES = [
  { date:"01-15", name:"Q4 Estimated Tax Due", desc:"Pay quarterly estimated tax for Oct-Dec", cat:"tax", critical:true },
  { date:"01-31", name:"W-2 / 1099 Deadline", desc:"Employers must send W-2s; 1099s due to you", cat:"tax", critical:false },
  { date:"03-15", name:"S-Corp/Partnership Return", desc:"Form 1120-S or 1065 due (or extension)", cat:"tax", critical:true },
  { date:"04-15", name:"Individual Tax Return Due", desc:"Form 1040 due (or extension). IRA contribution deadline.", cat:"tax", critical:true },
  { date:"04-15", name:"Q1 Estimated Tax Due", desc:"Pay quarterly estimated tax for Jan-Mar", cat:"tax", critical:true },
  { date:"06-15", name:"Q2 Estimated Tax Due", desc:"Pay quarterly estimated tax for Apr-May", cat:"tax", critical:true },
  { date:"09-15", name:"Q3 Estimated Tax Due", desc:"Pay quarterly estimated tax for Jun-Aug", cat:"tax", critical:true },
  { date:"09-15", name:"Extended S-Corp/Partnership", desc:"Extended 1120-S or 1065 due", cat:"tax", critical:false },
  { date:"10-15", name:"Extended Individual Return", desc:"Extended Form 1040 due", cat:"tax", critical:true },
  { date:"12-31", name:"Charitable Giving Deadline", desc:"Last day for tax-year charitable deductions", cat:"tax", critical:false },
  { date:"12-31", name:"401(k) Contribution Deadline", desc:"Elective deferrals must be made by year-end", cat:"retirement", critical:true },
  { date:"12-31", name:"Tax-Loss Harvesting", desc:"Last day to realize capital losses for tax year", cat:"tax", critical:false },
  { date:"04-15", name:"HSA Contribution Deadline", desc:"HSA contributions for prior year", cat:"retirement", critical:false },
  { date:"04-15", name:"Backdoor Roth Conversion", desc:"Good time to execute before filing", cat:"retirement", critical:false },
  { date:"01-01", name:"New Contribution Limits", desc:"Max out new year 401k/HSA/529 early", cat:"retirement", critical:false },
  { date:"07-01", name:"Mid-Year Insurance Review", desc:"Review DI, umbrella, malpractice coverage", cat:"insurance", critical:false },
  { date:"10-01", name:"Open Enrollment Prep", desc:"Review health insurance options for next year", cat:"insurance", critical:false },
  { date:"06-30", name:"PSLF Annual Certification", desc:"Submit Employment Certification Form", cat:"loans", critical:true },
  { date:"12-31", name:"529 State Tax Deduction", desc:"Contribute before year-end for state deduction", cat:"retirement", critical:false },
];

const CATS = { tax:"#a78bfa", retirement:"#34d399", insurance:"#fbbf24", loans:"#60a5fa" };

export default function TaxCalendar({ profile }) {
  const [showAll, setShowAll] = useState(false);
  const year = new Date().getFullYear();

  const events = useMemo(() => {
    const today = new Date();
    return DEADLINES.map(d => {
      const [mm, dd] = d.date.split("-").map(Number);
      let eventDate = new Date(year, mm - 1, dd);
      if (eventDate < today) eventDate = new Date(year + 1, mm - 1, dd);
      const daysUntil = Math.ceil((eventDate - today) / 86400000);
      return { ...d, eventDate, daysUntil, month: eventDate.toLocaleDateString("en-US", { month:"short" }), day: dd };
    }).sort((a, b) => a.daysUntil - b.daysUntil);
  }, [year]);

  const upcoming = showAll ? events : events.slice(0, 8);
  const urgent = events.filter(e => e.daysUntil <= 30 && e.critical);

  return (
    <div className="space-y-5 animate-in">
      <Section title="Tax & Financial Calendar" sub="Never Miss a Deadline" />

      {urgent.length > 0 && (
        <Alert type="danger">
          {urgent.length} critical deadline{urgent.length > 1 ? "s" : ""} in the next 30 days: {urgent.map(u => u.name).join(", ")}
        </Alert>
      )}

      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-white/50 uppercase tracking-widest">Upcoming Deadlines</p>
          <button onClick={() => setShowAll(!showAll)} className="text-xs text-emerald-400/70 hover:text-emerald-400">
            {showAll ? "Show Less" : `Show All (${events.length})`}
          </button>
        </div>
        <div className="space-y-2">
          {upcoming.map((e, i) => (
            <div key={i} className={`flex items-center gap-4 py-3 px-3 rounded-xl transition ${e.daysUntil <= 14 ? "bg-red-500/[0.04] border border-red-500/10" : e.daysUntil <= 30 ? "bg-amber-500/[0.03] border border-amber-500/8" : "border border-white/[0.03]"}`}>
              {/* Date badge */}
              <div className="w-12 text-center flex-shrink-0">
                <p className="text-xs text-white/40 uppercase">{e.month}</p>
                <p className="text-xl font-black text-white/65">{e.day}</p>
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white/65 font-bold truncate">{e.name}</p>
                  {e.critical && <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 font-bold">Critical</span>}
                </div>
                <p className="text-xs text-white/40">{e.desc}</p>
              </div>
              {/* Days until */}
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-bold tabular-nums ${e.daysUntil <= 14 ? "text-red-400" : e.daysUntil <= 30 ? "text-amber-400" : "text-white/40"}`}>
                  {e.daysUntil}d
                </p>
                <Badge color={CATS[e.cat] || "#fff"}>{e.cat}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
