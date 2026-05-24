import { useState, useEffect, useMemo } from "react";
import { SPECIALTIES, STATE_TAX, STATE_COL, fedTax, fica, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Alert, Donut, Toggle, Takeaway } from "../components/ui";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/50 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>);
};

// Physician salary growth curve (Marit 2025 data)
// Years post-training -> multiplier of starting salary
const SALARY_CURVE = [
  { yr:0, mult:1.0 }, { yr:2, mult:1.08 }, { yr:5, mult:1.18 },
  { yr:8, mult:1.28 }, { yr:10, mult:1.33 }, { yr:12, mult:1.37 },
  { yr:15, mult:1.40 }, { yr:18, mult:1.37 }, { yr:20, mult:1.35 },
  { yr:25, mult:1.30 }, { yr:30, mult:1.25 },
];

function salaryAtYear(baseSalary, yearsPostTraining) {
  if (yearsPostTraining <= 0) return baseSalary;
  const curve = SALARY_CURVE;
  for (let i = 0; i < curve.length - 1; i++) {
    if (yearsPostTraining >= curve[i].yr && yearsPostTraining <= curve[i+1].yr) {
      const pct = (yearsPostTraining - curve[i].yr) / (curve[i+1].yr - curve[i].yr);
      const mult = curve[i].mult + pct * (curve[i+1].mult - curve[i].mult);
      return Math.round(baseSalary * mult);
    }
  }
  return Math.round(baseSalary * curve[curve.length-1].mult);
}

// Kid cost by age (USDA data, adjusted for physician lifestyle)
function annualKidCost(kidAge, col) {
  const colMult = (col || 100) / 100;
  if (kidAge < 0) return 0;
  if (kidAge < 2) return Math.round(18000 * colMult);  // infant/toddler (daycare)
  if (kidAge < 5) return Math.round(16000 * colMult);   // preschool
  if (kidAge < 12) return Math.round(14000 * colMult);  // elementary
  if (kidAge < 18) return Math.round(16000 * colMult);  // teen
  if (kidAge < 22) return Math.round(42000 * colMult);  // college (avg private)
  return 0;
}

