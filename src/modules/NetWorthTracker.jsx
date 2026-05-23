import { useState, useEffect, useMemo } from "react";
import { fmt, fN } from "../lib/data";
import { Section, Stat, Card, Btn, Alert , Takeaway } from "../components/ui";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/50 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>);
};

function calcNW(p) {
  const assets = (p.savings||0)+(p.retirement||0)+(p.investments||0)+(p.hsa||0)+(p.plan529||0)+(p.cryptoAssets||0)+Math.max(0,(p.homeValue||0)-(p.mortgageBalance||0))+(p.rentalPropertyEquity||0);
  const debt = (p.loans||0)+(p.mortgageBalance||0)+(p.carLoan||0)+(p.creditCardDebt||0);
  return { assets, debt, nw: assets - debt };
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem("pw_nw_history") || "[]"); } catch { return []; }
}

export default function NetWorthTracker({ profile }) {
  const [history, setHistory] = useState(loadHistory);
  const [goals, setGoals] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pw_goals") || "[]"); } catch { return []; }
  });
  const [newGoal, setNewGoal] = useState("");
  const [newGoalAmt, setNewGoalAmt] = useState(0);

  const current = calcNW(profile);
  const today = new Date().toISOString().split("T")[0];

  // Snapshot current net worth
  const snapshot = () => {
    const entry = { date: today, ...current, salary: profile.salary || 0 };
    const updated = [...history.filter(h => h.date !== today), entry].sort((a,b) => a.date.localeCompare(b.date));
    setHistory(updated);
    localStorage.setItem("pw_nw_history", JSON.stringify(updated));
  };

  // Auto-snapshot on load if no entry today
  useEffect(() => {
    if (!history.find(h => h.date === today) && current.nw !== 0) snapshot();
  }, []);

  const chartData = useMemo(() => {
    if (history.length < 2) {
      // Generate synthetic history from current data
      return Array.from({ length: 12 }, (_, i) => {
        const mo = 11 - i;
        const growth = Math.pow(0.993, mo); // ~7% annual decline backwards
        return {
          date: new Date(Date.now() - mo * 30 * 86400000).toLocaleDateString("en-US", { month:"short", year:"2-digit" }),
          nw: Math.round(current.nw * growth),
          assets: Math.round(current.assets * growth),
          debt: Math.round(current.debt * (1 + mo * 0.003)),
        };
      });
    }
    return history.map(h => ({
      date: new Date(h.date).toLocaleDateString("en-US", { month:"short", year:"2-digit" }),
      nw: h.nw, assets: h.assets, debt: h.debt,
    }));
  }, [history, current]);

  const monthChange = history.length >= 2 ? current.nw - history[history.length - 2]?.nw : 0;
  const allTimeChange = history.length >= 2 ? current.nw - history[0]?.nw : 0;

  // Goals
  const addGoal = () => {
    if (!newGoal || !newGoalAmt) return;
    const updated = [...goals, { name: newGoal, target: +newGoalAmt, created: today }];
    setGoals(updated);
    localStorage.setItem("pw_goals", JSON.stringify(updated));
    setNewGoal(""); setNewGoalAmt(0);
  };

  const removeGoal = (idx) => {
    const updated = goals.filter((_, i) => i !== idx);
    setGoals(updated);
    localStorage.setItem("pw_goals", JSON.stringify(updated));
  };

  return (
    <div className="space-y-5 animate-in">
      <Section title="Net Worth Tracker" sub="Track Progress Over Time" />

      <div className="grid grid-cols-4 gap-2">
        <Stat label="Net Worth" value={fmt(current.nw)} color={current.nw >= 0 ? "#34d399" : "#f87171"} />
        <Stat label="Total Assets" value={fmt(current.assets)} color="#60a5fa" />
        <Stat label="Total Debt" value={fmt(current.debt)} color="#f87171" />
        <Stat label="Monthly Change" value={`${monthChange >= 0 ? "+" : ""}${fN(monthChange)}`} color={monthChange >= 0 ? "#34d399" : "#f87171"} />
      </div>

      {/* Net worth chart */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-white/50 uppercase tracking-widest">Net Worth History</p>
          <button onClick={snapshot} className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-bold">
            Snapshot Today
          </button>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="nwHist" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity={0.3}/><stop offset="100%" stopColor="#34d399" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)"/>
            <XAxis dataKey="date" tick={{ fontSize:11, fill:"rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:10, fill:"rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1e6).toFixed(1)}M`}/>
            <Tooltip content={<Tip/>}/>
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)"/>
            <Area type="monotone" dataKey="nw" name="Net Worth" stroke="#34d399" fill="url(#nwHist)" strokeWidth={2.5} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-xs text-white/40 mt-1">{history.length} snapshots | All-time change: {allTimeChange >= 0 ? "+" : ""}{fN(allTimeChange)}</p>
      </Card>

      {/* Asset/Debt breakdown */}
      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Breakdown</p>
        <div className="space-y-2">
          {[
            { l:"Savings", v:profile.savings||0, c:"#34d399" },
            { l:"Retirement", v:profile.retirement||0, c:"#60a5fa" },
            { l:"Investments", v:profile.investments||0, c:"#a78bfa" },
            { l:"HSA", v:profile.hsa||0, c:"#fbbf24" },
            { l:"529", v:profile.plan529||0, c:"#f472b6" },
            { l:"Home Equity", v:Math.max(0,(profile.homeValue||0)-(profile.mortgageBalance||0)), c:"#818cf8" },
            { l:"Rental Equity", v:profile.rentalPropertyEquity||0, c:"#fbbf24" },
          ].filter(a => a.v > 0).map((a, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:a.c }} />
              <span className="text-sm text-white/55 flex-1">{a.l}</span>
              <span className="text-sm font-bold tabular-nums" style={{ color:a.c }}>{fN(a.v)}</span>
              <div className="w-24 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width:`${Math.min(100,(a.v/current.assets)*100)}%`, background:a.c, opacity:0.5 }} />
              </div>
            </div>
          ))}
          <div className="border-t border-white/[0.05] pt-2 mt-2">
            {[
              { l:"Student Loans", v:profile.loans||0 },
              { l:"Mortgage", v:profile.mortgageBalance||0 },
              { l:"Car Loan", v:profile.carLoan||0 },
              { l:"Credit Card", v:profile.creditCardDebt||0 },
            ].filter(d => d.v > 0).map((d, i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <div className="w-2 h-2 rounded-full flex-shrink-0 bg-red-400" />
                <span className="text-sm text-white/55 flex-1">{d.l}</span>
                <span className="text-sm font-bold tabular-nums text-red-400/80">-{fN(d.v)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Financial Goals */}
      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Financial Goals</p>
        <div className="space-y-2 mb-3">
          {goals.map((g, i) => {
            const pct = Math.min(100, Math.round((current.nw / g.target) * 100));
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-white/55">{g.name}</span>
                    <span className="text-xs text-white/40">{pct}% of {fmt(g.target)}</span>
                  </div>
                  <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, background: pct >= 100 ? "#34d399" : "#60a5fa" }} />
                  </div>
                </div>
                <button onClick={() => removeGoal(i)} className="text-xs text-red-400/50 hover:text-red-400">X</button>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input value={newGoal} onChange={e => setNewGoal(e.target.value)} placeholder="Goal name"
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/55 outline-none" />
          <input value={newGoalAmt || ""} onChange={e => setNewGoalAmt(+e.target.value)} placeholder="$" type="number"
            className="w-28 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/55 outline-none" />
          <Btn onClick={addGoal} variant="secondary">Add</Btn>
        </div>
      </Card>

      {current.nw < 0 && <Alert type="info">Negative net worth is normal for early-career physicians with student debt. Focus on high-interest debt first.</Alert>}
    </div>
  );
}
