// src/modules/PlaidAccounts.jsx
// EXPANDABLE BANK REGISTRY: Add banks by adding to BANK_REGISTRY in data.js
// PROPS: { profile, setProfile }
// REAL INTEGRATION: Uses Plaid Link SDK. All banks connect through Plaid.
// In demo mode, simulates connection with sample data from BANK_REGISTRY.

import { useState } from "react";
import { BANK_REGISTRY, ACCOUNT_COLORS, fmt, fN } from "../lib/data";
import { Section, Stat, Alert } from "../components/ui";

const CATS = [
  { id: "all", label: "All" },
  { id: "business", label: "Business" },
  { id: "bank", label: "Banks" },
  { id: "invest", label: "Investing" },
  { id: "credit", label: "Credit" },
];

export default function PlaidAccounts({ profile, setProfile }) {
  const [accounts, setAccounts] = useState([]);
  const [connected, setConnected] = useState([]);
  const [linking, setLinking] = useState(null);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [showPicker, setShowPicker] = useState(false);

  const totalAssets = accounts.reduce((s, a) => s + (a.bal > 0 ? a.bal : 0), 0);
  const totalDebt = accounts.reduce((s, a) => s + (a.bal < 0 ? Math.abs(a.bal) : 0), 0);
  const byType = {};
  accounts.forEach(a => { byType[a.type] = (byType[a.type] || 0) + a.bal; });

  const connectBank = (bank) => {
    // In production: launch Plaid Link SDK with bank.id
    // Plaid handles OAuth, credentials, MFA -- we just get a public_token back
    // Exchange public_token for access_token on server, fetch accounts
    setLinking(bank.id);
    setTimeout(() => {
      const newAccts = bank.sample.map(s => ({
        ...s, inst: bank.name, bankId: bank.id, bankColor: bank.color
      }));
      setAccounts(prev => [...prev, ...newAccts]);
      setConnected(prev => [...prev, bank.id]);
      setLinking(null);
      setShowPicker(false);
    }, 1200);
  };

  const removeBank = (bankId) => {
    // In production: call Plaid item/remove, delete from Supabase
    setAccounts(prev => prev.filter(a => a.bankId !== bankId));
    setConnected(prev => prev.filter(id => id !== bankId));
  };

  const filtered = BANK_REGISTRY
    .filter(b => !connected.includes(b.id))
    .filter(b => cat === "all" || b.cat === cat)
    .filter(b => !search || b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 animate-in">
      <Section title="Linked Accounts" sub={`${BANK_REGISTRY.length} Institutions via Plaid`} />

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Assets" value={fmt(totalAssets)} color="#34d399" />
        <Stat label="Debt" value={fmt(totalDebt)} color="#f87171" />
        <Stat label="Net" value={fmt(totalAssets - totalDebt)}
          color={totalAssets - totalDebt >= 0 ? "#34d399" : "#f87171"} />
      </div>

      {/* Type breakdown */}
      {Object.keys(byType).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(byType).map(([t, v]) => (
            <div key={t} className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[8px] text-white/20 uppercase mr-1.5">{t}</span>
              <span className="text-xs font-bold tabular-nums" style={{ color: ACCOUNT_COLORS[t] }}>{fmt(v)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Account list */}
      {accounts.length > 0 && (
        <div className="space-y-1.5">
          {accounts.map((a, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-black text-white"
                  style={{ background: a.bankColor || "#333" }}>
                  {BANK_REGISTRY.find(b => b.id === a.bankId)?.logo || "?"}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{a.n}</p>
                  <p className="text-[9px] text-white/20">{a.inst}</p>
                </div>
              </div>
              <p className="text-sm font-bold tabular-nums"
                style={{ color: a.bal < 0 ? "#f87171" : (ACCOUNT_COLORS[a.type] || "#fff") }}>
                {fN(a.bal)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Connected banks badges */}
      {connected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {connected.map(id => {
            const b = BANK_REGISTRY.find(x => x.id === id);
            if (!b) return null;
            return (
              <div key={id} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                <div className="w-3 h-3 rounded flex items-center justify-center text-[6px] font-black text-white"
                  style={{ background: b.color }}>{b.logo}</div>
                <span className="text-[8px] text-white/30">{b.name}</span>
                <button onClick={() => removeBank(id)} className="text-[8px] text-white/15 hover:text-red-400 ml-0.5">x</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Connect button / picker */}
      {!showPicker ? (
        <button onClick={() => setShowPicker(true)}
          className="w-full py-3 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 transition">
          + Connect Account ({BANK_REGISTRY.length - connected.length} available)
        </button>
      ) : (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Select Institution</span>
            <button onClick={() => setShowPicker(false)} className="text-[10px] text-white/20">Close</button>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search banks, brokerages..."
            className="w-full bg-white/[0.05] border border-white/[0.07] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40 placeholder:text-white/15" />
          <div className="flex gap-1">
            {CATS.map(c => (
              <button key={c.id} onClick={() => setCat(c.id)}
                className={`px-2 py-1 rounded-full text-[9px] font-medium ${cat === c.id ? "bg-emerald-500/15 text-emerald-400" : "text-white/25"}`}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
            {filtered.map(b => (
              <button key={b.id} onClick={() => connectBank(b)} disabled={linking === b.id}
                className="flex items-center gap-2 p-2 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition text-left disabled:opacity-40">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-black text-white flex-shrink-0"
                  style={{ background: b.color }}>{b.logo}</div>
                <div>
                  <p className="text-[10px] font-bold text-white truncate">{b.name}</p>
                  <p className="text-[7px] text-white/15">{b.types.join(", ")}</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-[9px] text-white/20 col-span-2 text-center py-3">No matches</p>
            )}
          </div>
        </div>
      )}

      <Alert type="info">
        Plaid connects to {BANK_REGISTRY.length}+ institutions with bank-level encryption.
        Read-only access. We never see your credentials.
      </Alert>
    </div>
  );
}
