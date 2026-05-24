import { useState, useMemo } from "react";
import { MODULES } from "../lib/data";
import { Section, Card, Badge } from "../components/ui";

// Full interconnection data from code analysis
const CONNECTIONS = {
  dashboard: { reads:["salary","loans","savings","retirement","investments","hsa","plan529","cryptoAssets","homeValue","mortgageBalance","carLoan","creditCardDebt","rentalPropertyEquity","moonlightIncome","rentalIncome","hasDI","hasUmbrella","hasLifeInsurance","hasWill","hasTrust","hasPOA","hasHealthcareDirective","kids","fiWithdrawalRate"], linksTo:["tax","loans","statemove","disability","insurance","realestate","burnout","estateplan","contracts","moonlight"], feeds:["ficountdown"], desc:"Central hub. All profile data flows in. Action items link to every module." },
  ficountdown: { reads:["salary","savings","retirement","investments","hsa","plan529","cryptoAssets","homeValue","mortgageBalance","carLoan","creditCardDebt","rentalPropertyEquity","loans","kids","retireAge"], linksTo:[], feeds:[], desc:"Uses ALL asset/debt fields. Salary trajectory + kid costs + inflation. Feeds dashboard FI widget." },
  salary: { reads:["salary","specialty"], linksTo:[], feeds:["dashboard","offercompare","moonlight","ficountdown"], desc:"Benchmarks feed negotiation, offer comparison, moonlighting ROI." },
  spending: { reads:["salary","loans","state","married"], linksTo:[], feeds:["dashboard","emergency","ficountdown"], desc:"Budget analysis feeds emergency fund calc and FI projections." },
  tax: { reads:["salary","state","married","loans"], linksTo:[], feeds:["dashboard","statemove","w4optimizer","charitable","backdoorroth"], desc:"Tax analysis feeds state arbitrage, W-4, charitable, and Roth strategies.", ai:true },
  statemove: { reads:["salary","state"], linksTo:[], feeds:["offercompare","incomemap","ficountdown"], desc:"State tax + COL data feeds offer comparison and income map." },
  loans: { reads:["salary","loans"], linksTo:[], feeds:["dashboard","debtpayoff","ficountdown","spending"], desc:"Strategy feeds debt payoff visualizer and FI timeline." },
  debtpayoff: { reads:["loans","mortgageBalance","carLoan","creditCardDebt"], linksTo:[], feeds:["ficountdown","spending"], desc:"All 4 debt types. Payoff timeline affects FI countdown." },
  retirement: { reads:["salary","retirement","investments","homeValue","mortgageBalance","rentalPropertyEquity","retireAge"], linksTo:[], feeds:["ficountdown","dashboard"], desc:"RE sale option feeds FI calc. Contribution limits feed tax planning." },
  realestate: { reads:["salary"], linksTo:[], feeds:["retirement","ficountdown","dashboard","estateplan"], desc:"Property ROI feeds retirement (sell at retire) and net worth." },
  estateplan: { reads:["salary","savings","retirement","investments","loans","hasWill","hasTrust","kids"], linksTo:[], feeds:["dashboard","marketplace"], desc:"Protection score feeds dashboard health radar. Gaps trigger marketplace." },
  insurance: { reads:["salary","specialty","loans"], linksTo:[], feeds:["dashboard","marketplace","emergency"], desc:"Coverage gaps feed dashboard actions and marketplace needs.", ai:true },
  disability: { reads:["salary","savings","specialty"], linksTo:[], feeds:["dashboard","insurance","emergency"], desc:"DI gap feeds insurance review and emergency fund sizing." },
  malrisk: { reads:["salary","specialty"], linksTo:[], feeds:["insurance","burnout","marketplace"], desc:"Risk score correlates with burnout and insurance premiums." },
  contracts: { reads:["salary","specialty","state"], linksTo:[], feeds:["negotiate","offercompare"], desc:"AI contract scan feeds negotiation toolkit.", ai:true },
  negotiate: { reads:["salary","specialty"], linksTo:[], feeds:["offercompare","salary"], desc:"Checklist items map to offer comparison fields." },
  offercompare: { reads:["salary","state","retirement","retireAge"], linksTo:[], feeds:["statemove","ficountdown"], desc:"Uses state tax + COL + retirement projection for lifetime comparison." },
  moonlight: { reads:["salary","state"], linksTo:[], feeds:["tax","w4optimizer","ficountdown"], desc:"Side income affects tax planning and W-4 withholding." },
  burnout: { reads:["salary","specialty"], linksTo:[], feeds:["dashboard","wellness","malrisk","disability"], desc:"Score correlates with malpractice risk and disability need." },
  dualphys: { reads:["salary","loans","spouseSalary","spouseSpecialty","married"], linksTo:[], feeds:["tax","ficountdown","loans"], desc:"Marriage penalty feeds tax strategy. Combined PSLF analysis." },
  backdoorroth: { reads:["salary","age"], linksTo:[], feeds:["retirement","ficountdown","checklists"], desc:"Annual Roth contribution feeds retirement projection." },
  w4optimizer: { reads:["salary","moonlightIncome","kids","state","married"], linksTo:[], feeds:["tax","spending"], desc:"Withholding adjustment prevents over/underpayment." },
  charitable: { reads:["salary"], linksTo:[], feeds:["tax","estateplan"], desc:"DAF and stock donation strategies feed tax optimization." },
  emergency: { reads:["salary","savings","hasDI","kids","moonlightIncome","mortgageBalance","stage"], linksTo:[], feeds:["dashboard","spending","ficountdown"], desc:"Risk-adjusted fund size. Affects FI timeline and spending." },
  nwtracker: { reads:["salary","savings","retirement","investments","hsa","plan529","loans","mortgageBalance","carLoan","creditCardDebt","homeValue","rentalPropertyEquity"], linksTo:[], feeds:["ficountdown","dashboard"], desc:"Historical tracking feeds FI progress and dashboard." },
  incomemap: { reads:["salary","state"], linksTo:[], feeds:["statemove","offercompare"], desc:"100-metro data feeds state arbitrage and offer comparison." },
  credentials: { reads:["specialty"], linksTo:[], feeds:["dashboard","taxcalendar"], desc:"License expiry feeds tax calendar deadlines." },
  creep: { reads:["salary"], linksTo:[], feeds:["ficountdown","spending","checklists"], desc:"Lifestyle creep cost feeds FI timeline delay calculation." },
  locumrates: { reads:["salary","specialty"], linksTo:[], feeds:["moonlight","tax"], desc:"Locum rates feed moonlighting ROI and tax planning." },
  partnership: { reads:["salary"], linksTo:[], feeds:["practicebuy","tax","ficountdown"], desc:"Buy-in ROI feeds practice buyout and FI timeline." },
  practicebuy: { reads:["salary"], linksTo:[], feeds:["partnership","realestate","ficountdown"], desc:"Practice valuation feeds partnership analysis." },
  rvucalc: { reads:["salary","specialty"], linksTo:[], feeds:["salary","negotiate","offercompare"], desc:"RVU benchmarks feed salary negotiation and offer comparison." },
  vault: { reads:["ALL"], linksTo:[], feeds:["aichat","tax","contracts","insurance"], desc:"Document context feeds ALL AI modules.", ai:true },
  aichat: { reads:["ALL_VIA_CONTEXT"], linksTo:[], feeds:[], desc:"Loads full user context .md from vault. All profile + doc findings.", ai:true },
  community: { reads:["specialty"], linksTo:[], feeds:["salarydb"], desc:"Discussions cross-reference salary database." },
  salarydb: { reads:["salary","specialty","state"], linksTo:[], feeds:["salary","negotiate","offercompare","community"], desc:"Crowdsourced comp data feeds benchmarking and negotiation." },
  marketplace: { reads:["hasDI","hasUmbrella","hasWill","hasTrust","loans"], linksTo:[], feeds:[], desc:"Provider needs driven by insurance/estate/loan gaps." },
  wellness: { reads:["specialty"], linksTo:[], feeds:["burnout"], desc:"Resources correlated with specialty burnout rate." },
  checklists: { reads:[], linksTo:[], feeds:["dashboard"], desc:"Completion tracking feeds overall readiness score." },
  taxcalendar: { reads:[], linksTo:[], feeds:["dashboard","credentials"], desc:"Deadlines feed dashboard action items." },
  settings: { reads:["ALL"], writes:["ALL"], linksTo:["onboarding"], feeds:["ALL"], desc:"Profile changes propagate to every module via auto-save." },
};

