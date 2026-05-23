// src/components/ui.jsx
// ============================================================
// SHARED UI COMPONENTS — Every module imports from here
// ============================================================
// INTERFACE: { Stat, Section, Alert, Inp, Donut, Spark, Bar, Card, Badge, Btn }
// All components use the dark luxury fintech theme (bg:#0a0b10, accent:emerald)

import { useState, useEffect } from "react";

export const Stat = ({ label, value, sub, color = "#34d399" }) => (
  <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
    <p className="text-[9px] text-white/25 uppercase tracking-wider">{label}</p>
    <p className="text-lg font-bold mt-0.5 tabular-nums" style={{ color }}>{value}</p>
    {sub && <p className="text-[9px] text-white/25 mt-0.5">{sub}</p>}
  </div>
);

export const Section = ({ title, sub }) => (
  <div className="mb-4">
    <p className="text-white/30 text-[10px] font-medium tracking-widest uppercase">{sub}</p>
    <h1 className="text-xl font-bold text-white mt-0.5" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
      {title}
    </h1>
  </div>
);

export const Alert = ({ type = "info", children }) => {
  const styles = {
    info:    "border-blue-500/20 bg-blue-500/[0.04] text-blue-300/80",
    warn:    "border-amber-500/20 bg-amber-500/[0.04] text-amber-300/80",
    success: "border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-300/80",
    danger:  "border-red-500/20 bg-red-500/[0.04] text-red-300/80",
  };
  return <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${styles[type]}`}>{children}</div>;
};

export const Inp = ({ label, value, onChange, type = "text", pre, options, className = "" }) => (
  <div className={className}>
    {label && (
      <label className="block text-[10px] text-white/25 uppercase tracking-wider font-medium mb-1">
        {label}
      </label>
    )}
    {options ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.05] border border-white/[0.07] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40 transition appearance-none"
      >
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o} value={o} className="bg-[#0f1117]">{o}</option>
          ) : (
            <option key={o.v} value={o.v} className="bg-[#0f1117]">{o.l}</option>
          )
        )}
      </select>
    ) : (
      <div className="relative">
        {pre && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20 text-[10px]">{pre}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === "number" ? +e.target.value : e.target.value)}
          className={`w-full bg-white/[0.05] border border-white/[0.07] rounded-xl ${pre ? "pl-6" : "pl-3"} pr-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40 transition tabular-nums`}
        />
      </div>
    )}
  </div>
);

export const Donut = ({ value, max, size = 80, sw = 6, color = "#34d399", children }) => {
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const [a, setA] = useState(0);
  useEffect(() => { setTimeout(() => setA(Math.min(value / max, 1)), 100); }, [value, max]);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={c} strokeDashoffset={c * (1 - a)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
};

export const Spark = ({ data, color = "#34d399", w = 80, h = 24 }) => {
  const mx = Math.max(...data);
  const mn = Math.min(...data);
  const range = mx - mn || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - mn) / range) * (h - 4) - 2}`
  ).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const Bar = ({ data, highlight }) => {
  const mx = Math.max(...data.map((d) => d.v));
  return (
    <div className="space-y-1">
      {data.map((d, i) => (
        <div key={i} className={`flex items-center gap-2 p-1.5 rounded-lg transition ${d.id === highlight ? "bg-white/[0.05]" : "hover:bg-white/[0.02]"}`}>
          <div className="w-24 text-[10px] text-white/40 truncate">{d.l}</div>
          <div className="flex-1 h-4 bg-white/[0.03] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(d.v / mx) * 100}%`,
                background: d.id === highlight ? "linear-gradient(90deg,#34d399,#6ee7b7)" : "rgba(255,255,255,0.08)",
                transitionDelay: `${i * 40}ms`,
              }} />
          </div>
          <div className={`w-14 text-right text-[10px] font-semibold tabular-nums ${d.id === highlight ? "text-emerald-400" : "text-white/40"}`}>
            {d.v}
          </div>
        </div>
      ))}
    </div>
  );
};

export const Card = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 ${onClick ? "cursor-pointer hover:bg-white/[0.05] transition" : ""} ${className}`}
  >
    {children}
  </div>
);

export const Badge = ({ children, color = "#34d399" }) => (
  <span
    className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
    style={{ background: `${color}15`, color }}
  >
    {children}
  </span>
);

export const Btn = ({ children, onClick, variant = "primary", disabled = false, className = "" }) => {
  const styles = {
    primary: "bg-emerald-500 text-white hover:bg-emerald-400",
    secondary: "bg-white/[0.05] text-white/60 hover:bg-white/[0.08]",
    danger: "bg-red-500/15 text-red-400 hover:bg-red-500/25",
    ghost: "text-white/30 hover:text-white/60",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-30 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Toggle switch for settings
export const Toggle = ({ label, value, onChange, sub }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-[11px] text-white/60">{label}</p>
      {sub && <p className="text-[9px] text-white/20">{sub}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`w-9 h-5 rounded-full transition-all duration-200 ${value ? "bg-emerald-500" : "bg-white/[0.1]"}`}
    >
      <div className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200 ${value ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
    </button>
  </div>
);

// Lock overlay for paid features
export const PaywallLock = ({ tier, currentPlan, onUpgrade }) => {
  const tierOrder = { free: 0, trial: 2, pro: 2, premium: 3 };
  const required = tierOrder[tier] || 0;
  const current = tierOrder[currentPlan] || 0;
  if (current >= required) return null;
  return (
    <div className="absolute inset-0 bg-[#0a0b10]/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
      <p className="text-white/40 text-sm font-bold mb-1">Pro Feature</p>
      <p className="text-[10px] text-white/20 mb-3">Upgrade to access {tier} features</p>
      <button
        onClick={onUpgrade}
        className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-400 transition"
      >
        Upgrade
      </button>
    </div>
  );
};
