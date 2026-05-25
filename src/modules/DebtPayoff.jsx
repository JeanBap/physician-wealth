import { useState, useMemo } from "react";
import { fmt, fN, pmtCalc } from "../lib/data";
import { Section, Stat, Card, Alert, Takeaway } from "../components/ui";
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { chartGrid, chartText } from "../lib/chartColors";
const Tip=({active,payload,label})=>{if(!active||!payload?.length)return null;return(<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/50 mb-1">{label}</p>{payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>)};

export default function DebtPayoff({ profile }) {
  const [debts, setDebts] = useState([
    { id:1, name:"Student Loans", balance:profile.loans||250000, rate:6.8, minPayment:2800 },
    ...(profile.mortgageBalance > 0 ? [{ id:2, name:"Mortgage", balance:profile.mortgageBalance, rate:6.5, minPayment:Math.round(pmtCalc(profile.mortgageBalance,6.5,360)) }] : []),
    ...(profile.carLoan > 0 ? [{ id:3, name:"Car Loan", balance:profile.carLoan, rate:5.5, minPayment:Math.round(pmtCalc(profile.carLoan,5.5,60)) }] : []),
    ...(profile.creditCardDebt > 0 ? [{ id:4, name:"Credit Card", balance:profile.creditCardDebt, rate:22.0, minPayment:Math.round(profile.creditCardDebt*0.03) }] : []),
  ].filter(d => d.balance > 0));
  const [extraMonthly, setExtraMonthly] = useState(1000);
  const [strategy, setStrategy] = useState("avalanche"); // avalanche | snowball

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalMinPayment = debts.reduce((s, d) => s + d.minPayment, 0);

  const simulation = useMemo(() => {
    const sorted = [...debts].sort((a, b) => strategy === "avalanche" ? b.rate - a.rate : a.balance - b.balance);
    let balances = sorted.map(d => ({ ...d, bal: d.balance }));
    const timeline = [];
    let month = 0;
    let totalInterest = 0;

    while (balances.some(d => d.bal > 0) && month < 600) {
      let extra = extraMonthly;
      let monthData = { month, total: 0 };
      
      for (const d of balances) {
        if (d.bal <= 0) { monthData[d.name] = 0; continue; }
        const interest = d.bal * d.rate / 1200;
        totalInterest += interest;
        let payment = d.minPayment + (balances.indexOf(d) === balances.findIndex(x => x.bal > 0) ? extra : 0);
        payment = Math.min(payment, d.bal + interest);
        d.bal = Math.max(0, d.bal + interest - payment);
        monthData[d.name] = Math.round(d.bal);
        monthData.total += Math.round(d.bal);
      }
      
      if (month % 3 === 0) timeline.push(monthData);
      month++;
    }

    // Compare: minimum payments only
    let minBalances = debts.map(d => ({ ...d, bal: d.balance }));
    let minMonths = 0, minInterest = 0;
    while (minBalances.some(d => d.bal > 0) && minMonths < 600) {
      for (const d of minBalances) {
        if (d.bal <= 0) continue;
        const interest = d.bal * d.rate / 1200;
        minInterest += interest;
        d.bal = Math.max(0, d.bal + interest - d.minPayment);
      }
      minMonths++;
    }

    return { timeline, months: month, totalInterest: Math.round(totalInterest), minMonths, minInterest: Math.round(minInterest), saved: Math.round(minInterest - totalInterest), monthsSaved: minMonths - month };
  }, [debts, extraMonthly, strategy]);

  const debtColors = ["#f87171","#fbbf24","#a78bfa","#60a5fa","#f472b6"];

  return (
    <div className="space-y-5 animate-in">
      <Section title="Debt Payoff Visualizer" sub="Avalanche vs Snowball" />
      <div className="grid grid-cols-4 gap-2">
        <Stat label="Total debt" value={fmt(totalDebt)} color="#f87171" />
        <Stat label="Payoff in" value={`${Math.round(simulation.months/12*10)/10} yr`} color="#34d399" />
        <Stat label="Interest saved" value={fmt(simulation.saved)} sub={`vs min payments`} color="#34d399" />
        <Stat label="Months saved" value={simulation.monthsSaved} color="#60a5fa" />
      </div>

      <div className="flex gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/[0.05]">
        {[{id:"avalanche",l:"Avalanche (highest rate first)"},{id:"snowball",l:"Snowball (smallest balance first)"}].map(s => (
          <button key={s.id} onClick={() => setStrategy(s.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition ${strategy===s.id?"bg-white/[0.06] text-white/75":"text-white/55"}`}>
            {s.l}
          </button>
        ))}
      </div>

      <Card>
        <p className="text-xs text-white/50 mb-1">Extra monthly payment toward debt</p>
        <input type="range" min="0" max="5000" step="100" value={extraMonthly}
          onChange={e => setExtraMonthly(+e.target.value)} className="w-full" style={{ accentColor:"#34d399" }} />
        <div className="flex justify-between text-sm text-white/55">
          <span>+${extraMonthly.toLocaleString()}/mo extra</span>
          <span>Total: ${(totalMinPayment + extraMonthly).toLocaleString()}/mo</span>
        </div>
      </Card>

      {/* Debt payoff chart */}
      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Debt Balance Over Time</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={simulation.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid()}/>
            <XAxis dataKey="month" tick={{fontSize:10,fill:chartText()}} axisLine={false} tickLine={false} tickFormatter={v=>`${Math.round(v/12)}yr`}/>
            <YAxis tick={{fontSize:10,fill:chartText()}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
            <Tooltip content={<Tip/>}/>
            {debts.map((d,i) => (
              <Area key={d.id} type="monotone" dataKey={d.name} name={d.name} stackId="1" stroke={debtColors[i]} fill={debtColors[i]} fillOpacity={0.3} strokeWidth={0}/>
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Individual debts */}
      <div className="space-y-2">
        {debts.sort((a,b) => strategy==="avalanche" ? b.rate-a.rate : a.balance-b.balance).map((d, i) => (
          <Card key={d.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-8 rounded-full" style={{background:debtColors[i]}} />
                <div>
                  <p className="text-sm text-white/65 font-bold">{d.name} {i===0 && <span className="text-emerald-400 text-xs ml-1">Target</span>}</p>
                  <p className="text-xs text-white/50">{d.rate}% APR | Min: {fN(d.minPayment)}/mo</p>
                </div>
              </div>
              <p className="text-lg font-black text-red-400/80 tabular-nums">{fmt(d.balance)}</p>
            </div>
          </Card>
        ))}
      </div>

      <Takeaway items={[
        `${strategy === "avalanche" ? "Avalanche" : "Snowball"} strategy: debt-free in ${Math.round(simulation.months/12*10)/10} years. Saves ${fmt(simulation.saved)} in interest vs minimum payments.`,
        `Extra ${fN(extraMonthly)}/mo accelerates payoff by ${simulation.monthsSaved} months (${(simulation.monthsSaved/12).toFixed(1)} years).`,
        `${strategy === "avalanche" ? "Avalanche targets highest-rate debt first. Mathematically optimal." : "Snowball targets smallest balance first. Psychologically motivating."} ${debts.find(d=>d.rate>15) ? "Credit card debt at "+debts.find(d=>d.rate>15).rate+"% should always be first regardless of strategy." : ""}`,
      ]} />
    </div>
  );
}
