import { useState } from "react";
import { fmt, fN } from "../lib/data";
import { Section, Stat, Card, Alert } from "../components/ui";

const BANKS = [
  {
    id: "mercury", name: "Mercury", logo: "M", color: "#6366f1",
    desc: "Business banking for startups",
    accounts: [
      { n: "Mercury Business Checking", type: "checking", bal: 124800 },
      { n: "Mercury Treasury", type: "savings", bal: 250000 },
    ]
  },
  {
    id: "brex", name: "Brex", logo: "B", color: "#f97316",
    desc: "Corporate cards and spend management",
    accounts: [
      { n: "Brex Business Account", type: "checking", bal: 87500 },
      { n: "Brex Credit Line", type: "credit", bal: -12400 },
    ]
  },
];

const TYPE_COLORS = { checking: "#34d399", savings: "#60a5fa", credit: "#f87171", retirement: "#a78bfa", investment: "#fbbf24" };

export default function PlaidAccounts({ profile }) {
  const [connected, setConnected] = useState([]);
  const [linking, setLinking] = useState(null);

  const allAccounts = connected.flatMap(id => {
    const bank = BANKS.find(b => b.id === id);
    return bank ? bank.accounts.map(a => ({ ...a, bankId: id, bankName: bank.name, bankColor: bank.color, bankLogo: bank.logo })) : [];
  });

  const totalAssets = allAccounts.reduce((s, a) => s + (a.bal > 0 ? a.bal : 0), 0);
  const totalDebt = allAccounts.reduce((s, a) => s + (a.bal < 0 ? Math.abs(a.bal) : 0), 0);

  const connectBank = (bank) => {
    setLinking(bank.id);
    // In production: OAuth flow with Mercury/Brex API
    setTimeout(() => {
      setConnected(prev => [...prev, bank.id]);
      setLinking(null);
    }, 1200);
  };

  const disconnectBank = (bankId) => {
    setConnected(prev => prev.filter(id => id !== bankId));
  };

  return (
    <div className="space-y-5 animate-in">
      <Section title="Bank Accounts" sub="Mercury & Brex" />

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Assets" value={fmt(totalAssets)} color="#34d399" />
        <Stat label="Debt" value={fmt(totalDebt)} color="#f87171" />
        <Stat label="Net" value={fmt(totalAssets - totalDebt)} color={totalAssets - totalDebt >= 0 ? "#34d399" : "#f87171"} />
      </div>

      {/* Account list */}
      {allAccounts.length > 0 && (
        <div className="space-y-1.5">
          {allAccounts.map((a, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
                  style={{ background: a.bankColor }}>
                  {a.bankLogo}
                </div>
                <div>
                  <p className="text-xs font-bold text-white/80">{a.n}</p>
                  <p className="text-[9px] text-white/20">{a.bankName} - {a.type}</p>
                </div>
              </div>
              <p className="text-sm font-black tabular-nums"
                style={{ color: a.bal < 0 ? "#f87171" : (TYPE_COLORS[a.type] || "#fff") }}>
                {a.bal < 0 ? "-" : ""}{fN(Math.abs(a.bal))}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Connected bank badges */}
      {connected.length > 0 && (
        <div className="flex gap-2">
          {connected.map(id => {
            const b = BANKS.find(x => x.id === id);
            if (!b) return null;
            return (
              <div key={id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                <div className="w-4 h-4 rounded flex items-center justify-center text-[7px] font-black text-white"
                  style={{ background: b.color }}>{b.logo}</div>
                <span className="text-[10px] text-white/40 font-medium">{b.name}</span>
                <button onClick={() => disconnectBank(id)} className="text-[10px] text-white/15 hover:text-red-400 ml-1">x</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Bank connection cards */}
      <div className="space-y-2">
        {BANKS.filter(b => !connected.includes(b.id)).map(bank => (
          <button key={bank.id} onClick={() => connectBank(bank)} disabled={linking === bank.id}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition text-left disabled:opacity-40">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
              style={{ background: bank.color }}>
              {bank.logo}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white/70">{bank.name}</p>
              <p className="text-[9px] text-white/20">{bank.desc}</p>
            </div>
            <span className="text-[10px] text-emerald-400/60 font-medium">
              {linking === bank.id ? "Connecting..." : "Connect"}
            </span>
          </button>
        ))}
      </div>

      {connected.length === 0 && (
        <Alert type="info">Connect your Mercury and Brex accounts to see balances, track spending, and get personalized insights.</Alert>
      )}

      {connected.length === BANKS.length && (
        <Alert type="success">All accounts connected. Balances update automatically.</Alert>
      )}
    </div>
  );
}
