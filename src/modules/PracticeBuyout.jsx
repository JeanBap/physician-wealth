import { useState, useMemo } from "react";
import { SPECIALTIES, fmt, fN, pmtCalc } from "../lib/data";
import { Section, Stat, Card, Inp, Alert , Takeaway } from "../components/ui";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { chartGrid, chartText } from "../lib/chartColors";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/75 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>);
};

export default function PracticeBuyout({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [revenue, setRevenue] = useState(1200000);
  const [multiple, setMultiple] = useState(0.8);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(7);
  const [term, setTerm] = useState(10);

  const price = Math.round(revenue * multiple);
  const down = Math.round(price * downPct / 100);
  const loan = price - down;
  const monthlyPmt = Math.round(pmtCalc(loan, rate, term * 12));
  const annualDebt = monthlyPmt * 12;
  const netProfit = Math.round(revenue * 0.35);
  const netAfterDebt = netProfit - annualDebt;
  const roi = down > 0 ? ((netAfterDebt / down) * 100).toFixed(0) : "N/A";
  const payback = netAfterDebt > 0 ? (price / netAfterDebt).toFixed(1) : "N/A";
  const totalInterest = Math.round(monthlyPmt * term * 12 - loan);

  // 10-year projection
  const projection = useMemo(() => {
    let equity = 0, cumNet = 0, loanBal = loan;
    return Array.from({ length: term + 1 }, (_, yr) => {
      const d = { year: yr, equity: Math.round(equity), cumIncome: Math.round(cumNet), loanBalance: Math.round(loanBal) };
      equity += price * 0.05;
      cumNet += netAfterDebt;
      loanBal = Math.max(0, loanBal - (annualDebt - loanBal * rate / 100));
      return d;
    });
  }, [loan, price, netAfterDebt, annualDebt, rate, term]);

  return (
    <div className="space-y-5 animate-in">
      <Section title="Practice Buyout" sub="Acquisition Calculator" />
      <div className="grid grid-cols-2 gap-2">
        <Inp label="Annual revenue" value={revenue} onChange={setRevenue} type="number" pre="$" />
        <Inp label="Revenue multiple" value={multiple} onChange={setMultiple} type="number" />
        <Inp label="Down payment %" value={downPct} onChange={setDownPct} type="number" />
        <Inp label="Loan rate %" value={rate} onChange={setRate} type="number" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Purchase price" value={fmt(price)} color="#60a5fa" />
        <Stat label="Annual ROI" value={`${roi}%`} color={+roi > 20 ? "#34d399" : "#fbbf24"} />
        <Stat label="Payback" value={`${payback} yr`} color="#a78bfa" />
      </div>

      {/* Projection chart */}
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-1">{term}-Year Ownership Projection</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={projection}>
            <defs>
              <linearGradient id="eqG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity={0.3}/><stop offset="100%" stopColor="#34d399" stopOpacity={0}/></linearGradient>
              <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa" stopOpacity={0.2}/><stop offset="100%" stopColor="#60a5fa" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid()}/>
            <XAxis dataKey="year" tick={{ fontSize:9, fill:chartText() }} axisLine={false} tickLine={false} label={{ value:"Year", position:"insideBottom", offset:-5, fontSize:8, fill:chartText() }}/>
            <YAxis tick={{ fontSize:9, fill:chartText() }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1e6).toFixed(1)}M`}/>
            <Tooltip content={<Tip/>}/>
            <Area type="monotone" dataKey="cumIncome" name="Cumulative Income" stroke="#60a5fa" fill="url(#incG)" strokeWidth={2} dot={false}/>
            <Area type="monotone" dataKey="equity" name="Equity Buildup" stroke="#34d399" fill="url(#eqG)" strokeWidth={2} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-2">Deal Summary</p>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-white/65">Down payment</span><span className="text-white/65">{fmt(down)}</span></div>
          <div className="flex justify-between"><span className="text-white/65">Loan amount</span><span className="text-white/65">{fmt(loan)}</span></div>
          <div className="flex justify-between"><span className="text-white/65">Monthly payment</span><span className="text-white/65">{fN(monthlyPmt)}</span></div>
          <div className="flex justify-between"><span className="text-white/65">Total interest</span><span className="text-red-400/80">{fN(totalInterest)}</span></div>
          <div className="flex justify-between"><span className="text-white/65">Net profit (35% margin)</span><span className="text-white/65">{fmt(netProfit)}/yr</span></div>
          <div className="flex justify-between border-t border-white/[0.05] pt-1.5 mt-1.5">
            <span className="text-white/65 font-bold">Net after debt service</span>
            <span className={`font-bold ${netAfterDebt > 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(netAfterDebt)}/yr</span>
          </div>
        </div>
      </Card>

      <Alert type="info">Typical medical practice multiples: 0.5-1.2x revenue. Higher for recurring revenue specialties (derm, pain, ophthalmology).</Alert>

      <Takeaway items={[
        `${fmt(price)} practice nets ${fmt(netAfterDebt)}/yr after debt service. ROI: ${roi}%.`,
        `Payback: ${payback} years. ${+payback < 5 ? "Excellent deal." : +payback < 8 ? "Reasonable." : "Long payback. Negotiate lower price."}`,
        `Total interest: ${fN(totalInterest)} over ${term} years. Consider SBA 7(a) for better physician terms.`,
      ]} />
    </div>
  );
}
