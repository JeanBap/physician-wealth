import { useState, useMemo } from "react";
import { SPECIALTIES, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Alert, Toggle, Takeaway } from "../components/ui";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { chartGrid, chartText } from "../lib/chartColors";
const Tip=({active,payload,label})=>{if(!active||!payload?.length)return null;return(<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/50 mb-1">{label}</p>{payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>)};

export default function BackdoorRoth({ profile }) {
  const sal = profile.salary || 300000;
  const age = profile.age || 35;
  const [hasPreTaxIRA, setHasPreTaxIRA] = useState(false);
  const [preTaxBalance, setPreTaxBalance] = useState(0);
  const [has401kMegaBackdoor, setHas401kMegaBackdoor] = useState(false);
  const [employerMatch, setEmployerMatch] = useState(6);
  const rothLimit = age >= 50 ? 8600 : 7500;
  const max401k = age >= 50 ? 31000 : 23500;
  const megaLimit = 70000 - max401k - Math.round(sal * employerMatch / 100);
  const canDirectRoth = sal < 153000;
  const proRataTax = hasPreTaxIRA && preTaxBalance > 0 ? Math.round(rothLimit * (preTaxBalance / (preTaxBalance + rothLimit)) * 0.37) : 0;

  const projection = useMemo(() => {
    let bal = 0;
    const annual = rothLimit + (has401kMegaBackdoor ? Math.max(0, megaLimit) : 0);
    return Array.from({ length: 31 }, (_, yr) => {
      const d = { year: yr, balance: Math.round(bal), taxFree: Math.round(bal * 0.37) };
      bal = bal * 1.08 + annual;
      return d;
    });
  }, [rothLimit, has401kMegaBackdoor, megaLimit]);

  const finalBal = projection[30]?.balance || 0;
  const taxSaved = Math.round(finalBal * 0.37);

  const steps = [
    { n: 1, title: "Contribute to Traditional IRA", desc: `Contribute ${fN(rothLimit)} (non-deductible since income > $153K). Use Form 8606.`, done: false },
    { n: 2, title: "Wait 1-2 business days", desc: "Let contribution settle. Some keep it in money market to avoid wash sale issues.", done: false },
    { n: 3, title: "Convert to Roth IRA", desc: `Convert the entire Traditional IRA balance to Roth. ${hasPreTaxIRA ? "WARNING: Pro-rata rule applies. You'll owe tax on the pre-tax portion." : "Clean conversion, minimal tax."}`, done: false },
    { n: 4, title: "File Form 8606", desc: "Report the non-deductible contribution and conversion. Your CPA should handle this.", done: false },
    ...(has401kMegaBackdoor ? [{ n: 5, title: "Mega Backdoor: After-tax 401(k)", desc: `Contribute up to ${fN(Math.max(0,megaLimit))} after-tax to 401(k), then in-plan Roth conversion. Check if employer allows this.`, done: false }] : []),
  ];

  return (
    <div className="space-y-5 animate-in">
      <Section title="Backdoor Roth IRA" sub="Step-by-Step Tax-Free Growth" />
      {canDirectRoth && <Alert type="success">Your income ({fmt(sal)}) is below the Roth limit. You can contribute directly. No backdoor needed.</Alert>}
      {!canDirectRoth && <Alert type="info">Income above $153K. Direct Roth contributions are blocked. Use the backdoor strategy below.</Alert>}

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Annual Roth" value={fN(rothLimit)} sub={age >= 50 ? "w/ catch-up" : "2026 limit"} color="#34d399" />
        <Stat label="30yr projection" value={fmt(finalBal)} sub="at 8% return" color="#60a5fa" />
        <Stat label="Tax saved" value={fmt(taxSaved)} sub="vs taxable account" color="#a78bfa" />
      </div>

      <Card>
        <p className="text-sm text-white/55 font-bold mb-3">Pre-Flight Check</p>
        <Toggle label="I have existing pre-tax IRA balances" sub={hasPreTaxIRA ? "Pro-rata rule applies. Consider rolling into 401(k) first." : "Clean slate. Backdoor is straightforward."} value={hasPreTaxIRA} onChange={setHasPreTaxIRA} />
        {hasPreTaxIRA && <Inp label="Pre-tax IRA balance" value={preTaxBalance} onChange={v => setPreTaxBalance(+v)} type="number" pre="$" />}
        {proRataTax > 0 && <Alert type="warn">Pro-rata tax: ~{fN(proRataTax)} on conversion. Roll pre-tax IRA into 401(k) first to avoid this.</Alert>}
        <Toggle label="Employer 401(k) allows after-tax contributions" sub="Enables Mega Backdoor Roth (up to $70K total)" value={has401kMegaBackdoor} onChange={setHas401kMegaBackdoor} />
        {has401kMegaBackdoor && <Inp label="Employer match %" value={employerMatch} onChange={v => setEmployerMatch(+v)} type="number" />}
      </Card>

      <Card>
        <p className="text-sm text-white/55 font-bold mb-3">Step-by-Step</p>
        <div className="space-y-3">
          {steps.map(s => (
            <div key={s.n} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-sm font-bold text-emerald-400 flex-shrink-0">{s.n}</div>
              <div><p className="text-sm text-white/65 font-bold">{s.title}</p><p className="text-xs text-white/50 mt-0.5">{s.desc}</p></div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">30-Year Tax-Free Growth</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={projection}>
            <defs><linearGradient id="rothG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity={0.3}/><stop offset="100%" stopColor="#34d399" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid()}/>
            <XAxis dataKey="year" tick={{fontSize:11,fill:chartText()}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:chartText()}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1e6).toFixed(1)}M`}/>
            <Tooltip content={<Tip/>}/>
            <Area type="monotone" dataKey="balance" name="Roth Balance" stroke="#34d399" fill="url(#rothG)" strokeWidth={2.5} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Takeaway items={[
        `Backdoor Roth: ${fN(rothLimit)}/yr grows to ${fmt(finalBal)} tax-free over 30 years.${has401kMegaBackdoor ? ` Mega backdoor adds ${fN(Math.max(0,megaLimit))}/yr.` : ""}`,
        hasPreTaxIRA ? `Pro-rata rule: roll pre-tax IRA into 401(k) before converting. Saves ~${fN(proRataTax)} in unnecessary tax.` : `No pre-tax IRA. Clean conversion. Execute annually in January.`,
        `Roth has no RMDs, tax-free withdrawal after 59.5, and passes tax-free to heirs. Best vehicle for high-income physicians.`,
      ]} />
    </div>
  );
}