export default function FICountdown({ profile: p, standalone }) {
  const spec = SPECIALTIES[p.specialty] || SPECIALTIES["Cardiology"];
  const state = p.state || "NY";
  const col = STATE_COL[state] || 100;
  const baseSal = p.salary || spec.m;
  const age = p.age || 35;
  const resYears = spec.res || 5;
  const yearsPostTraining = Math.max(0, age - 26 - resYears);

  // Inputs
  const [retireAge, setRetireAge] = useState(p.retireAge || 60);
  const [inflationRate, setInflationRate] = useState(3);
  const [investReturn, setInvestReturn] = useState(7);
  const [savingsRate, setSavingsRate] = useState(20);
  const [wantKids, setWantKids] = useState(p.kids > 0);
  const [numKids, setNumKids] = useState(p.kids || 0);
  const [kidStartAge, setKidStartAge] = useState(p.kids > 0 ? Math.max(0, age - 5) : age + 2);

  // Net worth
  const totalAssets = (p.savings||0)+(p.retirement||0)+(p.investments||0)+(p.hsa||0)+(p.plan529||0)+(p.cryptoAssets||0)+Math.max(0,(p.homeValue||0)-(p.mortgageBalance||0))+(p.rentalPropertyEquity||0);
  const totalDebt = (p.loans||0)+(p.mortgageBalance||0)+(p.carLoan||0)+(p.creditCardDebt||0);
  const nw = totalAssets - totalDebt;

  const realReturn = (investReturn - inflationRate) / 100;
  const yearsToRetire = Math.max(0, retireAge - age);

  // Year-by-year projection with salary growth, inflation, kid costs
  const projection = useMemo(() => {
    let bal = nw;
    const data = [];
    let totalEarned = 0, totalSaved = 0, totalKidCost = 0, totalTaxPaid = 0;

    for (let yr = 0; yr <= yearsToRetire; yr++) {
      const currentAge = age + yr;
      const ypt = yearsPostTraining + yr;
      const salary = salaryAtYear(baseSal, ypt);
      const inflAdj = Math.pow(1 + inflationRate/100, yr);
      
      // Living costs inflate
      const baseLiving = baseSal * (1 - savingsRate/100) * 0.6; // 60% of pre-savings income
      const livingCosts = Math.round(baseLiving * inflAdj * (col/100));
      
      // Kid costs
      let kidCosts = 0;
      if (wantKids && numKids > 0) {
        for (let k = 0; k < numKids; k++) {
          const kidBirthAge = kidStartAge + k * 2.5;
          const kidAge = currentAge - kidBirthAge;
          kidCosts += annualKidCost(kidAge, col);
        }
      }
      kidCosts = Math.round(kidCosts * Math.pow(1 + inflationRate/100, yr) / Math.pow(1 + inflationRate/100, 0)); // already COL adjusted
      
      const totalTax = fedTax(salary, p.married) + Math.round(salary * (STATE_TAX[state]||0)) + Math.round(fica(salary));
      const afterTax = salary - totalTax;
      const savings = Math.max(0, afterTax - livingCosts - kidCosts);
      
      totalEarned += salary;
      totalSaved += savings;
      totalKidCost += kidCosts;
      totalTaxPaid += totalTax;
      
      data.push({
        age: currentAge,
        year: yr,
        salary,
        afterTax,
        livingCosts,
        kidCosts,
        savings: Math.round(savings),
        netWorth: Math.round(bal),
        fiTarget: Math.round(livingCosts / 0.04), // dynamic FI target
      });
      
      bal = bal * (1 + investReturn/100) + savings;
    }
    
    return { data, totalEarned, totalSaved, totalKidCost, totalTaxPaid, finalNW: Math.round(bal) };
  }, [nw, age, baseSal, yearsPostTraining, retireAge, inflationRate, investReturn, savingsRate, wantKids, numKids, kidStartAge, col, state, p.married]);

  const { data: projData, totalEarned, totalSaved, totalKidCost, totalTaxPaid, finalNW } = projection;
  
  // FI calculation: when does net worth exceed dynamic FI target?
  const fiYear = projData.findIndex(d => d.netWorth >= d.fiTarget && d.year > 0);
  const fiAge = fiYear >= 0 ? age + fiYear : retireAge + 5;
  const currentFiTarget = projData[0]?.fiTarget || baseSal * 15;
  const pct = Math.min(100, Math.round((nw / currentFiTarget) * 100));
  
  // Countdown
  const totalDays = Math.max(0, (fiAge - age)) * 365;
  const [tick, setTick] = useState(totalDays);
  useEffect(() => {
    setTick(totalDays);
    const iv = setInterval(() => setTick(prev => Math.max(0, prev - 0.0000116)), 1000);
    return () => clearInterval(iv);
  }, [totalDays]);

  const countYrs = Math.floor(tick / 365);
  const countMos = Math.floor((tick % 365) / 30);
  const countDays = Math.floor(tick % 30);

  // Salary trajectory chart data
  const salaryTrajectory = useMemo(() => {
    return Array.from({ length: 31 }, (_, yr) => ({
      year: yr,
      age: 26 + resYears + yr,
      salary: Math.round(salaryAtYear(baseSal, yr) / 1000),
      median: Math.round(spec.m / 1000),
    })).filter(d => d.age >= age - 5 && d.age <= retireAge + 5);
  }, [baseSal, spec, resYears, age, retireAge]);

  // Monthly income breakdown at retirement
  const retirementIncome = Math.round(finalNW * 0.04 / 12);
  const ssEstimate = Math.round(Math.min(3800, baseSal / 12 * 0.35)); // rough SS estimate

  return (
    <div className="space-y-5 animate-in">
      {/* Countdown hero */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 text-center glow-pulse" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(52,211,153,0.12) 0%, transparent 60%), rgba(255,255,255,0.02)",
        border: "1px solid rgba(52,211,153,0.12)"
      }}>
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="orb" style={{ width:300, height:300, top:"-20%", left:"-10%", background:"rgba(52,211,153,0.08)", filter:"blur(60px)" }} />
        </div>
        <div className="relative z-10">
          <p className="text-xs text-emerald-400/70 uppercase tracking-[0.25em] font-bold mb-4">Financial Independence In</p>
          <div className="flex items-center justify-center gap-6">
            {[[countYrs,"years"],[countMos,"months"],[countDays,"days"]].map(([v,l],i) => (
              <div key={i} className="text-center">
                <p className="text-4xl md:text-5xl font-black text-emerald-400 tabular-nums" style={{ fontFamily:"'JetBrains Mono',monospace", textShadow:"0 0 30px rgba(52,211,153,0.3)" }}>
                  {String(v).padStart(l==="years"?1:2,"0")}
                </p>
                <p className="text-xs text-emerald-400/40 uppercase mt-1.5 tracking-wider">{l}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-5 mb-3">
            <Donut value={pct} max={100} size={100} sw={8} color={pct>=100?"#34d399":pct>50?"#fbbf24":"#f87171"}>
              <p className="text-xl font-black" style={{color:pct>=100?"#34d399":pct>50?"#fbbf24":"#f87171"}}>{pct}%</p>
            </Donut>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div><p className="text-xs text-white/40">Current</p><p className="text-white/55 font-bold">{fmt(nw)}</p></div>
            <div className="w-px h-5 bg-white/[0.06]" />
            <div><p className="text-xs text-white/40">FI Target</p><p className="text-emerald-400/70 font-bold">{fmt(currentFiTarget)}</p></div>
            <div className="w-px h-5 bg-white/[0.06]" />
            <div><p className="text-xs text-white/40">FI Age</p><p className="text-emerald-400 font-bold">{nw >= currentFiTarget ? "NOW" : fiAge}</p></div>
          </div>
        </div>
      </div>

      {standalone && (
        <div className="space-y-5">
          {/* Assumptions / Inputs */}
          <Card>
            <p className="text-sm text-white/55 font-bold mb-3">Planning Assumptions</p>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Target retirement age" value={retireAge} onChange={v => setRetireAge(+v)} type="number" />
              <Inp label="Savings rate %" value={savingsRate} onChange={v => setSavingsRate(+v)} type="number" />
              <Inp label="Investment return %" value={investReturn} onChange={v => setInvestReturn(+v)} type="number" />
              <Inp label="Inflation %" value={inflationRate} onChange={v => setInflationRate(+v)} type="number" />
            </div>
            <div className="mt-3 space-y-1">
              <Toggle label="Planning for children" sub={wantKids ? `${numKids} child(ren)` : "No children in projection"} value={wantKids} onChange={v => { setWantKids(v); if (v && numKids === 0) setNumKids(1); }} />
            </div>
            {wantKids && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Inp label="Number of children" value={numKids} onChange={v => setNumKids(Math.max(0,+v))} type="number" />
                <Inp label="First child born at age" value={kidStartAge} onChange={v => setKidStartAge(+v)} type="number" />
              </div>
            )}
          </Card>

          {/* Salary trajectory */}
          <Card>
            <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Expected Income Trajectory</p>
            <p className="text-xs text-white/40 mb-2">Based on physician salary growth curve (Marit 2025): peaks at 15-18yr post-training, then plateaus</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={salaryTrajectory}>
                <defs>
                  <linearGradient id="salTraj" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity={0.2}/><stop offset="100%" stopColor="#34d399" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)"/>
                <XAxis dataKey="age" tick={{ fontSize:11, fill:"rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10, fill:"rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} unit="K"/>
                <Tooltip content={<Tip/>}/>
                <ReferenceLine x={age} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" label={{ value:"Now", position:"top", fontSize:10, fill:"rgba(255,255,255,0.3)" }}/>
                <Area type="monotone" dataKey="salary" name="Your Salary ($K)" stroke="#34d399" fill="url(#salTraj)" strokeWidth={2.5} dot={false}/>
                <Line type="monotone" dataKey="median" name="Specialty Median" stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="4 4" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs text-white/40 mt-1">
              Current: {fmt(baseSal)} | Peak (~age {26 + resYears + 16}): {fmt(salaryAtYear(baseSal, 16))} | At retirement: {fmt(salaryAtYear(baseSal, retireAge - 26 - resYears))}
            </p>
          </Card>

          {/* Wealth journey with FI target */}
          <Card>
            <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Wealth Journey to Financial Independence</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={projData}>
                <defs>
                  <linearGradient id="nwJourney" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity={0.3}/><stop offset="100%" stopColor="#34d399" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)"/>
                <XAxis dataKey="age" tick={{ fontSize:11, fill:"rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10, fill:"rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1e6).toFixed(1)}M`}/>
                <Tooltip content={<Tip/>}/>
                <Area type="monotone" dataKey="fiTarget" name="FI Target (inflated)" stroke="#fbbf24" fill="none" strokeWidth={1.5} strokeDasharray="6 4" dot={false}/>
                <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="#34d399" fill="url(#nwJourney)" strokeWidth={2.5} dot={false}/>
                {fiYear >= 0 && <ReferenceLine x={fiAge} stroke="#34d399" strokeDasharray="4 4" label={{ value:"FI!", position:"top", fontSize:11, fill:"#34d399" }}/>}
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Annual cash flow breakdown */}
          <Card>
            <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Annual Cash Flow Over Time</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={projData.filter((_,i) => i % Math.max(1, Math.floor(yearsToRetire/12)) === 0)} barCategoryGap="15%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)"/>
                <XAxis dataKey="age" tick={{ fontSize:10, fill:"rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10, fill:"rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
                <Tooltip content={<Tip/>}/>
                <Bar dataKey="livingCosts" name="Living Costs" stackId="a" fill="#f87171" fillOpacity={0.5} radius={0}/>
                {wantKids && <Bar dataKey="kidCosts" name="Kid Costs" stackId="a" fill="#fbbf24" fillOpacity={0.5} radius={0}/>}
                <Bar dataKey="savings" name="Savings" stackId="a" fill="#34d399" fillOpacity={0.5} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-2 text-xs">
              <span className="text-red-400/70">Living costs</span>
              {wantKids && <span className="text-amber-400/70">Kid costs</span>}
              <span className="text-emerald-400/70">Savings</span>
            </div>
          </Card>

          {/* Lifetime summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Stat label="Lifetime earnings" value={fmt(totalEarned)} sub={`${yearsToRetire} years`} color="#60a5fa" />
            <Stat label="Total saved" value={fmt(totalSaved)} sub={`${Math.round(totalSaved/totalEarned*100)}% of gross`} color="#34d399" />
            <Stat label="Total tax paid" value={fmt(totalTaxPaid)} sub={`${Math.round(totalTaxPaid/totalEarned*100)}% effective`} color="#f87171" />
            <Stat label="Kid costs" value={wantKids ? fmt(totalKidCost) : "N/A"} sub={wantKids ? `${numKids} child(ren)` : "No kids planned"} color="#fbbf24" />
          </div>

          {/* Retirement readiness */}
          <Card>
            <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Retirement Readiness at Age {retireAge}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/50">Portfolio at retirement</span><span className="text-emerald-400 font-bold">{fmt(finalNW)}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Monthly withdrawal (4%)</span><span className="text-white/65 font-bold">{fN(retirementIncome)}/mo</span></div>
              <div className="flex justify-between"><span className="text-white/50">Est. Social Security</span><span className="text-white/65">{fN(ssEstimate)}/mo</span></div>
              <div className="flex justify-between border-t border-white/[0.05] pt-2 mt-2">
                <span className="text-white/65 font-bold">Total monthly income</span>
                <span className="text-emerald-400 font-bold">{fN(retirementIncome + ssEstimate)}/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">vs current take-home</span>
                <span className={`font-bold ${(retirementIncome + ssEstimate) > (baseSal - fedTax(baseSal, p.married) - baseSal*(STATE_TAX[state]||0) - fica(baseSal))/12 * 0.8 ? "text-emerald-400" : "text-amber-400"}`}>
                  {Math.round((retirementIncome + ssEstimate) / ((baseSal - fedTax(baseSal, p.married))/12) * 100)}% replacement
                </span>
              </div>
            </div>
          </Card>

          {/* Milestones */}
          <Card>
            <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Wealth Milestones</p>
            <div className="space-y-2">
              {[100000, 250000, 500000, 1000000, 2000000, 5000000, currentFiTarget].map((target, i) => {
                const hitYear = projData.findIndex(d => d.netWorth >= target);
                const hitAge = hitYear >= 0 ? age + hitYear : null;
                const reached = nw >= target;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${reached ? "bg-emerald-400" : "bg-white/10"}`} style={reached ? {boxShadow:"0 0 6px #34d399"} : {}} />
                    <div className="flex-1 flex items-center justify-between">
                      <span className={`text-sm font-medium ${reached ? "text-emerald-400/70 line-through" : "text-white/50"}`}>
                        {target === currentFiTarget ? `FI: ${fN(target)}` : fN(target)}
                      </span>
                      <span className="text-xs text-white/40">{reached ? "Reached" : hitAge ? `Age ${hitAge}` : `After ${retireAge}`}</span>
                    </div>
                    <div className="w-20 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500/40" style={{ width:`${Math.min(100, (nw / target)*100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Takeaway items={[
            `Financial independence at age ${fiAge}. ${fiAge <= retireAge ? `That's ${retireAge - fiAge} years before your target retirement.` : `${fiAge - retireAge} years after your target. Increase savings rate or delay retirement.`}`,
            `Your salary will peak around age ${26 + resYears + 16} at ~${fmt(salaryAtYear(baseSal, 16))}. ${yearsPostTraining < 16 ? `You have ${16 - yearsPostTraining} years of growth ahead.` : "You're near or past peak. Focus on investment growth."}`,
            wantKids ? `${numKids} child(ren) will cost ~${fmt(totalKidCost)} total (birth through college, inflation-adjusted). That's ${Math.round(totalKidCost/totalEarned*100)}% of lifetime earnings.` : `No children in projection. This significantly accelerates your FI timeline.`,
            `At retirement: ${fN(retirementIncome + ssEstimate)}/mo income (${Math.round((retirementIncome + ssEstimate) / ((baseSal - fedTax(baseSal, p.married))/12) * 100)}% replacement rate). ${(retirementIncome + ssEstimate) > 15000 ? "Strong position." : "Consider increasing savings rate."}`,
          ]} />
        </div>
      )}
    </div>
  );
}
