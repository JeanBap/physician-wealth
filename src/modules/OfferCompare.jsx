import { useState, useMemo } from "react";
import { SPECIALTIES, STATE_TAX, STATE_COL, STATE_NAMES, METROS_100, fedTax, fica, fmt, fN, pmtCalc } from "../lib/data";
import { Section, Stat, Card, Inp, Alert, Badge, Takeaway } from "../components/ui";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { chartCircle, chartGrid, chartText } from "../lib/chartColors";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/50 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${typeof p.value==="number"?p.value.toLocaleString():p.value}</p>)}</div>);
};

function calcOffer(o, profile) {
  const stRate = STATE_TAX[o.state] || 0;
  const col = STATE_COL[o.state] || 100;
  const metro = METROS_100.find(m => m.s === o.state);
  const totalComp = (+o.salary||0) + (+o.bonus||0) + (+o.signOn||0)/3; // amortize sign-on over 3yr
  const totalTax = fedTax(+o.salary + (+o.bonus||0), profile.married) + Math.round((+o.salary + (+o.bonus||0)) * stRate) + Math.round(fica(+o.salary||0));
  const afterTax = totalComp - totalTax;
  const colAdj = Math.round(afterTax * (100 / col));
  const monthlyHousing = o.rentOrBuy === "rent" ? (metro?.rent || Math.round(col * 22)) : Math.round(pmtCalc(metro?.home * 0.8 || 300000, 6.5, 360));
  const annualHousing = monthlyHousing * 12;
  const annualLiving = Math.round(col / 100 * 60000); // baseline living
  const netAfterLiving = afterTax - annualHousing - annualLiving;
  const savingsRate = afterTax > 0 ? (netAfterLiving / afterTax * 100).toFixed(0) : 0;
  
  // Retirement projection
  const yearsToRetire = Math.max(0, (profile.retireAge || 60) - (profile.age || 35));
  let retBal = profile.retirement || 0;
  for (let y = 0; y < yearsToRetire; y++) retBal = retBal * 1.07 + Math.max(0, netAfterLiving * 0.5);
  const retIncome = Math.round(retBal * 0.04 / 12);
  
  // Commute cost estimate
  const commuteCost = (+o.commuteMin || 30) * 250 * 0.5; // $0.50/min opportunity cost
  
  // Total lifetime value (simplified)
  const lifetimeNet = netAfterLiving * yearsToRetire;
  
  return {
    ...o, totalComp, totalTax, afterTax, colAdj, monthlyHousing, annualHousing,
    annualLiving, netAfterLiving, savingsRate, retBal, retIncome, commuteCost,
    lifetimeNet, stRate, col, yearsToRetire,
    homePrice: metro?.home || Math.round(col * 4200),
    marketAvg: metro?.avg || 374000,
    medianRent: metro?.rent || 2200,
  };
}

