import { useState } from "react";

// --- STAT ---
export const Stat = ({ label, value, sub, color = "#34d399" }) => (
  <div className="p-3 md:p-4 rounded-xl glass border-glow transition-all duration-300 hover:scale-[1.02]">
    <p className="text-sm md:text-xs text-white/65 uppercase tracking-wider">{label}</p>
    <p className="text-lg md:text-xl font-black tabular-nums mt-0.5" style={{ color }}>{value}</p>
    {sub && <p className="text-sm md:text-xs text-white/65 mt-0.5">{sub}</p>}
  </div>
);

// --- SECTION ---
export const Section = ({ title, sub }) => (
  <div className="mb-1">
    <h2 className="text-xl md:text-2xl font-black text-white/80" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{title}</h2>
    <p className="text-white/75 text-xs md:text-sm font-medium tracking-widest uppercase">{sub}</p>
  </div>
);

// --- ALERT ---
const ALERT_STYLES = {
  info: "bg-blue-500/8 border-blue-500/15 text-blue-300/70",
  warn: "bg-amber-500/8 border-amber-500/15 text-amber-300/70",
  danger: "bg-red-500/8 border-red-500/15 text-red-300/70",
  success: "bg-emerald-500/8 border-emerald-500/15 text-emerald-300/70",
};
export const Alert = ({ type = "info", children }) =>
  <div className={`p-3 md:p-4 rounded-xl border text-xs md:text-sm leading-relaxed ${ALERT_STYLES[type]}`}>{children}</div>;

// --- CARD ---
export const Card = ({ children, className = "" }) => (
  <div className={`p-4 md:p-5 rounded-xl glass border-glow transition-all duration-300 ${className}`}>{children}</div>
);

// --- INPUT ---
export const Inp = ({ label, value, onChange, type = "text", pre, options }) => (
  <div>
    <label className="block text-sm md:text-xs text-white/65 uppercase tracking-wider font-medium mb-1.5">{label}</label>
    {options ? (
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/75 outline-none focus:border-emerald-500/30">
        {options.map(o => <option key={o.v || o} value={o.v || o} className="bg-[#13141c]">{o.l || o}</option>)}
      </select>
    ) : (
      <div className="relative">
        {pre && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/55 text-xs">{pre}</span>}
        <input type={type} value={value}
          onChange={e => onChange(type === "number" ? +e.target.value : e.target.value)}
          className={`w-full bg-white/[0.04] border border-white/[0.08] rounded-lg py-2.5 text-sm text-white/75 outline-none focus:border-emerald-500/30 ${pre ? "pl-7 pr-3" : "px-3"}`} />
      </div>
    )}
  </div>
);

// --- DONUT ---
export const Donut = ({ value, max, size = 80, sw = 6, color = "#34d399", children }) => {
  const pct = Math.min(100, (value / max) * 100);
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
};

// --- BAR (inline mini chart) ---
export const Bar = ({ data, highlight }) => (
  <div className="flex items-end gap-0.5 h-10">
    {data.map((d, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
        <div className={`w-full rounded-t ${d.id === highlight ? "bg-emerald-400" : "bg-white/10"}`}
          style={{ height: `${(d.v / Math.max(...data.map(x => x.v))) * 100}%`, minHeight: 2 }} />
        <div className="w-full text-center">
          <div className="text-xs text-white/55 truncate">{d.l}</div>
          <div className={`text-right text-xs font-semibold tabular-nums ${d.id === highlight ? "text-emerald-400" : "text-white/55"}`}>
            {d.v}
          </div>
        </div>
      </div>
    ))}
  </div>
);

// --- TOGGLE ---
export const Toggle = ({ label, sub, value, onChange }) => (
  <div className="flex items-center justify-between py-2.5">
    <div>
      <p className="text-sm text-white/75">{label}</p>
      {sub && <p className="text-sm md:text-xs text-white/55">{sub}</p>}
    </div>
    <button onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-all ${value ? "bg-emerald-500/40" : "bg-white/10"}`}>
      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
    </button>
  </div>
);

// --- BADGE ---
export const Badge = ({ children, color = "#34d399" }) => (
  <span className="text-sm md:text-xs font-bold px-2 py-1 rounded-full"
    style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
    {children}
  </span>
);

// --- BTN ---
export const Btn = ({ children, onClick, variant = "primary", disabled, className = "" }) => {
  const styles = {
    primary: "bg-emerald-500 hover:bg-emerald-400 text-black font-bold",
    secondary: "bg-white/[0.06] hover:bg-white/[0.1] text-white/65 border border-white/[0.08]",
    danger: "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20",
  };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`px-4 py-2.5 rounded-lg text-sm transition ${styles[variant]} ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}>
      {children}
    </button>
  );
};

// --- SPARK (mini sparkline) ---
export const Spark = ({ data, color = "#34d399", w = 60, h = 20 }) => {
  if (!data?.length) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" /></svg>;
};

// --- PAYWALL LOCK ---
export const PaywallLock = ({ tier, navigate }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mb-4 text-2xl">🔒</div>
    <p className="text-sm text-white/55 font-bold mb-1">{tier === "premium" ? "Premium" : "Pro"} Feature</p>
    <p className="text-xs text-white/55 mb-4">Upgrade to access {tier} features</p>
    <Btn onClick={() => navigate("billing")}>View Plans</Btn>
  </div>
);

// --- WIDGET (customizable dashboard section) ---
export const Widget = ({ id, title, visible, onToggle, onMoveUp, onMoveDown, isFirst, isLast, editing, children }) => {
  if (!visible && !editing) return null;
  return (
    <div className={`relative group transition-all ${!visible ? "opacity-30" : ""}`}>
      {editing && (
        <div className="absolute -left-10 top-0 bottom-0 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition z-10">
          {!isFirst && <button onClick={onMoveUp} className="w-7 h-7 rounded bg-white/[0.06] text-xs text-white/75 hover:text-white/75 hover:bg-white/[0.1]">^</button>}
          {!isLast && <button onClick={onMoveDown} className="w-7 h-7 rounded bg-white/[0.06] text-xs text-white/75 hover:text-white/75 hover:bg-white/[0.1]">v</button>}
        </div>
      )}
      {editing && (
        <div className="absolute -right-2 -top-2 z-10">
          <button onClick={onToggle}
            className={`w-6 h-6 rounded-full text-xs font-bold border transition ${visible ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-red-500/20 border-red-500/30 text-red-400"}`}>
            {visible ? "O" : "X"}
          </button>
        </div>
      )}
      {children}
    </div>
  );
};

// --- TAKEAWAY (bottom-of-module "so what" summary) ---
export const Takeaway = ({ items }) => (
  <div className="mt-6 rounded-xl p-4 md:p-5" style={{ background:"linear-gradient(135deg, rgba(52,211,153,0.06) 0%, rgba(96,165,250,0.04) 100%)", border:"1px solid rgba(52,211,153,0.1)" }}>
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center text-xs">&#9889;</div>
      <p className="text-sm font-bold text-emerald-400/80">Key Takeaways</p>
    </div>
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <span className="text-emerald-400/50 text-sm mt-0.5 font-bold flex-shrink-0">{i+1}.</span>
          <p className="text-sm text-white/55 leading-relaxed">{item}</p>
        </div>
      ))}
    </div>
  </div>
);
