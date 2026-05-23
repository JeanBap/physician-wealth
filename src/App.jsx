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
import RealEstate from "./modules/RealEstate";
import EstatePlan from "./modules/EstatePlan";
import DocumentVault from "./modules/DocumentVault";

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
  realestate: RealEstate,
  estateplan: EstatePlan,
  vault: DocumentVault,
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
      {/* Mobile overlay */}
      {sidebarOpen && <div className="md:hidden fixed inset-0 bg-black/60 z-20" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden"} fixed md:relative z-30 h-full border-r border-white/[0.04] bg-[#08090e] transition-all flex-shrink-0 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
          <div>
            <p className="text-emerald-400 text-base font-black" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              PhysicianWealth
            </p>
            {user?.isAdmin ? <p className="text-xs text-emerald-400/70 mt-0.5">Admin</p> : trialDays > 0 && <p className="text-xs text-amber-400/50 mt-0.5">{trialDays}d trial</p>}
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/55 text-lg">X</button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {Object.entries(sidebarSections).map(([cat, items]) => (
            <div key={cat} className="mb-2">
              <p className="text-sm text-white/65 uppercase tracking-widest px-4 py-1.5">{cat}</p>
              {items.map(m => {
                const active = page === m.key;
                const locked = !canAccessModule(m.tier, userTier, trialExpired);
                return (
                  <button key={m.key} onClick={() => { setPage(m.key); setSidebarOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition ${
                      active ? "bg-emerald-500/[0.08] text-emerald-400" : "text-white/75 hover:text-white/65 hover:bg-white/[0.02]"
                    } ${locked ? "opacity-40" : ""}`}>
                    <span className="text-sm truncate">{m.label}</span>
                    {m.tier === "premium" && <span className="text-sm text-amber-400/70 ml-1">PRO</span>}
                    {locked && <span className="text-xs text-white/65">🔒</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/[0.04]">
          <p className="text-xs text-white/65 truncate">{user?.email || "Demo"}</p>
          <div className="flex gap-3 mt-2">
            <button onClick={() => { setPage("settings"); setSidebarOpen(false); }} className="text-xs text-white/55 hover:text-white/55">Settings</button>
            <button onClick={() => { setPage("billing"); setSidebarOpen(false); }} className="text-xs text-white/55 hover:text-white/55">Billing</button>
            <button onClick={() => { setUser(null); setView("landing"); }} className="text-xs text-white/55 hover:text-white/55">Logout</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto w-full">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/[0.04] sticky top-0 bg-[#0a0b10]/90 backdrop-blur-sm z-10">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/55 hover:text-white/55 text-lg p-1">
            {sidebarOpen ? "X" : "☰"}
          </button>
          <p className="text-xs md:text-sm text-white/55 font-medium">{modMeta?.label || "Dashboard"}</p>
          <div className="flex items-center gap-2">
            <Badge color="#34d399">{profile.specialty}</Badge>
            <span className="text-xs text-white/55 hidden md:inline">{profile.state}</span>
          </div>
        </div>

        {/* Module render */}
        <div className="p-4 md:p-6 max-w-3xl mx-auto">
          {!hasAccess ? (
            <PaywallLock tier={modMeta?.tier || "pro"} onUpgrade={() => setPage("billing")} />
          ) : ModuleComp ? (
            <ModuleComp profile={profile} setProfile={setProfile} navigate={navigate} user={user} standalone={true} />
          ) : (
            <div className="text-center py-20 text-white/55">
              <p className="text-sm">Module not found</p>
              <button onClick={() => setPage("dashboard")} className="text-emerald-400/70 text-xs mt-2">Back to Dashboard</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
