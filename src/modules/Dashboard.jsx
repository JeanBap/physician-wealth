import { useState, useEffect, useMemo, useRef } from "react";
import { SPECIALTIES, MODULES, STATE_TAX, STATE_NAMES, fedTax, fica, fmt, fN } from "../lib/data";
import { Card, Donut, Badge } from "../components/ui";
import FICountdown from "./FICountdown";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

// Theme
const C = {
  emerald: "#34d399", emeraldDim: "#34d39940", emeraldGlow: "#34d39915",
  blue: "#60a5fa", blueDim: "#60a5fa40",
  purple: "#a78bfa", purpleDim: "#a78bfa40",
  amber: "#fbbf24", amberDim: "#fbbf2440",
  red: "#f87171", redDim: "#f8717140",
  pink: "#f472b6",
  grid: "rgba(255,255,255,0.03)", axis: "rgba(255,255,255,0.08)",
  text: "rgba(255,255,255,0.3)", textDim: "rgba(255,255,255,0.12)",
  bg: "#0d0e14", card: "rgba(255,255,255,0.025)", border: "rgba(255,255,255,0.05)",
};

const ChartTooltip = ({ active, payload, label, prefix = "$" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl">
      <p className="text-[9px] text-white/30 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[11px] font-bold" style={{ color: p.color }}>
          {p.name}: {prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard({ profile, navigate }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const sal = profile.salary || spec.m;
  const state = profile.state || "NY";
  const savings = profile.savings || 50000;
  const retirement = profile.retirement || 100000;
  const investments = profile.investments || 80000;
  const loans = profile.loans || 250000;
  const netWorth = savings + retirement + investments - loans;
  const totalTax = fedTax(sal, profile.married) + Math.round(sal * (STATE_TAX[state] || 0)) + Math.round(fica(sal));
  const takeHome = sal - totalTax;
  const fiTarget = sal * 0.6 / 0.04;
  const fiPct = Math.min(100, Math.round((netWorth / fiTarget) * 100));
  const savingsRate = 20;
  const annualSave = sal * 0.2;
  const sorted = Object.entries(SPECIALTIES).sort((a, b) => b[1].m - a[1].m);
  const rank = sorted.findIndex(([k]) => k === profile.specialty) + 1;
  const printRef = useRef(null);

  // Wealth projection (10 years)
  const wealthProjection = useMemo(() => {
    let bal = netWorth;
    return Array.from({ length: 11 }, (_, i) => {
      const d = { year: `${new Date().getFullYear() + i}`, netWorth: Math.round(bal), fi: fiTarget };
      bal = bal * 1.07 + annualSave;
      return d;
    });
  }, [netWorth, fiTarget, annualSave]);

  // Monthly cash flow
  const monthlyFlow = useMemo(() => {
    const mo = Math.round(takeHome / 12);
    const housing = Math.round(mo * 0.28);
    const loanPmt = loans > 0 ? Math.round(loans * 0.068 / 12 + loans / 120) : 0;
    const living = Math.round(mo * 0.2);
    const save = Math.round(mo * 0.25);
    const disc = mo - housing - loanPmt - living - save;
    return [
      { name: "Housing", value: housing, color: C.blue },
      { name: "Loans", value: loanPmt, color: C.red },
      { name: "Living", value: living, color: C.amber },
      { name: "Savings", value: save, color: C.emerald },
      { name: "Discretionary", value: Math.max(0, disc), color: C.purple },
    ];
  }, [takeHome, loans]);

  // Tax breakdown
  const taxData = useMemo(() => {
    const f = fedTax(sal, profile.married);
    const s = Math.round(sal * (STATE_TAX[state] || 0));
    const fc = Math.round(fica(sal));
    return [
      { name: "Federal", value: f, color: C.red },
      { name: "State", value: s, color: C.amber },
      { name: "FICA", value: fc, color: C.blue },
      { name: "Take-Home", value: sal - f - s - fc, color: C.emerald },
    ];
  }, [sal, state, profile.married]);

  // Specialty comparison (top 8)
  const specComp = useMemo(() =>
    sorted.slice(0, 8).map(([k, s]) => ({
      name: k.length > 12 ? k.slice(0, 11) + "." : k,
      salary: s.m / 1000,
      yours: k === profile.specialty,
    })), [profile.specialty]);

  // Financial health radar
  const healthRadar = useMemo(() => {
    const debtRatio = loans > 0 ? Math.max(0, 100 - (loans / sal) * 100) : 100;
    const saveScore = Math.min(100, savingsRate * 5);
    const taxEff = Math.min(100, ((sal - totalTax) / sal) * 120);
    const insScore = 75; // placeholder
    const retireScore = Math.min(100, fiPct * 1.5);
    const emergScore = Math.min(100, (savings / (takeHome / 12 * 6)) * 100);
    return [
      { metric: "Debt Mgmt", score: Math.round(debtRatio), max: 100 },
      { metric: "Savings", score: Math.round(saveScore), max: 100 },
      { metric: "Tax Efficiency", score: Math.round(taxEff), max: 100 },
      { metric: "Insurance", score: insScore, max: 100 },
      { metric: "Retirement", score: Math.round(retireScore), max: 100 },
      { metric: "Emergency Fund", score: Math.round(emergScore), max: 100 },
    ];
  }, [loans, sal, totalTax, fiPct, savings, takeHome]);

  const healthScore = Math.round(healthRadar.reduce((s, h) => s + h.score, 0) / healthRadar.length);

  // Income vs peers (monthly trend, simulated)
  const peerTrend = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months.map((m, i) => ({
      month: m,
      you: Math.round(sal / 12 + (Math.sin(i * 0.8) * sal * 0.02)),
      median: Math.round(spec.m / 12),
      p75: Math.round(spec.hi / 12),
    }));
  }, [sal, spec]);

  // Action items
  const today = new Date();
  const actions = useMemo(() => {
    const items = [];
    if (loans > 200000) items.push({ priority: "high", action: "Review PSLF eligibility", desc: `${fN(loans)} in student loans. Could save ${fN(Math.round(loans * 0.4))} through forgiveness.`, due: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7), module: "loans" });
    if (savingsRate < 20) items.push({ priority: "high", action: "Increase savings rate to 20%", desc: `Currently at ${savingsRate}%. Missing ${fN(Math.round(sal * 0.05))} annual savings.`, due: new Date(today.getFullYear(), today.getMonth() + 1, 1), module: "spending" });
    items.push({ priority: "high", action: "Upload tax return for AI analysis", desc: `Physicians overpay avg $15-50K/yr. AI scans twice for missed deductions.`, due: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3), module: "tax" });
    if (STATE_TAX[state] > 0.05) items.push({ priority: "medium", action: "Evaluate state tax arbitrage", desc: `${STATE_NAMES[state]} rate: ${(STATE_TAX[state]*100).toFixed(1)}%. Could save ${fN(Math.round(sal * STATE_TAX[state]))} moving to 0% state.`, due: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14), module: "statemove" });
    items.push({ priority: "medium", action: "Review disability coverage", desc: `${profile.specialty} burnout rate: ${spec.burn}%. Own-occupation DI is critical.`, due: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 21), module: "disability" });
    items.push({ priority: "medium", action: "Upload employment contract", desc: "AI double-pass review identifies unfavorable clauses and negotiation leverage.", due: new Date(today.getFullYear(), today.getMonth() + 1, 15), module: "contracts" });
    items.push({ priority: "low", action: "Explore moonlighting income", desc: `Expert witness at $500/hr could add ${fN(Math.round(500 * 4 * 40 * 0.6))}/yr after tax.`, due: new Date(today.getFullYear(), today.getMonth() + 2, 1), module: "moonlight" });
    if (spec.burn > 40) items.push({ priority: "low", action: "Take burnout assessment", desc: `${profile.specialty} has ${spec.burn}% burnout rate. Quantify the hidden financial cost.`, due: new Date(today.getFullYear(), today.getMonth() + 1, 1), module: "burnout" });
    return items;
  }, [loans, sal, state, spec, profile.specialty]);

  // Greeting
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };

  // Animated counter
  const [animNw, setAnimNw] = useState(0);
  useEffect(() => {
    let frame; const start = Date.now(); const dur = 1200;
    const tick = () => { const t = Math.min(1, (Date.now() - start) / dur); setAnimNw(Math.round(netWorth * (1 - Math.pow(1 - t, 3)))); if (t < 1) frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [netWorth]);

  // Print/PDF
  const handlePrint = () => {
    const style = document.createElement("style");
    style.textContent = `@media print { body { background: #0a0b10 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .no-print { display: none !important; } }`;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.head.removeChild(style), 1000);
  };

  const formatDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="space-y-6 animate-in" ref={printRef}>
      {/* Print button */}
      <div className="flex justify-end no-print">
        <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-white/25 hover:text-white/50 hover:bg-white/[0.06] transition">
          <span>Export PDF / Print</span>
        </button>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl p-6" style={{
        background: "radial-gradient(ellipse at 30% 0%, rgba(52,211,153,0.08) 0%, transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)",
        border: `1px solid ${C.border}`
      }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, rgba(52,211,153,0.2), transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full opacity-10" style={{ background: "radial-gradient(circle, rgba(96,165,250,0.15), transparent 70%)" }} />
        <p className="text-[10px] text-white/20 uppercase tracking-[0.15em]">{greeting()}</p>
        <h1 className="text-2xl font-black text-white mt-1" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
          Dr. {profile.lastName || "Physician"}
        </h1>
        <div className="flex items-center gap-3 mt-1.5">
          <Badge color={C.emerald}>{profile.specialty}</Badge>
          <span className="text-[9px] text-white/15">{STATE_NAMES[state] || state}</span>
          <span className="text-[9px] text-white/15">Rank #{rank}/20</span>
        </div>

        {/* Health score */}
        <div className="absolute top-6 right-6 text-center">
          <Donut value={healthScore} max={100} size={64} sw={5} color={healthScore > 70 ? C.emerald : healthScore > 50 ? C.amber : C.red}>
            <p className="text-sm font-black" style={{ color: healthScore > 70 ? C.emerald : healthScore > 50 ? C.amber : C.red }}>{healthScore}</p>
            <p className="text-[5px] text-white/15 uppercase">Health</p>
          </Donut>
        </div>
      </div>

      {/* FI Countdown */}
      <FICountdown profile={profile} />

      {/* AI Executive Summary */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-emerald-400 to-blue-400" />
          <div>
            <p className="text-[9px] text-white/15 uppercase tracking-widest">Financial Summary</p>
            <p className="text-sm font-bold text-white/70" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>Your Situation at a Glance</p>
          </div>
        </div>
        <p className="text-[11px] text-white/40 leading-relaxed">
          As a <span className="text-white/60 font-medium">{profile.specialty}</span> physician earning <span className="text-emerald-400/70 font-bold">{fmt(sal)}</span> in {STATE_NAMES[state] || state}, you rank <span className="text-white/60 font-medium">#{rank} of 20 specialties</span>.
          Your effective tax rate is <span className="text-red-400/70 font-bold">{((totalTax/sal)*100).toFixed(1)}%</span>, leaving {fmt(takeHome)} take-home.
          {loans > 0 && <> Student debt of <span className="text-red-400/70 font-bold">{fmt(loans)}</span> impacts your net worth, currently at <span style={{ color: netWorth >= 0 ? C.emerald : C.red }} className="font-bold">{fmt(netWorth)}</span>.</>}
          {" "}You're <span className="text-emerald-400/70 font-bold">{fiPct}%</span> of the way to financial independence ({fmt(fiTarget)} target).
          {spec.burn > 40 && <> Your specialty has a <span className="text-amber-400/70 font-bold">{spec.burn}% burnout rate</span>, which correlates with higher malpractice risk and divorce probability.</>}
          {" "}Financial health score: <span className="font-bold" style={{ color: healthScore > 70 ? C.emerald : healthScore > 50 ? C.amber : C.red }}>{healthScore}/100</span>.
        </p>
      </Card>

      {/* Key Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Net Worth", value: fmt(animNw), color: netWorth >= 0 ? C.emerald : C.red, sub: `${fiPct}% to FI` },
          { label: "Annual Income", value: fmt(sal), color: C.blue, sub: `#${rank}/20 specialties` },
          { label: "Take-Home", value: fmt(takeHome), color: C.emerald, sub: `${((totalTax/sal)*100).toFixed(0)}% tax rate` },
          { label: "Student Loans", value: fmt(loans), color: loans > 0 ? C.red : C.emerald, sub: loans > 0 ? "Outstanding" : "Debt free" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
            <p className="text-[8px] text-white/15 uppercase tracking-wider">{s.label}</p>
            <p className="text-xl font-black tabular-nums mt-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[8px] text-white/12 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Wealth Projection + Tax Breakdown */}
      <div className="grid grid-cols-5 gap-3">
        {/* Wealth Projection - 3 cols */}
        <Card className="col-span-3">
          <p className="text-[9px] text-white/15 uppercase tracking-widest mb-1">10-Year Wealth Projection</p>
          <p className="text-[8px] text-white/10 mb-3">7% annual return, 20% savings rate</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={wealthProjection}>
              <defs>
                <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.emerald} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={C.emerald} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.amber} stopOpacity={0.1} />
                  <stop offset="100%" stopColor={C.amber} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="year" tick={{ fontSize: 9, fill: C.text }} axisLine={{ stroke: C.axis }} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: C.text }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000000).toFixed(1)}M`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke={C.emerald} fill="url(#nwGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: C.emerald, stroke: "#0d0e14", strokeWidth: 2 }} />
              <Area type="monotone" dataKey="fi" name="FI Target" stroke={C.amber} fill="url(#fiGrad)" strokeWidth={1.5} strokeDasharray="6 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Tax Breakdown Pie - 2 cols */}
        <Card className="col-span-2">
          <p className="text-[9px] text-white/15 uppercase tracking-widest mb-1">Income Allocation</p>
          <p className="text-[8px] text-white/10 mb-2">{fmt(sal)} gross annual</p>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={taxData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value"
                stroke="none" animationBegin={200} animationDuration={800}>
                {taxData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1">
            {taxData.map((d, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: d.color }} />
                <span className="text-[8px] text-white/25">{d.name}: {fN(d.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row 2: Income vs Peers + Monthly Cash Flow */}
      <div className="grid grid-cols-2 gap-3">
        {/* Income vs Peers */}
        <Card>
          <p className="text-[9px] text-white/15 uppercase tracking-widest mb-1">Income vs Peers (Monthly)</p>
          <p className="text-[8px] text-white/10 mb-3">{profile.specialty} benchmarks</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={peerTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="month" tick={{ fontSize: 8, fill: C.text }} axisLine={{ stroke: C.axis }} tickLine={false} />
              <YAxis tick={{ fontSize: 8, fill: C.text }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="you" name="You" stroke={C.emerald} strokeWidth={2.5} dot={false} activeDot={{ r: 3 }} />
              <Line type="monotone" dataKey="median" name="Median" stroke={C.purple} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="p75" name="75th %" stroke={C.amber} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Cash Flow */}
        <Card>
          <p className="text-[9px] text-white/15 uppercase tracking-widest mb-1">Monthly Cash Flow</p>
          <p className="text-[8px] text-white/10 mb-3">{fN(Math.round(takeHome / 12))}/mo take-home</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyFlow} layout="vertical" barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 8, fill: C.text }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: C.text }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Amount" radius={[0, 4, 4, 0]} animationDuration={800}>
                {monthlyFlow.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 3: Financial Health Radar + Specialty Comparison */}
      <div className="grid grid-cols-2 gap-3">
        {/* Financial Health Radar */}
        <Card>
          <p className="text-[9px] text-white/15 uppercase tracking-widest mb-1">Financial Health Radar</p>
          <p className="text-[8px] text-white/10 mb-2">Score: {healthScore}/100</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={healthRadar} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke={C.grid} />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 8, fill: C.text }} />
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
              <Radar name="Score" dataKey="score" stroke={C.emerald} fill={C.emerald} fillOpacity={0.15} strokeWidth={2}
                animationDuration={800} dot={{ r: 3, fill: C.emerald, stroke: "#0d0e14", strokeWidth: 2 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Specialty Comparison */}
        <Card>
          <p className="text-[9px] text-white/15 uppercase tracking-widest mb-1">Specialty Compensation</p>
          <p className="text-[8px] text-white/10 mb-3">Top 8 by median salary ($K)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={specComp} layout="vertical" barCategoryGap="15%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 8, fill: C.text }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fill: C.text }} axisLine={false} tickLine={false} width={85} />
              <Tooltip content={<ChartTooltip prefix="$" />} formatter={v => [`${v}K`, "Median"]} />
              <Bar dataKey="salary" name="Median ($K)" radius={[0, 4, 4, 0]} animationDuration={800}>
                {specComp.map((d, i) => <Cell key={i} fill={d.yours ? C.emerald : "rgba(255,255,255,0.06)"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Wealth Breakdown Donut + Numbers */}
      <Card>
        <p className="text-[9px] text-white/15 uppercase tracking-widest mb-3">Asset Allocation</p>
        <div className="flex items-center gap-6">
          <Donut value={fiPct} max={100} size={110} sw={9} color={C.emerald}>
            <p className="text-xl font-black text-emerald-400">{fiPct}%</p>
            <p className="text-[6px] text-white/12 uppercase">to FI</p>
          </Donut>
          <div className="flex-1 space-y-2.5">
            {[
              { label: "Retirement", value: retirement, color: C.emerald, pct: Math.round(retirement / (savings + retirement + investments) * 100) },
              { label: "Investments", value: investments, color: C.blue, pct: Math.round(investments / (savings + retirement + investments) * 100) },
              { label: "Savings", value: savings, color: C.purple, pct: Math.round(savings / (savings + retirement + investments) * 100) },
              { label: "Student Loans", value: -loans, color: C.red },
            ].map((a, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                    <span className="text-[10px] text-white/30">{a.label}</span>
                  </div>
                  <span className="text-[10px] font-bold tabular-nums" style={{ color: a.color }}>{fN(a.value)}</span>
                </div>
                {a.pct !== undefined && (
                  <div className="ml-4 h-1 bg-white/[0.03] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${a.pct}%`, background: a.color, opacity: 0.5 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Action Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-amber-400 to-red-400" />
            <p className="text-sm font-bold text-white/50" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>Action Plan</p>
          </div>
          <span className="text-[9px] text-white/15">{actions.length} items</span>
        </div>
        <div className="space-y-2">
          {actions.map((a, i) => (
            <button key={i} onClick={() => navigate(a.module)}
              className="w-full text-left p-3.5 rounded-xl border transition hover:scale-[1.005]"
              style={{
                background: a.priority === "high" ? "rgba(248,113,113,0.03)" : a.priority === "medium" ? "rgba(251,191,36,0.03)" : C.card,
                borderColor: a.priority === "high" ? "rgba(248,113,113,0.12)" : a.priority === "medium" ? "rgba(251,191,36,0.08)" : C.border,
              }}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-10 rounded-full" style={{
                    background: a.priority === "high" ? C.red : a.priority === "medium" ? C.amber : C.blue
                  }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-white/60 font-bold truncate">{a.action}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[8px] text-white/15">{formatDate(a.due)}</span>
                      <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        a.priority === "high" ? "bg-red-500/10 text-red-400" : a.priority === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                      }`}>{a.priority}</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-white/20 mt-0.5 leading-relaxed">{a.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Nav */}
      <div className="no-print">
        <p className="text-[8px] text-white/10 uppercase tracking-[0.2em] mb-3">All Modules</p>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(MODULES).filter(([k, m]) => !m.always).map(([k, m]) => (
            <button key={k} onClick={() => navigate(k)}
              className="group p-3 rounded-xl text-center transition-all duration-200 hover:scale-[1.03]"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
              onMouseEnter={e => { e.currentTarget.style.background = `${m.color || C.emerald}10`; e.currentTarget.style.borderColor = `${m.color || C.emerald}25`; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.card; e.currentTarget.style.borderColor = C.border; }}>
              <p className="text-lg mb-1 opacity-20">{m.icon}</p>
              <p className="text-[9px] text-white/25 group-hover:text-white/60 font-medium transition">{m.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Footer timestamp */}
      <p className="text-[7px] text-white/8 text-center pt-4">
        PhysicianWealth Report | Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} | Not financial advice
      </p>
    </div>
  );
}
