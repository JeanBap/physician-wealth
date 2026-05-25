import { useState, useMemo } from "react";
import { fmt, fN, pmtCalc } from "../lib/data";
import { Section, Stat, Card, Inp, Alert , Takeaway } from "../components/ui";
import { AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { chartGrid, chartText } from "../lib/chartColors";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/75 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>);
};

const PROPERTY_TYPES = [
  { v:"sfr", l:"Single Family Rental" },
  { v:"multi", l:"Multi-Family (2-4 unit)" },
  { v:"syndication", l:"Syndication/Fund" },
  { v:"reit", l:"REIT (Passive)" },
];

export default function RealEstate({ profile }) {
  const [propType, setPropType] = useState("sfr");
  const [purchasePrice, setPurchasePrice] = useState(400000);
  const [downPct, setDownPct] = useState(25);
  const [mortgageRate, setMortgageRate] = useState(6.5);
  const [monthlyRent, setMonthlyRent] = useState(2800);
  const [expenses, setExpenses] = useState(35); // % of rent
  const [appreciation, setAppreciation] = useState(3);

  const down = Math.round(purchasePrice * downPct / 100);
  const loan = purchasePrice - down;
  const monthlyMortgage = Math.round(pmtCalc(loan, mortgageRate, 360));
  const monthlyExpenses = Math.round(monthlyRent * expenses / 100);
  const monthlyCashFlow = monthlyRent - monthlyMortgage - monthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;
  const capRate = purchasePrice > 0 ? (((monthlyRent - monthlyExpenses) * 12 / purchasePrice) * 100).toFixed(1) : 0;
  const cashOnCash = down > 0 ? ((annualCashFlow / down) * 100).toFixed(1) : 0;
  const annualDepreciation = Math.round(purchasePrice * 0.8 / 27.5); // residential depreciation
  const taxShield = Math.round(annualDepreciation * 0.37); // top bracket

  // 10-year projection
  const projection = useMemo(() => {
    let equity = down, cumCash = 0, propVal = purchasePrice, loanBal = loan;
    return Array.from({ length: 11 }, (_, yr) => {
      const d = { year: yr, equity: Math.round(equity), cashFlow: Math.round(cumCash), value: Math.round(propVal) };
      propVal *= (1 + appreciation / 100);
      const annualPrincipal = Math.round(monthlyMortgage * 12 * 0.2 * (1 + yr * 0.03)); // rough principal paydown
      equity = propVal - loanBal + annualPrincipal * yr;
      cumCash += annualCashFlow;
      return d;
    });
  }, [purchasePrice, down, loan, appreciation, annualCashFlow, monthlyMortgage]);

  const incomeData = [
    { name: "Rent", value: monthlyRent, color: "#34d399" },
    { name: "Mortgage", value: monthlyMortgage, color: "#f87171" },
    { name: "Expenses", value: monthlyExpenses, color: "#fbbf24" },
    { name: "Cash Flow", value: Math.max(0, monthlyCashFlow), color: "#60a5fa" },
  ];

  // Syndication comparison
  const compareData = [
    { name: "Direct SFR", cashReturn: +cashOnCash, effort: "High", minInvest: fN(down), tax: "Depreciation" },
    { name: "Syndication", cashReturn: 8, effort: "None", minInvest: "$50K-100K", tax: "K-1 losses" },
    { name: "REIT", cashReturn: 5, effort: "None", minInvest: "$100", tax: "Ordinary income" },
    { name: "Crowdfund", cashReturn: 7, effort: "Low", minInvest: "$5K-25K", tax: "Mixed" },
  ];

  return (
    <div className="space-y-5 animate-in">
      <Section title="Real Estate Investments" sub="Property Analysis & ROI" />

      <div className="grid grid-cols-2 gap-2">
        <Inp label="Property type" value={propType} onChange={setPropType} options={PROPERTY_TYPES} />
        <Inp label="Purchase price" value={purchasePrice} onChange={setPurchasePrice} type="number" pre="$" />
        <Inp label="Down payment %" value={downPct} onChange={setDownPct} type="number" />
        <Inp label="Mortgage rate %" value={mortgageRate} onChange={setMortgageRate} type="number" />
        <Inp label="Monthly rent" value={monthlyRent} onChange={setMonthlyRent} type="number" pre="$" />
        <Inp label="Expenses (% of rent)" value={expenses} onChange={setExpenses} type="number" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Stat label="Monthly cash flow" value={fN(monthlyCashFlow)} color={monthlyCashFlow > 0 ? "#34d399" : "#f87171"} />
        <Stat label="Cap rate" value={`${capRate}%`} color={+capRate > 6 ? "#34d399" : "#fbbf24"} />
        <Stat label="Cash-on-cash" value={`${cashOnCash}%`} color={+cashOnCash > 8 ? "#34d399" : "#fbbf24"} />
        <Stat label="Tax shield" value={fN(taxShield)} sub="/yr depreciation" color="#a78bfa" />
      </div>

      {/* Monthly breakdown */}
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-1">Monthly Breakdown</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={incomeData} barCategoryGap="20%">
            <XAxis dataKey="name" tick={{ fontSize:10, fill:chartText() }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:9, fill:chartText() }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(1)}K`}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="value" name="Amount" radius={[4,4,0,0]}>{incomeData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 10-year equity + cash flow projection */}
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-1">10-Year Projection</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={projection}>
            <defs>
              <linearGradient id="eqRe" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity={0.3}/><stop offset="100%" stopColor="#34d399" stopOpacity={0}/></linearGradient>
              <linearGradient id="cfRe" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa" stopOpacity={0.2}/><stop offset="100%" stopColor="#60a5fa" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid()}/>
            <XAxis dataKey="year" tick={{ fontSize:10, fill:chartText() }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:9, fill:chartText() }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1e6).toFixed(1)}M`}/>
            <Tooltip content={<Tip/>}/>
            <Area type="monotone" dataKey="value" name="Property Value" stroke="#fbbf24" fill="none" strokeWidth={1.5} strokeDasharray="4 4" dot={false}/>
            <Area type="monotone" dataKey="equity" name="Equity" stroke="#34d399" fill="url(#eqRe)" strokeWidth={2} dot={false}/>
            <Area type="monotone" dataKey="cashFlow" name="Cum. Cash Flow" stroke="#60a5fa" fill="url(#cfRe)" strokeWidth={2} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Investment comparison */}
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-2">Investment Vehicle Comparison</p>
        <div className="space-y-1.5">
          {compareData.map((c, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
              <div>
                <p className="text-sm text-white/65 font-medium">{c.name}</p>
                <p className="text-xs text-white/55">Min: {c.minInvest} | Effort: {c.effort} | Tax: {c.tax}</p>
              </div>
              <span className="text-sm font-bold text-emerald-400 tabular-nums">{c.cashReturn}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Physician-specific RE strategies */}
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-2">Physician RE Strategies</p>
        <div className="space-y-2">
          {[
            { name: "Physician Mortgage (0% down)", desc: "No PMI, 100% financing for MDs. Chase, BofA, SoFi offer these.", color: "#34d399" },
            { name: "Cost Segregation Study", desc: "Accelerate depreciation to front-load tax deductions in year 1. Save $20-80K on $500K+ properties.", color: "#60a5fa" },
            { name: "Real Estate Professional Status", desc: "If spouse qualifies (750+ hrs), RE losses offset W-2 income. Massive tax savings.", color: "#a78bfa" },
            { name: "1031 Exchange", desc: "Defer capital gains by rolling into a like-kind property within 180 days.", color: "#fbbf24" },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-8 rounded-full flex-shrink-0 mt-1" style={{ background: s.color, opacity: 0.5 }} />
              <div><p className="text-sm text-white/65 font-medium">{s.name}</p><p className="text-xs text-white/55">{s.desc}</p></div>
            </div>
          ))}
        </div>
      </Card>

      {monthlyCashFlow < 0 && <Alert type="danger">Negative cash flow of {fN(Math.abs(monthlyCashFlow))}/mo. This property loses money monthly. Increase rent or reduce purchase price.</Alert>}
      {+capRate < 5 && monthlyCashFlow > 0 && <Alert type="warn">Cap rate below 5%. Acceptable for appreciation markets but not ideal for cash flow.</Alert>}
      {+cashOnCash > 10 && <Alert type="success">Strong cash-on-cash return of {cashOnCash}%. This deal looks solid.</Alert>}

      <Takeaway items={[
        `${monthlyCashFlow > 0 ? `Positive cash flow: ${fN(monthlyCashFlow)}/mo (${cashOnCash}% CoC).` : `Negative cash flow: ${fN(Math.abs(monthlyCashFlow))}/mo. Rethink this deal.`}`,
        `Cap rate: ${capRate}%. ${+capRate > 7 ? "Cash flow market." : +capRate > 5 ? "Balanced." : "Appreciation play."}`,
        `Depreciation shields ${fN(taxShield)}/yr from taxes. Physician mortgage = 0% down, no PMI.`,
      ]} />
    </div>
  );
}