export default function OfferCompare({ profile }) {
  const [offers, setOffers] = useState([
    { id:1, name:"Current Position", salary:profile.salary||300000, bonus:0, signOn:0, state:profile.state||"NY", city:"", rentOrBuy:"rent", commuteMin:25, benefits:"Standard", ptoWeeks:4, cme:3000, loanRepay:0, retireMatch:6 },
    { id:2, name:"Competing Offer", salary:0, bonus:0, signOn:0, state:"TX", city:"", rentOrBuy:"rent", commuteMin:20, benefits:"Standard", ptoWeeks:4, cme:5000, loanRepay:0, retireMatch:5 },
  ]);

  const updateOffer = (id, key, val) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, [key]: val } : o));
  };

  const calcs = offers.map(o => calcOffer(o, profile));
  const better = calcs.length >= 2 ? (calcs[1].netAfterLiving > calcs[0].netAfterLiving ? 1 : 0) : 0;
  const diff = calcs.length >= 2 ? calcs[1].netAfterLiving - calcs[0].netAfterLiving : 0;
  const retDiff = calcs.length >= 2 ? calcs[1].retBal - calcs[0].retBal : 0;

  const compData = calcs.length >= 2 ? [
    { metric:"After-Tax Income", a:Math.round(calcs[0].afterTax/1000), b:Math.round(calcs[1].afterTax/1000) },
    { metric:"COL-Adjusted", a:Math.round(calcs[0].colAdj/1000), b:Math.round(calcs[1].colAdj/1000) },
    { metric:"Net After Living", a:Math.round(calcs[0].netAfterLiving/1000), b:Math.round(calcs[1].netAfterLiving/1000) },
    { metric:"Annual Housing", a:Math.round(calcs[0].annualHousing/1000), b:Math.round(calcs[1].annualHousing/1000) },
  ] : [];

  const radarData = calcs.length >= 2 ? [
    { dim:"Income", a:Math.min(100, calcs[0].afterTax/6000), b:Math.min(100, calcs[1].afterTax/6000) },
    { dim:"COL", a:Math.min(100, 200-calcs[0].col), b:Math.min(100, 200-calcs[1].col) },
    { dim:"Tax", a:Math.min(100, (1-calcs[0].stRate)*200), b:Math.min(100, (1-calcs[1].stRate)*200) },
    { dim:"Savings", a:+calcs[0].savingsRate, b:+calcs[1].savingsRate },
    { dim:"Retirement", a:Math.min(100, calcs[0].retBal/50000), b:Math.min(100, calcs[1].retBal/50000) },
    { dim:"PTO", a:calcs[0].ptoWeeks*20, b:calcs[1].ptoWeeks*20 },
  ] : [];

  return (
    <div className="space-y-5 animate-in">
      <Section title="Offer Comparison" sub="Should You Take It?" />

      {/* Two offer inputs side by side */}
      <div className="grid grid-cols-2 gap-4">
        {offers.map((o, idx) => (
          <Card key={o.id} className={idx === better && calcs.length >= 2 ? "border-emerald-500/20" : ""}>
            <div className="flex items-center justify-between mb-3">
              <input value={o.name} onChange={e => updateOffer(o.id, "name", e.target.value)}
                className="text-sm font-bold text-white/65 bg-transparent border-none outline-none w-full" />
              {idx === better && calcs.length >= 2 && <Badge color="#34d399">Better</Badge>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Inp label="Base salary" value={o.salary} onChange={v => updateOffer(o.id,"salary",+v)} type="number" pre="$" />
              <Inp label="Annual bonus" value={o.bonus} onChange={v => updateOffer(o.id,"bonus",+v)} type="number" pre="$" />
              <Inp label="Sign-on bonus" value={o.signOn} onChange={v => updateOffer(o.id,"signOn",+v)} type="number" pre="$" />
              <Inp label="State" value={o.state} onChange={v => { updateOffer(o.id,"state",v); const m = METROS_100.find(x=>x.s===v); if(m) updateOffer(o.id,"city",m.n); }}
                options={Object.entries(STATE_NAMES).map(([k,v]) => ({v:k,l:v}))} />
              <Inp label="City/Metro" value={o.city} onChange={v => updateOffer(o.id,"city",v)}
                options={[{v:"",l:"Select metro..."}, ...METROS_100.filter(m=>!o.state || m.s===o.state).map(m=>({v:m.n,l:`${m.n} (COL: ${STATE_COL[m.s]||100})`}))]} />
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs" style={{background:"var(--card)",border:"1px solid var(--border)"}}>
                <span style={{color:"var(--text3)"}}>COL: <strong style={{color:"var(--accent)"}}>{STATE_COL[o.state]||100}</strong>/100</span>
                <span style={{color:"var(--text3)"}}>Tax: <strong style={{color:STATE_TAX[o.state]>0.05?"var(--accent)":"var(--text2)"}}>{((STATE_TAX[o.state]||0)*100).toFixed(1)}%</strong></span>
                {METROS_100.find(m=>m.s===o.state) && <span style={{color:"var(--text3)"}}>Median home: <strong style={{color:"var(--text2)"}}>{fmt(METROS_100.find(m=>m.s===o.state)?.home||0)}</strong></span>}
              </div>
              <Inp label="Rent or Buy" value={o.rentOrBuy} onChange={v => updateOffer(o.id,"rentOrBuy",v)}
                options={[{v:"rent",l:"Rent"},{v:"buy",l:"Buy"}]} />
              <Inp label="Commute (min)" value={o.commuteMin} onChange={v => updateOffer(o.id,"commuteMin",+v)} type="number" />
              <Inp label="PTO weeks" value={o.ptoWeeks} onChange={v => updateOffer(o.id,"ptoWeeks",+v)} type="number" />
              <Inp label="CME allowance" value={o.cme} onChange={v => updateOffer(o.id,"cme",+v)} type="number" pre="$" />
              <Inp label="Loan repayment" value={o.loanRepay} onChange={v => updateOffer(o.id,"loanRepay",+v)} type="number" pre="$" />
              <Inp label="401k match %" value={o.retireMatch} onChange={v => updateOffer(o.id,"retireMatch",+v)} type="number" />
            </div>
          </Card>
        ))}
      </div>

      {/* Verdict */}
      {calcs.length >= 2 && calcs[1].salary > 0 && (
        <>
          <div className={`p-5 rounded-xl text-center ${diff > 0 ? "bg-emerald-500/[0.06] border border-emerald-500/15" : diff < 0 ? "bg-red-500/[0.06] border border-red-500/15" : "glass"}`}>
            <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Verdict</p>
            <p className="text-2xl font-black" style={{ color: diff > 0 ? "#34d399" : diff < 0 ? "#f87171" : "#fbbf24" }}>
              {diff > 0 ? `Take the offer: +${fN(diff)}/yr better` : diff < 0 ? `Stay put: current is ${fN(Math.abs(diff))}/yr better` : "Dead even"}
            </p>
            <p className="text-sm text-white/50 mt-1">
              Retirement impact: {retDiff > 0 ? "+" : ""}{fmt(retDiff)} by age {profile.retireAge || 60}
            </p>
          </div>

          {/* Side-by-side comparison */}
          <Card>
            <p className="text-xs text-white/50 uppercase tracking-widest mb-2">Head-to-Head ($K)</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={compData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid()} />
                <XAxis dataKey="metric" tick={{ fontSize:10, fill:chartText() }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:chartText() }} axisLine={false} tickLine={false} unit="K" />
                <Tooltip content={<Tip />} />
                <Bar dataKey="a" name={offers[0].name} fill="#60a5fa" radius={[4,4,0,0]} />
                <Bar dataKey="b" name={offers[1].name} fill="#34d399" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Radar comparison */}
          <Card>
            <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Multi-Factor Analysis</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
                <PolarGrid stroke={chartCircle()} />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize:11, fill:chartText() }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0,100]} />
                <Radar name={offers[0].name} dataKey="a" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} strokeWidth={2} />
                <Radar name={offers[1].name} dataKey="b" stroke="#34d399" fill="#34d399" fillOpacity={0.1} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 text-xs">
              <span className="text-blue-400/70">{offers[0].name}</span>
              <span className="text-emerald-400/70">{offers[1].name}</span>
            </div>
          </Card>

          {/* Detailed breakdown table */}
          <Card>
            <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Detailed Breakdown</p>
            <div className="space-y-1">
              {[
                { l:"Base salary", a:fmt(calcs[0].salary), b:fmt(calcs[1].salary) },
                { l:"Total compensation", a:fmt(calcs[0].totalComp), b:fmt(calcs[1].totalComp) },
                { l:"State tax rate", a:`${(calcs[0].stRate*100).toFixed(1)}%`, b:`${(calcs[1].stRate*100).toFixed(1)}%` },
                { l:"Total tax", a:fmt(calcs[0].totalTax), b:fmt(calcs[1].totalTax), neg:true },
                { l:"After-tax income", a:fmt(calcs[0].afterTax), b:fmt(calcs[1].afterTax), bold:true },
                { l:`COL index (100=avg)`, a:`${calcs[0].col}`, b:`${calcs[1].col}` },
                { l:"COL-adjusted income", a:fmt(calcs[0].colAdj), b:fmt(calcs[1].colAdj) },
                { l:"Monthly housing", a:fN(calcs[0].monthlyHousing), b:fN(calcs[1].monthlyHousing), neg:true },
                { l:"Median home price", a:fN(calcs[0].homePrice), b:fN(calcs[1].homePrice) },
                { l:"Annual living costs", a:fN(calcs[0].annualLiving), b:fN(calcs[1].annualLiving), neg:true },
                { l:"Net after all costs", a:fmt(calcs[0].netAfterLiving), b:fmt(calcs[1].netAfterLiving), bold:true },
                { l:"Savings rate", a:`${calcs[0].savingsRate}%`, b:`${calcs[1].savingsRate}%` },
                { l:"Commute cost/yr", a:fN(Math.round(calcs[0].commuteCost)), b:fN(Math.round(calcs[1].commuteCost)), neg:true },
                { l:`Retirement at ${profile.retireAge||60}`, a:fmt(calcs[0].retBal), b:fmt(calcs[1].retBal), bold:true },
                { l:"Retirement income/mo", a:fN(calcs[0].retIncome), b:fN(calcs[1].retIncome) },
                { l:`Lifetime net (${calcs[0].yearsToRetire}yr)`, a:fmt(calcs[0].lifetimeNet), b:fmt(calcs[1].lifetimeNet), bold:true },
                { l:"vs market avg", a:`${calcs[0].salary > calcs[0].marketAvg ? "+" : ""}${fN(calcs[0].salary - calcs[0].marketAvg)}`, b:`${calcs[1].salary > calcs[1].marketAvg ? "+" : ""}${fN(calcs[1].salary - calcs[1].marketAvg)}` },
              ].map((row, i) => {
                const aVal = parseFloat(String(row.a).replace(/[$,%KM]/g,"")) || 0;
                const bVal = parseFloat(String(row.b).replace(/[$,%KM]/g,"")) || 0;
                const aWins = row.neg ? aVal < bVal : aVal > bVal;
                const bWins = row.neg ? bVal < aVal : bVal > aVal;
                return (
                  <div key={i} className={`flex items-center justify-between py-2 px-2 rounded-lg ${row.bold ? "bg-white/[0.02]" : ""} border-b border-white/[0.02]`}>
                    <span className={`text-sm ${row.bold ? "text-white/65 font-bold" : "text-white/50"} flex-1`}>{row.l}</span>
                    <span className={`text-sm tabular-nums w-28 text-right ${aWins && !row.bold ? "text-emerald-400/70" : row.bold ? "text-white/65 font-bold" : "text-white/50"}`}>{row.a}</span>
                    <span className={`text-sm tabular-nums w-28 text-right ${bWins && !row.bold ? "text-emerald-400/70" : row.bold ? "text-white/65 font-bold" : "text-white/50"}`}>{row.b}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Takeaway items={[
            diff > 0 ? `The competing offer nets ${fN(diff)} more per year after tax, housing, and living costs.` : diff < 0 ? `Your current position nets ${fN(Math.abs(diff))} more per year. The new offer isn't worth the move.` : `Both offers are financially equivalent.`,
            `Retirement impact: ${retDiff > 0 ? "new offer adds" : "staying saves"} ${fmt(Math.abs(retDiff))} by age ${profile.retireAge||60}. That's ${fN(Math.abs(Math.round(retDiff * 0.04 / 12)))}/mo in retirement income.`,
            `Don't forget non-financial factors: call schedule, partnership track, academic vs private, malpractice tail coverage, non-compete radius.`,
          ]} />
        </>
      )}

      {(calcs.length < 2 || calcs[1].salary === 0) && (
        <Alert type="info">Enter the competing offer details above to see the full comparison.</Alert>
      )}
    </div>
  );
}
