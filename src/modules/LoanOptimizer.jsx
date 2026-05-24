import { useState, useMemo } from "react";
import { SPECIALTIES, fmt, fN, pmtCalc } from "../lib/data";
import { Section, Stat, Card, Inp, Alert, Takeaway } from "../components/ui";
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/75 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>);
};

export default function LoanOptimizer({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [balance, setBalance] = useState(profile.loans || 250000);
  const [currentRate, setCurrentRate] = useState(6.8);
  const [salary, setSalary] = useState(profile.salary || spec.m);
  const [employer, setEmployer] = useState("private");

  const results = useMemo(() => {
    const strategies = [
      { id:"pslf", name:"PSLF (10yr)", color:"#34d399", desc:"120 qualifying payments at non-profit/gov" },
      { id:"aggressive", name:"Aggressive", color:"#f87171", desc:"25% income, debt-free fastest" },
      { id:"refi", name:"Refinance 4.5%", color:"#60a5fa", desc:"Private lender, lose federal protections" },
      { id:"standard", name:"Standard 10yr", color:"#a78bfa", desc:"Fixed payments, no forgiveness" },
    ];

    return strategies.map(s => {
      let monthlyPmt, totalPaid, months;
      if (s.id === "pslf" && employer !== "private") {
        monthlyPmt = Math.round(Math.max(0, (salary * 0.1 - 22790)) / 12);
        totalPaid = monthlyPmt * 120;
        months = 120;
      } else if (s.id === "pslf") {
        return { ...s, monthlyPmt:0, totalPaid:0, savings:0, months:0, eligible:false };
      } else if (s.id === "aggressive") {
        monthlyPmt = Math.round(salary * 0.25 / 12);
        let bal = balance, m = 0, paid = 0;
        while (bal > 0 && m < 600) { bal = bal + bal * currentRate / 1200 - monthlyPmt; paid += monthlyPmt; m++; }
        totalPaid = paid; months = m;
      } else {
        const r = s.id === "refi" ? 4.5 : currentRate;
        monthlyPmt = Math.round(pmtCalc(balance, r, 120));
        totalPaid = monthlyPmt * 120; months = 120;
      }
      const stdTotal = Math.round(pmtCalc(balance, currentRate, 120)) * 120;
      return { ...s, monthlyPmt, totalPaid, savings: stdTotal - totalPaid, months, eligible: true };
    });
  }, [balance, currentRate, salary, employer]);

  const best = results.filter(r => r.eligible).sort((a, b) => a.totalPaid - b.totalPaid)[0];

  // Payoff timeline chart
  const timeline = useMemo(() => {
    const data = [];
    for (let yr = 0; yr <= 15; yr++) {
      const point = { year: yr };
      results.filter(r => r.eligible).forEach(s => {
        const moPaid = yr * 12;
        if (moPaid <= s.months) {
          const remaining = Math.max(0, balance - (s.monthlyPmt * moPaid - balance * (currentRate/100) * yr * 0.4));
          point[s.id] = Math.max(0, Math.round(balance * (1 - moPaid / s.months)));
        } else {
          point[s.id] = 0;
        }
      });
      data.push(point);
    }
    return data;
  }, [results, balance, currentRate]);

  const compData = results.filter(r => r.eligible).map(s => ({
    name: s.name, total: Math.round(s.totalPaid / 1000), color: s.color,
  }));

  return (
    <div className="space-y-5 animate-in">
      <Section title="Loan Optimizer" sub="Repayment Strategy Comparison" />
      <div className="grid grid-cols-2 gap-2">
        <Inp label="Loan balance" value={balance} onChange={setBalance} type="number" pre="$" />
        <Inp label="Current rate %" value={currentRate} onChange={setCurrentRate} type="number" />
        <Inp label="Annual salary" value={salary} onChange={setSalary} type="number" pre="$" />
        <Inp label="Employer type" value={employer} onChange={setEmployer}
          options={[{v:"private",l:"Private Practice"},{v:"nonprofit",l:"Non-Profit Hospital"},{v:"government",l:"Government/VA"}]} />
      </div>

      {/* Total cost comparison */}
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-1">Total Cost Comparison ($K)</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={compData} barCategoryGap="25%">
            <XAxis dataKey="name" tick={{ fontSize:9, fill:"rgba(255,255,255,0.55)" }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:8, fill:"rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} unit="K"/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="total" name="Total Paid ($K)" radius={[4,4,0,0]}>{compData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Strategy cards */}
      <div className="space-y-2">
        {results.filter(r => r.eligible).map((r) => {
          const isBest = r.id === best?.id;
          return (
            <Card key={r.id} className={isBest ? "border-emerald-500/20 bg-emerald-500/[0.02]" : ""}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-sm text-white/75 font-bold">
                    {r.name} {isBest && <span className="text-emerald-400 text-xs ml-1">BEST</span>}
                  </p>
                  <p className="text-xs text-white/55">{r.desc}</p>
                </div>
                <div className="w-3 h-8 rounded-full" style={{ background: r.color, opacity: 0.5 }} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div><p className="text-xs text-white/55">Monthly</p><p className="text-xs font-bold text-white/65 tabular-nums">{fN(r.monthlyPmt)}</p></div>
                <div><p className="text-xs text-white/55">Total paid</p><p className="text-xs font-bold text-white/65 tabular-nums">{fmt(r.totalPaid)}</p></div>
                <div><p className="text-xs text-white/55">{r.id === "pslf" ? "Forgiven" : "vs Standard"}</p>
                  <p className={`text-xs font-bold tabular-nums ${r.savings > 0 ? "text-emerald-400" : "text-red-400"}`}>{r.savings > 0 ? "+" : ""}{fmt(r.savings)}</p>
                </div>
              </div>
              {/* Mini timeline bar */}
              <div className="mt-2 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, r.months / 180 * 100)}%`, background: r.color, opacity: 0.6 }} />
              </div>
              <p className="text-sm text-white/65 mt-0.5 text-right">{(r.months / 12).toFixed(1)} years</p>
            </Card>
          );
        })}
      </div>

      {employer !== "private" && <Alert type="success">PSLF eligible! Stay at qualifying employer, income-driven plan, certify annually. Saves {fmt(best?.savings || 0)}.</Alert>}
      {employer === "private" && balance > 200000 && <Alert type="info">Consider refinancing. At 4.5% vs {currentRate}%, save {fmt(results.find(r=>r.id==="refi")?.savings || 0)} over 10 years.</Alert>}

      <Takeaway items={[
        `Best strategy: ${best?.name || "N/A"}. Saves ${fmt(best?.savings || 0)} vs standard repayment.`,
        employer !== "private" ? `PSLF eligible. 10 years of income-driven payments, then forgiveness.` : `Private practice: refinance or aggressive payoff are your best options.`,
        `You're paying ${fN(Math.round(balance * currentRate / 100))}/yr in interest alone.`,
      ]} />
    </div>
  );
}