const CATS = { Core:"#34d399", Tax:"#a78bfa", Debt:"#f87171", Wealth:"#fbbf24", Protection:"#60a5fa", Career:"#f472b6", Social:"#f472b6", Wellness:"#fbbf24", Banking:"#818cf8", AI:"#a78bfa", System:"rgba(255,255,255,0.3)" };

export default function ModuleMap({ navigate }) {
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("grid"); // grid | connections

  const moduleList = Object.entries(MODULES).filter(([k,m]) => !m.always && CONNECTIONS[k]);
  const conn = selected ? CONNECTIONS[selected] : null;

  // Which modules are connected to selected?
  const connected = useMemo(() => {
    if (!selected) return new Set();
    const s = new Set();
    const c = CONNECTIONS[selected];
    if (c) {
      (c.linksTo || []).forEach(m => s.add(m));
      (c.feeds || []).forEach(m => s.add(m));
    }
    // Also find modules that link TO or feed this one
    Object.entries(CONNECTIONS).forEach(([k, v]) => {
      if ((v.linksTo || []).includes(selected) || (v.feeds || []).includes(selected)) s.add(k);
    });
    return s;
  }, [selected]);

  return (
    <div className="space-y-5 animate-in">
      <Section title="Module Map" sub="How Everything Connects" />

      <div className="grid grid-cols-3 gap-2">
        <Card><p className="text-xs text-white/50">Total modules</p><p className="text-2xl font-black text-emerald-400">48</p></Card>
        <Card><p className="text-xs text-white/50">Profile fields</p><p className="text-2xl font-black text-blue-400">38</p></Card>
        <Card><p className="text-xs text-white/50">AI-powered</p><p className="text-2xl font-black text-purple-400">5</p></Card>
      </div>

      <p className="text-sm text-white/50">Tap any module to see what data it reads, what it feeds into, and how it connects to other tools.</p>

      {/* Module grid */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {moduleList.map(([key, mod]) => {
          const isSelected = selected === key;
          const isConnected = connected.has(key);
          const c = CONNECTIONS[key];
          const catColor = CATS[mod.cat] || "#fff";
          return (
            <button key={key} onClick={() => { setSelected(isSelected ? null : key); }}
              className={`p-3 rounded-xl text-left transition-all duration-200 border ${
                isSelected ? "scale-[1.05] border-emerald-500/30 bg-emerald-500/[0.08]" :
                isConnected ? "border-blue-500/20 bg-blue-500/[0.04] scale-[1.02]" :
                selected && !isConnected ? "opacity-20 border-white/[0.03]" :
                "border-white/[0.05] glass-hover"
              }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm opacity-30">{mod.icon}</span>
                {c?.ai && <span className="text-xs text-purple-400/70">AI</span>}
              </div>
              <p className={`text-xs font-bold truncate ${isSelected ? "text-emerald-400" : isConnected ? "text-blue-400/80" : "text-white/55"}`}>{mod.label}</p>
              <p className="text-xs text-white/30">{mod.cat}</p>
              <div className="w-full h-0.5 rounded-full mt-1.5" style={{ background: catColor, opacity: isSelected ? 0.6 : 0.15 }} />
            </button>
          );
        })}
      </div>

      {/* Connection detail */}
      {selected && conn && (
        <Card className="animate-in border-emerald-500/15">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-lg text-emerald-400 font-bold">{MODULES[selected]?.label}</p>
              <p className="text-sm text-white/50">{conn.desc}</p>
            </div>
            <button onClick={() => navigate(selected)} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 font-bold">Open</button>
          </div>

          {conn.reads && conn.reads.length > 0 && conn.reads[0] !== "ALL" && conn.reads[0] !== "ALL_VIA_CONTEXT" && (
            <div className="mb-3">
              <p className="text-xs text-white/40 uppercase font-bold mb-1">Reads from profile ({conn.reads.length} fields)</p>
              <div className="flex flex-wrap gap-1">
                {conn.reads.slice(0, 12).map(r => <span key={r} className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400/70">{r}</span>)}
                {conn.reads.length > 12 && <span className="text-xs text-white/30">+{conn.reads.length - 12} more</span>}
              </div>
            </div>
          )}
          {(conn.reads?.[0] === "ALL" || conn.reads?.[0] === "ALL_VIA_CONTEXT") && (
            <div className="mb-3">
              <p className="text-xs text-white/40 uppercase font-bold mb-1">Reads from profile</p>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400/70">All 38 fields{conn.reads[0] === "ALL_VIA_CONTEXT" ? " (via context .md)" : ""}</span>
            </div>
          )}

          {conn.linksTo && conn.linksTo.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-white/40 uppercase font-bold mb-1">Links to (action items)</p>
              <div className="flex flex-wrap gap-1">
                {conn.linksTo.map(m => <button key={m} onClick={() => setSelected(m)} className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400/70 hover:bg-amber-500/15 transition">{MODULES[m]?.label || m}</button>)}
              </div>
            </div>
          )}

          {conn.feeds && conn.feeds.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-white/40 uppercase font-bold mb-1">Feeds data into</p>
              <div className="flex flex-wrap gap-1">
                {conn.feeds.map(m => <button key={m} onClick={() => setSelected(m)} className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400/70 hover:bg-emerald-500/15 transition">{MODULES[m]?.label || m}</button>)}
              </div>
            </div>
          )}

          {conn.ai && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.04]">
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400/70">AI-Powered</span>
              <span className="text-xs text-white/40">Uses Claude double-pass analysis</span>
            </div>
          )}
        </Card>
      )}

      {/* Data flow summary */}
      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-3">Data Flow Architecture</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-3 p-2 rounded-lg bg-white/[0.02]">
            <div className="w-2 h-8 rounded-full bg-emerald-400 flex-shrink-0 mt-1" />
            <div><p className="text-white/55 font-bold">Profile (38 fields)</p><p className="text-xs text-white/40">Set in Onboarding/Settings. Auto-saved to localStorage. Every change instantly propagates to all modules.</p></div>
          </div>
          <div className="flex items-start gap-3 p-2 rounded-lg bg-white/[0.02]">
            <div className="w-2 h-8 rounded-full bg-blue-400 flex-shrink-0 mt-1" />
            <div><p className="text-white/55 font-bold">Calculators (30 modules)</p><p className="text-xs text-white/40">Read profile data, compute results. Changes in one module's inputs affect downstream modules via shared profile.</p></div>
          </div>
          <div className="flex items-start gap-3 p-2 rounded-lg bg-white/[0.02]">
            <div className="w-2 h-8 rounded-full bg-purple-400 flex-shrink-0 mt-1" />
            <div><p className="text-white/55 font-bold">AI Layer (5 modules)</p><p className="text-xs text-white/40">Document Vault builds context .md from profile + uploads. AI Chat and scanners use this context for personalized analysis.</p></div>
          </div>
          <div className="flex items-start gap-3 p-2 rounded-lg bg-white/[0.02]">
            <div className="w-2 h-8 rounded-full bg-amber-400 flex-shrink-0 mt-1" />
            <div><p className="text-white/55 font-bold">Dashboard</p><p className="text-xs text-white/40">Aggregates ALL data. Health score, action items, charts all auto-update. Action items link to specific modules based on gaps detected.</p></div>
          </div>
          <div className="flex items-start gap-3 p-2 rounded-lg bg-white/[0.02]">
            <div className="w-2 h-8 rounded-full bg-pink-400 flex-shrink-0 mt-1" />
            <div><p className="text-white/55 font-bold">Community Layer</p><p className="text-xs text-white/40">Salary database feeds benchmarking. Community discussions indexed for search. Employer reviews require domain verification.</p></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
