import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { SPECIALTIES, MODULES, STATE_TAX, STATE_NAMES, STATE_COL, fedTax, fica, fmt, fN } from "../lib/data";
import { Card, Donut, Badge, Widget } from "../components/ui";
import FICountdown from "./FICountdown";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

// Theme-aware: read CSS vars at render time
const getC = () => {
  const s = getComputedStyle(document.documentElement);
  const v = (n) => s.getPropertyValue(`--${n}`).trim();
  return {
    emerald: v("accent") || "#34d399", blue: v("accent2") || "#60a5fa", purple: v("accent3") || "#a78bfa",
    amber: "#fbbf24", red: "#f87171", pink: "#f472b6",
    grid: v("chartGrid") || "rgba(255,255,255,0.03)",
    axis: v("chartAxis") || "rgba(255,255,255,0.06)",
    text: v("chartText") || "rgba(255,255,255,0.2)",
    bg: v("bg2") || "#0d0e14",
    card: v("card") || "rgba(255,255,255,0.025)",
    border: v("border") || "rgba(255,255,255,0.05)",
  };
};
const C = getC();

const Tip = ({ active, payload, label, pre="$" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"var(--tooltipBg)",border:"1px solid var(--tooltipBorder)"}} className="rounded-lg px-3 py-2 shadow-2xl backdrop-blur-sm">
      <p className="text-xs text-white/75 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {pre}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

const DEFAULT_WIDGETS = [
  { id: "hero", label: "Profile Overview", visible: true },
  { id: "fi", label: "Financial Independence", visible: true },
  { id: "summary", label: "Executive Summary", visible: true },
  { id: "stats", label: "Key Metrics", visible: true },
  { id: "wealthChart", label: "Wealth Projection", visible: true },
  { id: "taxPie", label: "Income Allocation", visible: true },
  { id: "peerLine", label: "Income vs Peers", visible: true },
  { id: "cashFlow", label: "Monthly Cash Flow", visible: true },
  { id: "radar", label: "Financial Health Radar", visible: true },
  { id: "specBar", label: "Specialty Comparison", visible: true },
  { id: "allocation", label: "Asset Allocation", visible: true },
  { id: "actions", label: "Action Plan", visible: true },
  { id: "nav", label: "Module Nav", visible: true },
];

function loadWidgets() {
  try {
    const saved = localStorage.getItem("pw_widgets");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to catch new widgets
      const ids = new Set(parsed.map(w => w.id));
      const merged = [...parsed, ...DEFAULT_WIDGETS.filter(d => !ids.has(d.id))];
      return merged;
    }
  } catch {}
  return DEFAULT_WIDGETS;
}

