import { useState, useMemo } from "react";
import { SPECIALTIES, fedTax, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Alert, Takeaway } from "../components/ui";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
const Tip=({active,payload,label})=>{if(!active||!payload?.length)return null;return(<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/50 mb-1">{label}</p>{payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>)};

export default function CharitableGiving({ profile }) {
  const sal = profile.salary || 300000;
  const [giftAmount, setGiftAmount] = useState(10000);
  const [hasAppreciatedStock, setHasAppreciatedStock] = useState(false);
  const [stockBasis, setStockBasis] = useState(3000);
  const [isOver70, setIsOver70] = useState((profile.age||35) >= 70.5);
  const marginalRate = sal > 578125 ? 0.37 : sal > 231250 ? 0.35 : sal > 182100 ? 0.32 : 0.24;

  const methods = useMemo(() => [
    { name:"Cash (direct)", taxSaving:Math.round(giftAmount * marginalRate), netCost:giftAmount - Math.round(giftAmount * marginalRate), capGainsSaved:0, color:"#60a5fa", desc:"Simple. Deductible up to 60% AGI." },
    { name:"Appreciated stock", taxSaving:Math.round(giftAmount * marginalRate), netCost:giftAmount - Math.round(giftAmount * marginalRate) - Math.round((giftAmount - stockBasis) * 0.238), capGainsSaved:Math.round((giftAmount - stockBasis) * 0.238), color:"#34d399", desc:"Donate stock held >1yr. Avoid capital gains + get deduction." },
    { name:"Donor Advised Fund", taxSaving:Math.round(giftAmount * marginalRate), netCost:giftAmount - Math.round(giftAmount * marginalRate), capGainsSaved:hasAppreciatedStock ? Math.round((giftAmount - stockBasis) * 0.238) : 0, color:"#a78bfa", desc:"Front-load 5 years of giving. Invest tax-free. Distribute later." },
    ...(isOver70 ? [{ name:"QCD (IRA)", taxSaving:Math.round(Math.min(giftAmount, 105000) * marginalRate), netCost:Math.min(giftAmount, 105000) - Math.round(Math.min(giftAmount, 105000) * marginalRate), capGainsSaved:0, color:"#fbbf24", desc:"Qualified Charitable Distribution from IRA. Satisfies RMD. Up to $105K." }] : []),
  ], [giftAmount, marginalRate, stockBasis, hasAppreciatedStock, isOver70]);

  const best = methods.sort((a, b) => a.netCost - b.netCost)[0];
  const chartData = methods.map(m => ({ name: m.name.split(" ")[0], value: m.netCost, color: m.color }));

  return (
    <div className="space-y-5 animate-in">
      <Section title="Charitable Giving Optimizer" sub="Maximize Tax Benefit" />
      <div className="grid grid-cols-2 gap-3">
        <Inp label="Annual giving amount" value={giftAmount} onChange={v => setGiftAmount(+v)} type="number" pre="$" />
        <Inp label="Marginal rate" value={`${(marginalRate*100).toFixed(0)}%`} onChange={() => {}} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Tax deduction" value={fN(Math.round(giftAmount * marginalRate))} color="#34d399" />
        <Stat label="Best method" value={best?.name?.split("(")[0] || ""} color="#a78bfa" />
        <Stat label="Lowest net cost" value={fN(best?.netCost || 0)} color="#60a5fa" />
      </div>

      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Net Cost by Method</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(255,255,255,0.45)"}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:"rgba(255,255,255,0.45)"}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(1)}K`}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="value" name="Net Cost" radius={[4,4,0,0]}>{chartData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="space-y-2">
        {methods.map((m, i) => (
          <Card key={i} className={m === best ? "border-emerald-500/20" : ""}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-white/65 font-bold">{m.name} {m === best && <span className="text-emerald-400 text-xs">BEST</span>}</p>
              <p className="text-sm font-bold text-white/55">Net: {fN(m.netCost)}</p>
            </div>
            <p className="text-xs text-white/40">{m.desc}</p>
            <div className="flex gap-4 mt-1 text-xs text-white/50">
              <span>Tax saving: {fN(m.taxSaving)}</span>
              {m.capGainsSaved > 0 && <span className="text-emerald-400/70">Cap gains avoided: {fN(m.capGainsSaved)}</span>}
            </div>
          </Card>
        ))}
      </div>

      <Takeaway items={[
        `At ${(marginalRate*100).toFixed(0)}% marginal rate, ${fN(giftAmount)} gift costs ${fN(best?.netCost || 0)} net via ${best?.name || "best method"}.`,
        hasAppreciatedStock ? `Donating appreciated stock saves ${fN(Math.round((giftAmount-stockBasis)*0.238))} in capital gains tax on top of the deduction.` : `If you hold appreciated stock, donating it instead of cash saves capital gains tax.`,
        `DAF lets you front-load 5 years of giving for a large deduction this year, then distribute to charities over time.`,
      ]} />
    </div>
  );
}
