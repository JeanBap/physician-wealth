import { useState, useEffect, useMemo, useCallback } from "react";

import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <p className="text-xl text-red-400 font-bold mb-2">Something went wrong</p>
          <p className="text-sm text-white/40 mb-4">{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 font-bold">
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
import NetWorthTracker from "./modules/NetWorthTracker";
import TaxCalendar from "./modules/TaxCalendar";
import EmergencyFund from "./modules/EmergencyFund";
import IncomeMap from "./modules/IncomeMap";
import Marketplace from "./modules/Marketplace";
import OfferCompare from "./modules/OfferCompare";
import Admin from "./modules/Admin";
import CredentialTracker from "./modules/CredentialTracker";
import BackdoorRoth from "./modules/BackdoorRoth";
import DebtPayoff from "./modules/DebtPayoff";
import NegotiationKit from "./modules/NegotiationKit";
import W4Optimizer from "./modules/W4Optimizer";
import ChecklistHub from "./modules/ChecklistHub";
import CharitableGiving from "./modules/CharitableGiving";
import LocumRates from "./modules/LocumRates";
import PartnershipTrack from "./modules/PartnershipTrack";
import LifestyleCreep from "./modules/LifestyleCreep";

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
  nwtracker: NetWorthTracker,
  taxcalendar: TaxCalendar,
  emergency: EmergencyFund,
  incomemap: IncomeMap,
  marketplace: Marketplace,
  offercompare: OfferCompare,
  admin: Admin,
  credentials: CredentialTracker,
  backdoorroth: BackdoorRoth,
  debtpayoff: DebtPayoff,
  negotiate: NegotiationKit,
  w4optimizer: W4Optimizer,
  checklists: ChecklistHub,
  charitable: CharitableGiving,
  locumrates: LocumRates,
  partnership: PartnershipTrack,
  creep: LifestyleCreep,
};

export default function App() {
  const [view, setView] = useState(() => {
    try {
      const savedUser = localStorage.getItem("pw_user");
      if (savedUser) return "app";
    } catch {}
    return "landing";
  }); // landing | auth | onboarding | app
  // Hash-based routing for URL slugs
  const getHash = () => window.location.hash.replace("#/", "") || "dashboard";
  const [page, setPage] = useState(getHash);
  
  useEffect(() => {
    const onHash = () => setPage(getHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("pw_profile");
      if (saved) return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    } catch {}
    return { ...DEFAULT_PROFILE };
  });

  // Auto-save profile to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem("pw_profile", JSON.stringify(profile)); } catch {}
  }, [profile]);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("pw_user");
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Auto-save user to localStorage
  useEffect(() => {
    try {
      if (user) localStorage.setItem("pw_user", JSON.stringify(user));
      else localStorage.removeItem("pw_user");
    } catch {}
  }, [user]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useCallback((target) => {
    if (["landing", "auth", "onboarding"].includes(target)) {
      setView(target);
    } else {
      setView("app");
      window.location.hash = "#/" + target;
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
    <div className="flex h-screen relative overflow-hidden" style={{ background: "#06070b", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Animated background orbs */}
      <div className="orb orb-1" style={{ top:"-10%", left:"-5%" }} />
      <div className="orb orb-2" style={{ bottom:"-15%", right:"-10%" }} />
      <div className="orb orb-3" style={{ top:"40%", right:"20%" }} />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-50" />
      
      {/* Mobile overlay */}
      {/* Mobile sidebar overlay */}
      <div className={`md:hidden fixed inset-0 z-20 transition-opacity duration-300 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <aside className={`absolute left-0 top-0 h-full w-64 transition-transform duration-300 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ background:"rgba(8,9,14,0.95)", backdropFilter:"blur(20px)" }}>
          <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
            <p className="text-emerald-400 text-base font-black" style={{ fontFamily:"'Instrument Serif', Georgia, serif" }}>PhysicianWealth</p>
            <button onClick={() => setSidebarOpen(false)} className="text-white/40 text-lg">X</button>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            {Object.entries(sidebarSections).map(([cat, items]) => (
              <div key={cat} className="mb-2">
                <p className="text-sm text-white/40 uppercase tracking-widest px-4 py-1.5 font-bold">{cat}</p>
                {items.map(m => {
                  const active = page === m.key;
                  const locked = !canAccessModule(m.tier, userTier, trialExpired);
                  return (
                    <button key={m.key} onClick={() => { navigate(m.key); setSidebarOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition ${active ? "bg-emerald-500/[0.08] text-emerald-400" : "text-white/50 hover:text-white/65 hover:bg-white/[0.02]"} ${locked ? "opacity-40" : ""}`}>
                      <span className="text-sm truncate">{m.label}</span>
                      {locked && <span className="text-xs text-white/40">&#128274;</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>
      </div>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60" : "w-0 overflow-hidden"} hidden md:flex border-r border-white/[0.04] transition-all duration-300 flex-shrink-0 flex-col relative z-30`} style={{ background:"rgba(8,9,14,0.9)", backdropFilter:"blur(20px)" }}>
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
                  <button key={m.key} onClick={() => { navigate(m.key); setSidebarOpen(false); }}
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
            <button onClick={() => { navigate("settings"); setSidebarOpen(false); }} className="text-xs text-white/55 hover:text-white/55">Settings</button>
            <button onClick={() => { navigate("billing"); setSidebarOpen(false); }} className="text-xs text-white/55 hover:text-white/55">Billing</button>
            <button onClick={() => { setUser(null); setView("landing"); localStorage.removeItem("pw_user"); }} className="text-xs text-white/55 hover:text-white/55">Logout</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto w-full relative min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/[0.04] sticky top-0 z-10" style={{ background:"rgba(6,7,11,0.8)", backdropFilter:"blur(16px)" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/40 hover:text-white/60 text-lg p-1 transition">
            {sidebarOpen ? "" : "☰"}
          </button>
          <p className="text-xs md:text-sm text-white/55 font-medium">{modMeta?.label || "Dashboard"}</p>
          <div className="flex items-center gap-2">
            <Badge color="#34d399">{profile.specialty}</Badge>
            <span className="text-xs text-white/55 hidden md:inline">{profile.state}</span>
          </div>
        </div>

        {/* Module render */}
        <div className="p-4 md:p-6 pb-16 max-w-3xl mx-auto">
          {!hasAccess ? (
            <PaywallLock tier={modMeta?.tier || "pro"} onUpgrade={() => setPage("billing")} />
          ) : ModuleComp ? (
            <ErrorBoundary><ModuleComp profile={profile} setProfile={setProfile} navigate={navigate} user={user} standalone={true} /></ErrorBoundary>
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