export default function Dashboard({ profile, navigate }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const sal = profile.salary || spec.m;
  const state = profile.state || "NY";
  const savings = profile.savings || 50000;
  const retirement = profile.retirement || 100000;
  const investments = profile.investments || 80000;
  const loans = profile.loans || 250000;
  const hsa = profile.hsa || 0;
  const plan529 = profile.plan529 || 0;
  const crypto = profile.cryptoAssets || 0;
  const homeEquity = Math.max(0, (profile.homeValue || 0) - (profile.mortgageBalance || 0));
  const rentalEquity = profile.rentalPropertyEquity || 0;
  const totalAssets = savings + retirement + investments + hsa + plan529 + crypto + homeEquity + rentalEquity;
  const totalDebt = loans + (profile.mortgageBalance || 0) + (profile.carLoan || 0) + (profile.creditCardDebt || 0);
  const netWorth = totalAssets - totalDebt;
  const totalIncome = sal + (profile.moonlightIncome || 0) + (profile.rentalIncome || 0);
  const totalTax = fedTax(totalIncome, profile.married) + Math.round(totalIncome * (STATE_TAX[state] || 0)) + Math.round(fica(sal));
  const takeHome = totalIncome - totalTax;
  const swr = (profile.fiWithdrawalRate || 4) / 100;
  const fiTarget = sal * 0.6 / swr;
  const fiPct = Math.min(100, Math.round((netWorth / fiTarget) * 100));
  const annualSave = totalIncome * 0.2;
  const insuranceScore = [profile.hasDI, profile.hasUmbrella, profile.hasLifeInsurance].filter(Boolean).length;
  const estateScore = [profile.hasWill, profile.hasTrust, profile.hasPOA, profile.hasHealthcareDirective].filter(Boolean).length;
  const sorted = Object.entries(SPECIALTIES).sort((a, b) => b[1].m - a[1].m);
  const rank = sorted.findIndex(([k]) => k === profile.specialty) + 1;
  const printRef = useRef(null);

  const [widgets, setWidgets] = useState(loadWidgets);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    try { localStorage.setItem("pw_widgets", JSON.stringify(widgets)); } catch {}
  }, [widgets]);

  const moveWidget = useCallback((idx, dir) => {
    setWidgets(prev => {
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }, []);

  const toggleWidget = useCallback((idx) => {
    setWidgets(prev => prev.map((w, i) => i === idx ? { ...w, visible: !w.visible } : w));
  }, []);

  const isVis = (id) => widgets.find(w => w.id === id)?.visible !== false;

  // Data computations
  const wealthProjection = useMemo(() => {
    let bal = netWorth;
    return Array.from({ length: 11 }, (_, i) => {
      const d = { year: `${new Date().getFullYear() + i}`, netWorth: Math.round(bal), fi: fiTarget };
      bal = bal * 1.07 + annualSave;
      return d;
    });
  }, [netWorth, fiTarget, annualSave]);

  const monthlyFlow = useMemo(() => {
    const mo = Math.round(takeHome / 12);
    const housing = Math.round(mo * 0.28);
    const loanPmt = loans > 0 ? Math.round(loans * 0.068 / 12 + loans / 120) : 0;
    const living = Math.round(mo * 0.2);
    const save = Math.round(mo * 0.25);
    return [
      { name: "Housing", value: housing, color: C.blue },
      { name: "Loans", value: loanPmt, color: C.red },
      { name: "Living", value: living, color: C.amber },
      { name: "Savings", value: save, color: C.emerald },
      { name: "Discretionary", value: Math.max(0, mo - housing - loanPmt - living - save), color: C.purple },
    ];
  }, [takeHome, loans]);

  const taxData = useMemo(() => {
    const f = fedTax(sal, profile.married); const s = Math.round(sal * (STATE_TAX[state] || 0)); const fc = Math.round(fica(sal));
    return [{ name:"Federal",value:f,color:C.red },{ name:"State",value:s,color:C.amber },{ name:"FICA",value:fc,color:C.blue },{ name:"Take-Home",value:sal-f-s-fc,color:C.emerald }];
  }, [sal, state, profile.married]);

  const specComp = useMemo(() => sorted.slice(0, 8).map(([k, s]) => ({
    name: k.length > 12 ? k.slice(0, 11) + "." : k, salary: s.m / 1000, yours: k === profile.specialty,
  })), [profile.specialty]);

  const healthRadar = useMemo(() => {
    const debtRatio = totalDebt > 0 ? Math.max(0, 100 - (totalDebt / totalIncome) * 50) : 100;
    const insScore = Math.round(insuranceScore / 3 * 100);
    const estScore = Math.round(estateScore / 4 * 100);
    return [
      { metric:"Debt", score:Math.round(debtRatio) },
      { metric:"Savings", score:Math.min(100, (savings / (takeHome / 12 * 6)) * 100) },
      { metric:"Tax Eff.", score:Math.min(100, ((totalIncome - totalTax) / totalIncome) * 120) },
      { metric:"Insurance", score:insScore || 25 },
      { metric:"Retirement", score:Math.min(100, fiPct * 1.5) },
      { metric:"Estate", score:estScore || 10 },
    ];
  }, [totalDebt, totalIncome, totalTax, fiPct, savings, takeHome, insuranceScore, estateScore]);

  const healthScore = Math.round(healthRadar.reduce((s, h) => s + h.score, 0) / healthRadar.length);

  const peerTrend = useMemo(() =>
    ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => ({
      month: m,
      you: Math.round(sal / 12 + (Math.sin(i * 0.8) * sal * 0.02)),
      median: Math.round(spec.m / 12),
      p75: Math.round(spec.hi / 12),
    })), [sal, spec]);

  const today = new Date();
  const fmtDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const actions = useMemo(() => {
    const items = [];
    if (loans > 200000) items.push({ p:"high", a:"Review PSLF eligibility", d:`${fN(loans)} student loans. Save ${fN(Math.round(loans*0.4))} through forgiveness.`, due:new Date(today.getFullYear(),today.getMonth(),today.getDate()+7), mod:"loans" });
    items.push({ p:"high", a:"Upload tax return for AI analysis", d:"Physicians overpay avg $15-50K/yr. AI double-pass finds missed deductions.", due:new Date(today.getFullYear(),today.getMonth(),today.getDate()+3), mod:"tax" });
    if (STATE_TAX[state] > 0.05) items.push({ p:"medium", a:"Evaluate state tax arbitrage", d:`${STATE_NAMES[state]}: ${(STATE_TAX[state]*100).toFixed(1)}% tax, COL ${STATE_COL[state]||100}. Could save ${fN(Math.round(sal*STATE_TAX[state]))}.`, due:new Date(today.getFullYear(),today.getMonth(),today.getDate()+14), mod:"statemove" });
    items.push({ p:"medium", a:"Review disability coverage", d:`${profile.specialty} burnout: ${spec.burn}%. Own-occupation DI critical.`, due:new Date(today.getFullYear(),today.getMonth(),today.getDate()+21), mod:"disability" });
    items.push({ p:"medium", a:"Upload employment contract", d:"AI double-pass identifies unfavorable clauses and negotiation leverage.", due:new Date(today.getFullYear(),today.getMonth()+1,15), mod:"contracts" });
    items.push({ p:"low", a:"Explore moonlighting", d:`Expert witness at $500/hr = ${fN(Math.round(500*4*40*0.6))}/yr after tax.`, due:new Date(today.getFullYear(),today.getMonth()+2,1), mod:"moonlight" });
    if (!profile.hasWill) items.push({ p:"high", a:"Create estate plan", d:`No will or trust. ${profile.kids > 0 ? `${profile.kids} dependents need protection.` : "Essential for asset protection."} Cost: $500-5K.`, due:new Date(today.getFullYear(),today.getMonth(),today.getDate()+10), mod:"estateplan" });
    if (!profile.hasDI) items.push({ p:"high", a:"Get own-occ disability insurance", d:`No DI coverage. ${profile.specialty} physicians need own-occupation protection.`, due:new Date(today.getFullYear(),today.getMonth(),today.getDate()+7), mod:"disability" });
    if (!profile.hasUmbrella) items.push({ p:"medium", a:"Add umbrella liability", d:"High-income physicians are lawsuit targets. $2M umbrella costs ~$500/yr.", due:new Date(today.getFullYear(),today.getMonth()+1,1), mod:"insurance" });
    if (profile.rentalPropertyValue === 0 && sal > 300000) items.push({ p:"low", a:"Explore real estate investing", d:"Physician mortgage: 0% down, no PMI. Tax benefits via depreciation.", due:new Date(today.getFullYear(),today.getMonth()+2,15), mod:"realestate" });
    if (spec.burn > 40) items.push({ p:"low", a:"Take burnout assessment", d:`${spec.burn}% burnout rate. Quantify the hidden financial cost.`, due:new Date(today.getFullYear(),today.getMonth()+1,1), mod:"burnout" });
    // Retirement
    if ((profile.retirement || 0) < sal * 2) items.push({ p:"high", a:"Max retirement contributions", d:`Retirement balance ${fN(profile.retirement||0)} is below 2x salary. Backdoor Roth + 401k = $30K/yr tax-free growth.`, due:new Date(today.getFullYear(),11,31), mod:"backdoorroth" });
    // Emergency fund
    const monthlySpend = Math.round((sal - fedTax(sal, profile.married) - Math.round(sal * (STATE_TAX[state]||0))) / 12 * 0.7);
    const efMonths = (profile.savings||0) / (monthlySpend || 1);
    if (efMonths < 6) items.push({ p:"high", a:`Build emergency fund to 6 months`, d:`Currently ${efMonths.toFixed(1)} months. Target: ${fN(monthlySpend*6)}. Gap: ${fN(Math.max(0,monthlySpend*6-(profile.savings||0)))}.`, due:new Date(today.getFullYear(),today.getMonth()+1,15), mod:"emergency" });
    // Salary negotiation
    if (sal < spec.m) items.push({ p:"medium", a:"You may be underpaid", d:`Your salary ${fN(sal)} is below the ${profile.specialty} median of ${fN(spec.m)}. Review negotiation toolkit.`, due:new Date(today.getFullYear(),today.getMonth()+2,1), mod:"negotiate" });
    // Net worth tracking
    if (!localStorage.getItem("pw_nw_history")) items.push({ p:"low", a:"Start tracking net worth", d:"Monthly net worth snapshots show progress and keep you accountable.", due:new Date(today.getFullYear(),today.getMonth(),today.getDate()+5), mod:"nwtracker" });
    // Community
    if (!localStorage.getItem("pw_community")) items.push({ p:"low", a:"Join the physician community", d:`${profile.specialty} physicians sharing salary data, contract terms, and employer reviews.`, due:new Date(today.getFullYear(),today.getMonth()+1,1), mod:"community" });
    // Credential tracker
    items.push({ p:"low", a:"Set up credential tracking", d:"CME deadlines, license renewals, board certification dates. Never miss a deadline.", due:new Date(today.getFullYear(),today.getMonth()+2,1), mod:"credentials" });
    // Dual physician
    if (profile.hasSpouse && profile.spouseSalary > 0) items.push({ p:"medium", a:"Run dual-physician tax analysis", d:`Combined income ${fN(sal + profile.spouseSalary)}. Marriage penalty could cost ${fN(Math.round((sal+profile.spouseSalary)*0.02))}/yr.`, due:new Date(today.getFullYear(),today.getMonth()+1,1), mod:"dualphys" });
    // W-4 optimizer
    if (profile.moonlightIncome > 0) items.push({ p:"medium", a:"Optimize W-4 withholding", d:`Moonlighting income ${fN(profile.moonlightIncome)} may cause underpayment penalty. Adjust W-4 now.`, due:new Date(today.getFullYear(),today.getMonth(),today.getDate()+14), mod:"w4optimizer" });
    // Lifestyle creep
    if (profile.stage === "mid" || profile.stage === "senior") items.push({ p:"low", a:"Check for lifestyle creep", d:"Mid-career physicians lose $200K+ to unnoticed spending growth. Run the detector.", due:new Date(today.getFullYear(),today.getMonth()+2,1), mod:"creep" });
    return items;
  }, [loans, sal, state, spec, profile.specialty]);

  const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };

  const [animNw, setAnimNw] = useState(0);
  useEffect(() => {
    let frame; const start = Date.now();
    const tick = () => { const t = Math.min(1, (Date.now() - start) / 1200); setAnimNw(Math.round(netWorth * (1 - Math.pow(1 - t, 3)))); if (t < 1) frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [netWorth]);

  const handlePrint = () => {
    const style = document.createElement("style");
    style.textContent = `@media print { body { background:var(--bg)!important; -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; } .no-print { display:none!important; } }`;
    document.head.appendChild(style); window.print(); setTimeout(() => document.head.removeChild(style), 1000);
  };

  // Widget rendering map
  const WIDGET_CONTENT = {
    hero: (
      <div className="relative overflow-hidden rounded-2xl p-6" style={{ background:"radial-gradient(ellipse at 30% 0%, rgba(52,211,153,0.08) 0%, transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)", border:`1px solid ${C.border}` }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-15" style={{ background:"radial-gradient(circle, rgba(52,211,153,0.2), transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 rounded-full opacity-10" style={{ background:"radial-gradient(circle, rgba(96,165,250,0.15), transparent 70%)" }} />
        <p className="text-sm text-white/55 uppercase tracking-[0.15em]">{greeting()}</p>
        <h1 className="text-2xl font-black text-white mt-1" style={{ fontFamily:"'Instrument Serif', Georgia, serif" }}>Dr. {profile.lastName || "Physician"}</h1>
        <div className="flex items-center gap-3 mt-1.5">
          <Badge color={C.emerald}>{profile.role ? `${profile.role} - ` : ""}{profile.specialty}</Badge>
          <span className="text-xs text-white/55">{STATE_NAMES[state]||state}</span>
          <span className="text-xs text-white/55">#{rank}/{Object.keys(SPECIALTIES).length}</span>
        </div>
        <div className="absolute top-6 right-6 text-center">
          <Donut value={healthScore} max={100} size={64} sw={5} color={healthScore>70?C.emerald:healthScore>50?C.amber:C.red}>
            <p className="text-sm font-black" style={{ color:healthScore>70?C.emerald:healthScore>50?C.amber:C.red }}>{healthScore}</p>
            <p className="text-[5px] text-white/55 uppercase">Score</p>
          </Donut>
        </div>
      </div>
    ),
    fi: <FICountdown profile={profile} />,
    summary: (
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-emerald-400 to-blue-400" />
          <p className="text-sm font-bold text-white/75" style={{ fontFamily:"'Instrument Serif', Georgia, serif" }}>Executive Summary</p>
        </div>
        <p className="text-sm text-white/65 leading-relaxed">
          As {profile.role === "Attending" ? "an" : "a"} <span className="text-white/75 font-medium">{profile.role || ""} {profile.specialty}</span> with total income <span className="text-emerald-400/70 font-bold">{fmt(totalIncome)}</span> in {STATE_NAMES[state]||state} (COL index: {STATE_COL[state]||100}), you rank <span className="text-white/75 font-medium">#{rank}/{Object.keys(SPECIALTIES).length}</span>.
          Effective tax rate: <span className="text-red-400/70 font-bold">{((totalTax/sal)*100).toFixed(1)}%</span>, take-home {fmt(takeHome)}.
          {totalDebt > 0 && <> Total debt <span className="text-red-400/70 font-bold">{fmt(totalDebt)}</span> (total assets {fmt(totalAssets)}), net worth <span style={{ color:netWorth>=0?C.emerald:C.red }} className="font-bold">{fmt(netWorth)}</span>.</>}
          {" "}<span className="text-emerald-400/70 font-bold">{fiPct}%</span> to FI ({fmt(fiTarget)}).
          {spec.burn > 40 && <> Burnout: <span className="text-amber-400/70 font-bold">{spec.burn}%</span>.</>}
          {" "}Insurance: <span className={`font-bold ${insuranceScore>=2?"text-emerald-400/70":"text-red-400/70"}`}>{insuranceScore}/3</span>.
          {" "}Estate plan: <span className={`font-bold ${estateScore>=3?"text-emerald-400/70":"text-amber-400/70"}`}>{estateScore}/4</span>.
          {rentalEquity > 0 && <> Real estate equity: <span className="text-blue-400/70 font-bold">{fmt(rentalEquity + homeEquity)}</span>.</>}
          {" "}Health score: <span className="font-bold" style={{ color:healthScore>70?C.emerald:healthScore>50?C.amber:C.red }}>{healthScore}/100</span>.
        </p>
      </Card>
    ),
    stats: (
      <div className="grid grid-cols-4 gap-3 stagger">
        {[
          { l:"Net Worth", v:fmt(animNw), c:netWorth>=0?C.emerald:C.red, s:`${fiPct}% to FI` },
          { l:"Income", v:fmt(sal), c:C.blue, s:`#${rank}/20` },
          { l:"Take-Home", v:fmt(takeHome), c:C.emerald, s:`${((totalTax/sal)*100).toFixed(0)}% tax` },
          { l:"Total Debt", v:fmt(totalDebt), c:totalDebt>0?C.red:C.emerald, s:totalDebt>0?`${Math.round(totalDebt/totalIncome*100)}% DTI`:"Debt free" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-4" style={{ background:C.card, border:`1px solid ${C.border}` }}>
            <p className="text-xs text-white/55 uppercase tracking-wider">{s.l}</p>
            <p className="text-xl font-black tabular-nums mt-1" style={{ color:s.c }}>{s.v}</p>
            <p className="text-xs text-white/65 mt-0.5">{s.s}</p>
          </div>
        ))}
      </div>
    ),
    wealthChart: (
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-1">10-Year Wealth Projection</p>
        <p className="text-xs text-white/55 mb-3">7% return, 20% savings rate</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={wealthProjection}>
            <defs>
              <linearGradient id="nwG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.emerald} stopOpacity={0.3}/><stop offset="100%" stopColor={C.emerald} stopOpacity={0}/></linearGradient>
              <linearGradient id="fiG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.amber} stopOpacity={0.1}/><stop offset="100%" stopColor={C.amber} stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid}/>
            <XAxis dataKey="year" tick={{ fontSize:9, fill:C.text }} axisLine={{ stroke:C.axis }} tickLine={false}/>
            <YAxis tick={{ fontSize:9, fill:C.text }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1e6).toFixed(1)}M`}/>
            <Tooltip content={<Tip/>}/>
            <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke={C.emerald} fill="url(#nwG)" strokeWidth={2.5} dot={false} activeDot={{ r:4, fill:C.emerald, stroke:"#0d0e14", strokeWidth:2 }}/>
            <Area type="monotone" dataKey="fi" name="FI Target" stroke={C.amber} fill="url(#fiG)" strokeWidth={1.5} strokeDasharray="6 4" dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    ),
    taxPie: (
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-1">Income Allocation</p>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={taxData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none" animationDuration={800}>
              {taxData.map((d,i)=><Cell key={i} fill={d.color}/>)}
            </Pie>
            <Tooltip content={<Tip/>}/>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1">
          {taxData.map((d,i)=>(
            <div key={i} className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{ background:d.color }}/><span className="text-xs text-white/55">{d.name}: {fN(d.value)}</span></div>
          ))}
        </div>
      </Card>
    ),
    peerLine: (
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-1">Income vs Peers</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={peerTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid}/>
            <XAxis dataKey="month" tick={{ fontSize:8, fill:C.text }} axisLine={{ stroke:C.axis }} tickLine={false}/>
            <YAxis tick={{ fontSize:8, fill:C.text }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
            <Tooltip content={<Tip/>}/>
            <Line type="monotone" dataKey="you" name="You" stroke={C.emerald} strokeWidth={2.5} dot={false}/>
            <Line type="monotone" dataKey="median" name="Median" stroke={C.purple} strokeWidth={1.5} strokeDasharray="4 4" dot={false}/>
            <Line type="monotone" dataKey="p75" name="75th%" stroke={C.amber} strokeWidth={1.5} strokeDasharray="4 4" dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </Card>
    ),
    cashFlow: (
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-1">Monthly Cash Flow</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyFlow} layout="vertical" barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false}/>
            <XAxis type="number" tick={{ fontSize:8, fill:C.text }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
            <YAxis type="category" dataKey="name" tick={{ fontSize:9, fill:C.text }} axisLine={false} tickLine={false} width={70}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="value" name="Amount" radius={[0,4,4,0]} animationDuration={800}>{monthlyFlow.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    ),
    radar: (
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-1">Financial Health Radar</p>
        <ResponsiveContainer width="100%" height={210}>
          <RadarChart data={healthRadar} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke={C.grid}/>
            <PolarAngleAxis dataKey="metric" tick={{ fontSize:8, fill:C.text }}/>
            <PolarRadiusAxis tick={false} axisLine={false} domain={[0,100]}/>
            <Radar name="Score" dataKey="score" stroke={C.emerald} fill={C.emerald} fillOpacity={0.15} strokeWidth={2} dot={{ r:3, fill:C.emerald, stroke:"#0d0e14", strokeWidth:2 }}/>
          </RadarChart>
        </ResponsiveContainer>
      </Card>
    ),
    specBar: (
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-1">Specialty Compensation ($K)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={specComp} layout="vertical" barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false}/>
            <XAxis type="number" tick={{ fontSize:8, fill:C.text }} axisLine={false} tickLine={false}/>
            <YAxis type="category" dataKey="name" tick={{ fontSize:8, fill:C.text }} axisLine={false} tickLine={false} width={85}/>
            <Tooltip content={<Tip prefix="$"/>}/>
            <Bar dataKey="salary" name="Median ($K)" radius={[0,4,4,0]}>{specComp.map((d,i)=><Cell key={i} fill={d.yours?C.emerald:"rgba(255,255,255,0.06)"}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    ),
    allocation: (
      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-3">Asset Allocation</p>
        <div className="flex items-center gap-6">
          <Donut value={fiPct} max={100} size={100} sw={8} color={C.emerald}>
            <p className="text-lg font-black text-emerald-400">{fiPct}%</p>
            <p className="text-sm text-white/75">FI</p>
          </Donut>
          <div className="flex-1 space-y-2.5">
            {[{ l:"Retirement",v:retirement,c:C.emerald },{ l:"Investments",v:investments,c:C.blue },{ l:"Savings",v:savings,c:C.purple },{ l:"Real Estate",v:homeEquity+rentalEquity,c:C.amber },{ l:"Other",v:hsa+plan529+crypto,c:C.pink },{ l:"Debt",v:-totalDebt,c:C.red }].filter(a=>a.v!==0).map((a,i)=>(
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background:a.c }}/><span className="text-sm text-white/75">{a.l}</span></div>
                <span className="text-sm font-bold tabular-nums" style={{ color:a.c }}>{fN(a.v)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    ),
    actions: (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-amber-400 to-red-400"/>
          <p className="text-sm font-bold text-white/65" style={{ fontFamily:"'Instrument Serif', Georgia, serif" }}>Action Plan</p>
          <span className="text-xs text-white/55 ml-auto">{actions.length} items</span>
        </div>
        <div className="space-y-2">
          {actions.map((a,i)=>(
            <button key={i} onClick={()=>navigate(a.mod)} className="w-full text-left p-3.5 rounded-xl border transition hover:scale-[1.003]" style={{
              background:a.p==="high"?"rgba(248,113,113,0.03)":a.p==="medium"?"rgba(251,191,36,0.03)":C.card,
              borderColor:a.p==="high"?"rgba(248,113,113,0.12)":a.p==="medium"?"rgba(251,191,36,0.08)":C.border,
            }}>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-10 rounded-full flex-shrink-0 mt-0.5" style={{ background:a.p==="high"?C.red:a.p==="medium"?C.amber:C.blue }}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-white/75 font-bold truncate">{a.a}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-white/55">{fmtDate(a.due)}</span>
                      <span className={`text-sm px-1.5 py-0.5 rounded-full font-bold ${a.p==="high"?"bg-red-500/10 text-red-400":a.p==="medium"?"bg-amber-500/10 text-amber-400":"bg-blue-500/10 text-blue-400"}`}>{a.p}</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/55 mt-0.5">{a.d}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    ),
    nav: (
      <div className="no-print">
        <p className="text-xs text-white/65 uppercase tracking-[0.2em] mb-3">All Modules</p>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(MODULES).filter(([k,m])=>!m.always).map(([k,m])=>(
            <button key={k} onClick={()=>navigate(k)} className="group p-3 rounded-xl text-center transition-all duration-200 hover:scale-[1.03]" style={{ background:C.card, border:`1px solid ${C.border}` }}
              onMouseEnter={e=>{e.currentTarget.style.background=`${m.color||C.emerald}10`;e.currentTarget.style.borderColor=`${m.color||C.emerald}25`}}
              onMouseLeave={e=>{e.currentTarget.style.background=C.card;e.currentTarget.style.borderColor=C.border}}>
              <p className="text-lg mb-1 opacity-20">{m.icon}</p>
              <p className="text-xs text-white/65 group-hover:text-white/75 font-medium transition">{m.label}</p>
            </button>
          ))}
        </div>
      </div>
    ),
  };

  // Layout: some widgets pair in 2-col grids
  const PAIRS = { wealthChart: "taxPie", peerLine: "cashFlow", radar: "specBar" };
  const PAIR_SECONDS = new Set(Object.values(PAIRS));

  return (
    <div className="space-y-6 animate-in" ref={printRef}>
      {/* Controls */}
      <div className="flex justify-end gap-2 no-print">
        <button onClick={() => setEditing(!editing)}
          className={`px-3 py-1.5 rounded-lg text-sm border transition ${editing ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-white/[0.04] border-white/[0.06] text-white/65 hover:text-white/65"}`}>
          {editing ? "Done Editing" : "Customize"}
        </button>
        {editing && (
          <button onClick={() => { setWidgets(DEFAULT_WIDGETS); }}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white/65 hover:text-white/65">
            Reset Layout
          </button>
        )}
        <button onClick={handlePrint}
          className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white/65 hover:text-white/65 hover:bg-white/[0.06]">
          Export PDF
        </button>
      </div>

      {/* Render widgets in order */}
      {widgets.map((w, idx) => {
        // Skip if this is a "second" in a pair (rendered with its first)
        if (PAIR_SECONDS.has(w.id)) return null;
        const paired = PAIRS[w.id];
        const pairWidget = paired ? widgets.find(x => x.id === paired) : null;

        if (paired && pairWidget) {
          // Render as 2-col grid
          const pairIdx = widgets.findIndex(x => x.id === paired);
          return (
            <div key={w.id} className="grid grid-cols-2 gap-3">
              <Widget id={w.id} title={w.label} visible={w.visible} editing={editing}
                onToggle={() => toggleWidget(idx)} onMoveUp={() => moveWidget(idx, -1)} onMoveDown={() => moveWidget(idx, 1)}
                isFirst={idx === 0} isLast={idx === widgets.length - 1}>
                {WIDGET_CONTENT[w.id]}
              </Widget>
              <Widget id={pairWidget.id} title={pairWidget.label} visible={pairWidget.visible} editing={editing}
                onToggle={() => toggleWidget(pairIdx)} onMoveUp={() => moveWidget(pairIdx, -1)} onMoveDown={() => moveWidget(pairIdx, 1)}
                isFirst={pairIdx === 0} isLast={pairIdx === widgets.length - 1}>
                {WIDGET_CONTENT[pairWidget.id]}
              </Widget>
            </div>
          );
        }

        return (
          <Widget key={w.id} id={w.id} title={w.label} visible={w.visible} editing={editing}
            onToggle={() => toggleWidget(idx)} onMoveUp={() => moveWidget(idx, -1)} onMoveDown={() => moveWidget(idx, 1)}
            isFirst={idx === 0} isLast={idx === widgets.length - 1}>
            {WIDGET_CONTENT[w.id]}
          </Widget>
        );
      })}

      <p className="text-sm text-white/55 text-center pt-4">
        PhysicianWealth | {new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })} | Not financial advice
      </p>
    </div>
  );
}
