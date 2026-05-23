import { useState } from "react";
import { BANK_REGISTRY, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Alert } from "../components/ui";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/75 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>);
};

const MOCK_TXN = [
  { date:"2026-05-20", desc:"Hospital Payroll", amount:25000, cat:"Income" },
  { date:"2026-05-18", desc:"Malpractice Premium", amount:-2800, cat:"Insurance" },
  { date:"2026-05-15", desc:"Office Lease", amount:-4200, cat:"Rent" },
  { date:"2026-05-12", desc:"Lab Equipment", amount:-1500, cat:"Equipment" },
  { date:"2026-05-10", desc:"Telehealth Revenue", amount:3200, cat:"Income" },
  { date:"2026-05-08", desc:"CME Conference", amount:-950, cat:"Education" },
  { date:"2026-05-05", desc:"Medical Supplies", amount:-780, cat:"Supplies" },
];

export default function PlaidAccounts({ profile }) {
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Only show Mercury and Brex
  const supported = BANK_REGISTRY.filter(b => b.id === "mercury" || b.id === "brex");

  const connectBank = (bank) => {
    setLoading(true);
    setTimeout(() => {
      setAccounts(bank.sample.map((s, i) => ({ ...s, id: `${bank.id}-${i}`, bank: bank.name, color: bank.color })));
      setConnected(true);
      setLoading(false);
    }, 1500);
  };

  const totalBal = accounts.reduce((s, a) => s + a.bal, 0);

  const catData = MOCK_TXN.filter(t => t.amount < 0).reduce((acc, t) => {
    const e = acc.find(a => a.name === t.cat);
    if (e) e.value += Math.abs(t.amount);
    else acc.push({ name: t.cat, value: Math.abs(t.amount) });
    return acc;
  }, []);

  if (!connected) {
    return (
      <div className="space-y-5 animate-in">
        <Section title="Bank Connections" sub="Mercury & Brex Integration" />
        <Alert type="info">Connect business banking for automatic transaction categorization and cash flow tracking.</Alert>
        <div className="grid grid-cols-2 gap-4">
          {supported.map(bank => (
            <button key={bank.id} onClick={() => connectBank(bank)} disabled={loading}
              className="group p-6 rounded-xl text-center transition-all hover:scale-[1.02]"
              style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${bank.color}40`; e.currentTarget.style.background = `${bank.color}08`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}>
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center text-xl font-black" style={{ background:`${bank.color}15`, border:`1px solid ${bank.color}20`, color:bank.color }}>
                {bank.logo}
              </div>
              <p className="text-sm font-bold text-white/75">{bank.name}</p>
              <div className="mt-3 py-1.5 rounded-lg text-xs font-bold" style={{ background:`${bank.color}10`, color:bank.color, border:`1px solid ${bank.color}20` }}>
                {loading ? "Connecting..." : "Connect"}
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-white/65 text-center">Direct API. No Plaid middleman. Data stays encrypted.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in">
      <Section title="Connected Accounts" sub="Mercury & Brex" />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Total balance" value={fmt(totalBal)} color={totalBal >= 0 ? "#34d399" : "#f87171"} />
        <Stat label="Accounts" value={accounts.length} color="#60a5fa" />
        <Stat label="This month" value={fN(MOCK_TXN.reduce((s,t)=>s+t.amount,0))} color="#fbbf24" />
      </div>

      {accounts.map(a => (
        <Card key={a.id}>
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-white/75 font-bold">{a.n}</p><p className="text-xs text-white/55">{a.bank} | {a.type}</p></div>
            <p className="text-lg font-black tabular-nums" style={{ color: a.bal >= 0 ? "#34d399" : "#f87171" }}>{fmt(a.bal)}</p>
          </div>
        </Card>
      ))}

      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-1">Spending by Category</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={catData} barCategoryGap="20%">
            <XAxis dataKey="name" tick={{ fontSize:8, fill:"rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:8, fill:"rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(1)}K`}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="value" name="Spent" radius={[4,4,0,0]} fill="#f8717180"/>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <p className="text-xs text-white/55 uppercase tracking-widest mb-2">Recent Transactions</p>
        <div className="space-y-1">
          {MOCK_TXN.map((t, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.02] last:border-0">
              <div><p className="text-sm text-white/55">{t.desc}</p><p className="text-xs text-white/65">{t.date} | {t.cat}</p></div>
              <span className={`text-sm font-bold tabular-nums ${t.amount > 0 ? "text-emerald-400" : "text-red-400/80"}`}>
                {t.amount > 0 ? "+" : ""}{fN(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
