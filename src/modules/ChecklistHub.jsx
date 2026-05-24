import { useState, useEffect } from "react";
import { Section, Card, Alert, Badge, Takeaway } from "../components/ui";

const CHECKLISTS = {
  "first-job": { title:"First Attending Job", icon:"🎓", items:[
    "Set up 401(k) and maximize employer match","Open backdoor Roth IRA","Get own-occupation disability insurance (3-6 month wait)",
    "Purchase umbrella liability ($2M+)","Review employment contract (use contract review attorney)","Set up emergency fund (6 months expenses)",
    "Refinance student loans OR enroll in PSLF","Create a will and healthcare directive","Update beneficiaries on all accounts",
    "Automate savings: 20%+ of gross income","Open HSA if on HDHP","Set up term life insurance if dependents",
    "Review malpractice coverage (occurrence vs claims-made)","Resist lifestyle creep: live like a resident for 2-3 years",
  ]},
  "annual": { title:"Annual Financial Review", icon:"📅", items:[
    "Review and rebalance investment portfolio","Max out 401(k) contribution ($23,500 + catch-up)","Execute backdoor Roth IRA conversion",
    "Max HSA contribution ($8,750 family)","Review insurance coverage (DI, umbrella, life, malpractice)","Update estate plan if life changes",
    "Check credit report (annualcreditreport.com)","Review tax withholding (W-4 optimizer)","Harvest tax losses in taxable accounts",
    "Contribute to 529 plans if applicable","Review and negotiate contracts/compensation","Update credential tracker (licenses, CME, DEA)",
    "Review beneficiary designations","Assess PSLF progress if applicable","Review net worth vs prior year",
  ]},
  "pre-retire": { title:"Pre-Retirement (5yr out)", icon:"🏖️", items:[
    "Calculate retirement income needs (80% replacement)","Project portfolio withdrawal rate (4% rule)","Review Social Security strategy (delay to 67-70?)",
    "Plan health insurance bridge (COBRA, ACA marketplace, spouse plan)","Consider Roth conversion ladder in lower-income years",
    "Review asset allocation (shift toward bonds/income)","Estimate Medicare premiums (IRMAA surcharge for high income)",
    "Plan malpractice tail coverage if leaving practice","Decide: sell practice, wind down, or transition to part-time",
    "Update estate plan, trusts, POA, healthcare directive","Review long-term care insurance options",
    "Create retirement budget with inflated expenses","Plan Medicare enrollment (Part A at 65, Part B timing)",
  ]},
};

function loadProgress() { try { return JSON.parse(localStorage.getItem("pw_checklists") || "{}"); } catch { return {}; } }

export default function ChecklistHub({ profile }) {
  const [progress, setProgress] = useState(loadProgress);
  const [activeList, setActiveList] = useState("first-job");

  useEffect(() => { localStorage.setItem("pw_checklists", JSON.stringify(progress)); }, [progress]);

  const toggle = (listId, idx) => {
    setProgress(prev => {
      const key = `${listId}-${idx}`;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const list = CHECKLISTS[activeList];
  const completed = list.items.filter((_, i) => progress[`${activeList}-${i}`]).length;
  const pct = Math.round(completed / list.items.length * 100);

  return (
    <div className="space-y-5 animate-in">
      <Section title="Financial Checklists" sub="Track Your Progress" />

      <div className="flex gap-2">
        {Object.entries(CHECKLISTS).map(([id, cl]) => {
          const done = cl.items.filter((_, i) => progress[`${id}-${i}`]).length;
          return (
            <button key={id} onClick={() => setActiveList(id)}
              className={`flex-1 p-3 rounded-xl text-center transition border ${activeList === id ? "bg-emerald-500/[0.06] border-emerald-500/15" : "border-white/[0.04] hover:bg-white/[0.02]"}`}>
              <span className="text-xl">{cl.icon}</span>
              <p className="text-sm text-white/55 font-bold mt-1">{cl.title}</p>
              <p className="text-xs text-white/50">{done}/{cl.items.length}</p>
            </button>
          );
        })}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-white/55 font-bold">{list.title}</p>
          <span className="text-sm font-bold" style={{ color: pct >= 100 ? "#34d399" : pct > 50 ? "#fbbf24" : "#f87171" }}>{pct}%</span>
        </div>
        <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden mb-4">
          <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, background: pct >= 100 ? "#34d399" : pct > 50 ? "#fbbf24" : "#f87171" }} />
        </div>
        <div className="space-y-1">
          {list.items.map((item, i) => {
            const done = progress[`${activeList}-${i}`];
            return (
              <button key={i} onClick={() => toggle(activeList, i)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition ${done ? "bg-emerald-500/[0.03]" : "hover:bg-white/[0.02]"}`}>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs flex-shrink-0 ${done ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.04] text-white/20"}`}>
                  {done ? "O" : ""}
                </div>
                <span className={`text-sm ${done ? "text-emerald-400/60 line-through" : "text-white/55"}`}>{item}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Takeaway items={[
        `${completed}/${list.items.length} items completed (${pct}%). ${pct < 50 ? "Several critical items remain." : pct < 100 ? "Almost there." : "Checklist complete."}`,
        `Most impactful: disability insurance, backdoor Roth, and maximizing 401(k) match. Do these first.`,
        `Review annually. Tax laws, contribution limits, and life circumstances change every year.`,
      ]} />
    </div>
  );
}
