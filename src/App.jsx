import { useState, useMemo, useCallback } from "react";
import { MODULES, SPECIALTIES, DEFAULT_PROFILE, STAGES } from "./lib/data";
import { PaywallLock, Badge } from "./components/ui";
import { canAccessModule, getTrialDaysLeft, isTrialExpired } from "./lib/stripe";

// Module imports
import Auth from "./modules/Auth";
import Onboarding from "./modules/Onboarding";
import Dashboard from "./modules/Dashboard";
import Landing from "./modules/Landing";
import FICountdown from "./modules/FICountdown";
import PlaidAccounts from "./modules/PlaidAccounts";
import Settings from "./modules/Settings";
import Billing from "./modules/Billing";
import DisabilitySim from "./modules/DisabilitySim";
import BurnoutCost from "./modules/BurnoutCost";
import StateArbitrage from "./modules/StateArbitrage";
import Moonlighting from "./modules/Moonlighting";
import PracticeBuyout from "./modules/PracticeBuyout";
import MalpracticeRisk from "./modules/MalpracticeRisk";
import DualPhysician from "./modules/DualPhysician";
import TaxScanner from "./modules/TaxScanner";
import LoanOptimizer from "./modules/LoanOptimizer";
import SalaryBench from "./modules/SalaryBench";
import Contracts from "./modules/Contracts";
import Insurance from "./modules/Insurance";
import Retirement from "./modules/Retirement";
import Spending from "./modules/Spending";
import DocScanner from "./modules/DocScanner";
import AiChat from "./modules/AiChat";

const MODULE_COMPONENTS = {
  dashboard: Dashboard,
  ficountdown: FICountdown,
  plaid: PlaidAccounts,
  settings: Settings,
  billing: Billing,
  disability: DisabilitySim,
  burnout: BurnoutCost,
  statemove: StateArbitrage,
  moonlight: Moonlighting,
  practicebuy: PracticeBuyout,
  malrisk: MalpracticeRisk,
  dualphys: DualPhysician,
  tax: TaxScanner,
  loans: LoanOptimizer,
  salary: SalaryBench,
  contracts: Contracts,
  insurance: Insurance,
  retirement: Retirement,
  spending: Spending,
  docscan: DocScanner,
  aichat: AiChat,
};

export default function App() {
  const [view, setView] = useState("landing"); // landing | auth | onboarding | app
  const [page, setPage] = useState("dashboard");
  const [profile, setProfile] = useState({ ...DEFAULT_PROFILE });
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useCallback((target) => {
    if (["landing", "auth", "onboarding"].includes(target)) {
      setView(target);
    } else {
      setView("app");
      setPage(target);
    }
  }, []);

  const onAuth = useCallback((userData) => {
    setUser(userData);
    setProfile(prev => ({ ...prev, ...userData }));
  }, []);

  // Sidebar: group modules by category
  const sidebarSections = useMemo(() => {
    const groups = {};
    Object.entries(MODULES).forEach(([k, m]) => {
      const cat = m.cat || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ key: k, ...m });
    });
    return groups;
  }, []);

  const trialDays = getTrialDaysLeft(user?.trialEnd);
  const trialExpired = isTrialExpired(user?.trialEnd);
  const userTier = user?.isAdmin ? "premium" : (user?.plan || "free");

  // Pre-auth views
  if (view === "landing") return <Landing navigate={navigate} />;
  if (view === "auth") return <Auth onAuth={onAuth} navigate={navigate} />;
  if (view === "onboarding") return <Onboarding profile={profile} setProfile={setProfile} navigate={navigate} />;

  // Main app shell
  const ModuleComp = MODULE_COMPONENTS[page];
  const modMeta = MODULES[page];
  const hasAccess = modMeta ? canAccessModule(modMeta.tier, userTier, trialExpired) : true;

  return (
    <div className="flex h-screen" style={{ background: "#0a0b10", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-52" : "w-0 overflow-hidden"} border-r border-white/[0.04] bg-[#08090e] transition-all flex-shrink-0 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/[0.04]">
          <p className="text-emerald-400 text-sm font-black" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            PhysicianWealth
          </p>
          {user?.isAdmin ? <p className="text-[8px] text-emerald-400/50 mt-0.5">Admin - Full Access</p> : trialDays > 0 && <p className="text-[8px] text-amber-400/50 mt-0.5">{trialDays} trial days left</p>}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {Object.entries(sidebarSections).map(([cat, items]) => (
            <div key={cat} className="mb-2">
              <p className="text-[7px] text-white/10 uppercase tracking-widest px-4 py-1">{cat}</p>
              {items.map(m => {
                const active = page === m.key;
                const locked = !canAccessModule(m.tier, userTier, trialExpired);
                return (
                  <button key={m.key} onClick={() => setPage(m.key)}
                    className={`w-full text-left px-4 py-1.5 flex items-center justify-between transition ${
                      active ? "bg-emerald-500/[0.08] text-emerald-400" : "text-white/25 hover:text-white/40 hover:bg-white/[0.02]"
                    } ${locked ? "opacity-40" : ""}`}>
                    <span className="text-[10px] truncate">{m.label}</span>
                    {m.tier === "premium" && <span className="text-[6px] text-amber-400/40 ml-1">PRO</span>}
                    {locked && <span className="text-[6px] text-white/10">🔒</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/[0.04]">
          <p className="text-[9px] text-white/20 truncate">{user?.email || "Demo"}</p>
          <div className="flex gap-2 mt-1">
            <button onClick={() => setPage("settings")} className="text-[8px] text-white/10 hover:text-white/30">Settings</button>
            <button onClick={() => setPage("billing")} className="text-[8px] text-white/10 hover:text-white/30">Billing</button>
            <button onClick={() => { setUser(null); setView("landing"); }} className="text-[8px] text-white/10 hover:text-white/30">Logout</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] sticky top-0 bg-[#0a0b10]/90 backdrop-blur-sm z-10">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/15 hover:text-white/30 text-sm">
            {sidebarOpen ? "◁" : "▷"}
          </button>
          <p className="text-[10px] text-white/15">{modMeta?.label || "Dashboard"}</p>
          <div className="flex items-center gap-2">
            <Badge color="#34d399">{profile.specialty}</Badge>
            <span className="text-[9px] text-white/15">{profile.state}</span>
          </div>
        </div>

        {/* Module render */}
        <div className="p-5 max-w-2xl mx-auto">
          {!hasAccess ? (
            <PaywallLock tier={modMeta?.tier || "pro"} onUpgrade={() => setPage("billing")} />
          ) : ModuleComp ? (
            <ModuleComp profile={profile} setProfile={setProfile} navigate={navigate} user={user} />
          ) : (
            <div className="text-center py-20 text-white/15">
              <p className="text-sm">Module not found</p>
              <button onClick={() => setPage("dashboard")} className="text-emerald-400/50 text-xs mt-2">Back to Dashboard</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
