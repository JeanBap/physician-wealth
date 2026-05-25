import { useState, useCallback } from "react";
import { Icon } from "../components/icons";
import { MODULES, SPECIALTIES, STATE_NAMES, NOTIFICATION_DEFAULTS } from "../lib/data";
import { upsertProfile, upsertNotificationPrefs } from "../lib/supabase";
import { Section, Alert, Toggle, Btn, Card, Inp } from "../components/ui";

export default function Settings({ profile, setProfile, navigate, user }) {
  const [notifs, setNotifs] = useState(profile.notifications || NOTIFICATION_DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("profile");

  const tabs = [
    { id:"profile", label:"Profile", icon:"community" },
    { id:"financial", label:"Financials", icon:"money" },
    { id:"insurance", label:"Insurance & Estate", icon:"shield" },
    { id:"modules", label:"Modules", icon:"chart" },
    { id:"notifications", label:"Alerts", icon:"bell" },
    { id:"data", label:"Data", icon:"lock" },
  ];

  const update = (k, v) => setProfile(prev => ({ ...prev, [k]: v }));

  const toggleNotif = (key, val) => {
    const updated = { ...notifs, [key]: val };
    setNotifs(updated);
    setProfile(prev => ({ ...prev, notifications: updated }));
  };

  const saveAll = useCallback(async () => {
    setSaving(true);
    try {
      if (user?.id) {
        await upsertProfile(user.id, profile);
        await upsertNotificationPrefs(user.id, notifs);
      }
      try { localStorage.setItem("pw_profile", JSON.stringify(profile)); } catch {}
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error("Save failed", e); }
    setSaving(false);
  }, [profile, notifs, user]);

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ profile, notifications: notifs }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `physician-wealth-${new Date().toISOString().split("T")[0]}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-in">
      <div className="flex items-center justify-between">
        <Section title="Settings" sub="Edit your profile and preferences" />
        <button onClick={saveAll} disabled={saving}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${saved ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-white/[0.06] border-white/[0.08] text-white/55 hover:bg-white/[0.1]"} border`}>
          {saving ? "Saving..." : saved ? "Saved!" : "Save All"}
        </button>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/[0.05] overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-bold transition ${tab === t.id ? "bg-white/[0.06] text-white/75" : "text-white/55 hover:text-white/55"}`}>
            <Icon name={t.icon} size={16} className="opacity-70" />{t.label}
          </button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {tab === "profile" && (
        <div className="space-y-4">
          <Card>
            <p className="text-sm text-white/55 font-bold mb-3">Personal Information</p>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="First name" value={profile.firstName} onChange={v => update("firstName", v)} />
              <Inp label="Last name" value={profile.lastName} onChange={v => update("lastName", v)} />
              <Inp label="Age" value={profile.age} onChange={v => update("age", +v)} type="number" />
              <Inp label="Marital status" value={profile.married ? "yes" : "no"} onChange={v => update("married", v === "yes")}
                options={[{v:"no",l:"Single"},{v:"yes",l:"Married"}]} />
            </div>
          </Card>
          <Card>
            <p className="text-sm text-white/55 font-bold mb-3">Medical Career</p>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Specialty" value={profile.specialty} onChange={v => update("specialty", v)}
                options={Object.keys(SPECIALTIES).map(s => ({ v:s, l:s }))} />
              <Inp label="State" value={profile.state} onChange={v => update("state", v)}
                options={Object.entries(STATE_NAMES).map(([k,v]) => ({ v:k, l:v }))} />
              <Inp label="Career stage" value={profile.stage} onChange={v => update("stage", v)}
                options={[{v:"resident",l:"Resident/Fellow"},{v:"early",l:"Early Career (1-5yr)"},{v:"mid",l:"Mid-Career (5-15yr)"},{v:"senior",l:"Senior (15yr+)"}]} />
              <Inp label="Target retirement age" value={profile.retireAge} onChange={v => update("retireAge", +v)} type="number" />
            </div>
          </Card>
          <Card>
            <p className="text-sm text-white/55 font-bold mb-3">Family</p>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Number of children" value={profile.kids} onChange={v => update("kids", +v)} type="number" />
              <div />
            </div>
            <Toggle label="Spouse is also a physician" value={profile.hasSpouse} onChange={v => update("hasSpouse", v)} />
            {profile.hasSpouse && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Inp label="Spouse specialty" value={profile.spouseSpecialty} onChange={v => update("spouseSpecialty", v)}
                  options={[{v:"Non-physician",l:"Non-physician"},...Object.keys(SPECIALTIES).map(s => ({v:s,l:s}))]} />
                <Inp label="Spouse salary" value={profile.spouseSalary} onChange={v => update("spouseSalary", +v)} type="number" pre="$" />
                <Inp label="Spouse student loans" value={profile.spouseLoans} onChange={v => update("spouseLoans", +v)} type="number" pre="$" />
              </div>
            )}
          </Card>
          <Card>
            <p className="text-sm text-white/55 font-bold mb-3">Account</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-white/[0.04]"><span className="text-white/50">Email</span><span className="text-white/65">{user?.email || "Demo mode"}</span></div>
              <div className="flex justify-between py-2 border-b border-white/[0.04]"><span className="text-white/50">Plan</span><span className="text-emerald-400/70">{user?.isAdmin ? "Admin (Full)" : profile.tier || "Free"}</span></div>
              <div className="flex justify-between py-2"><span className="text-white/50">Data storage</span><span className="text-white/65">{user?.id && user.id !== "local" && user.id !== "demo" ? "Cloud + Local" : "Local only"}</span></div>
            </div>
          </Card>
        </div>
      )}

      {/* FINANCIAL TAB */}
      {tab === "financial" && (
        <div className="space-y-4">
          <Card>
            <p className="text-sm text-white/55 font-bold mb-3">Income</p>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="W-2 salary" value={profile.salary} onChange={v => update("salary", +v)} type="number" pre="$" />
              <Inp label="Moonlighting income" value={profile.moonlightIncome} onChange={v => update("moonlightIncome", +v)} type="number" pre="$" />
              <Inp label="Rental income (annual)" value={profile.rentalIncome} onChange={v => update("rentalIncome", +v)} type="number" pre="$" />
            </div>
          </Card>
          <Card>
            <p className="text-sm text-white/55 font-bold mb-3">Debt</p>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Student loans" value={profile.loans} onChange={v => update("loans", +v)} type="number" pre="$" />
              <Inp label="Mortgage balance" value={profile.mortgageBalance} onChange={v => update("mortgageBalance", +v)} type="number" pre="$" />
              <Inp label="Car loan" value={profile.carLoan} onChange={v => update("carLoan", +v)} type="number" pre="$" />
              <Inp label="Credit card debt" value={profile.creditCardDebt} onChange={v => update("creditCardDebt", +v)} type="number" pre="$" />
            </div>
          </Card>
          <Card>
            <p className="text-sm text-white/55 font-bold mb-3">Assets</p>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Liquid savings" value={profile.savings} onChange={v => update("savings", +v)} type="number" pre="$" />
              <Inp label="Retirement accounts" value={profile.retirement} onChange={v => update("retirement", +v)} type="number" pre="$" />
              <Inp label="Taxable investments" value={profile.investments} onChange={v => update("investments", +v)} type="number" pre="$" />
              <Inp label="HSA balance" value={profile.hsa} onChange={v => update("hsa", +v)} type="number" pre="$" />
              <Inp label="529 plans" value={profile.plan529} onChange={v => update("plan529", +v)} type="number" pre="$" />
              <Inp label="Crypto / alt assets" value={profile.cryptoAssets} onChange={v => update("cryptoAssets", +v)} type="number" pre="$" />
            </div>
          </Card>
          <Card>
            <p className="text-sm text-white/55 font-bold mb-3">Real Estate</p>
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Primary home value" value={profile.homeValue} onChange={v => update("homeValue", +v)} type="number" pre="$" />
              <Inp label="Rental property value" value={profile.rentalPropertyValue} onChange={v => update("rentalPropertyValue", +v)} type="number" pre="$" />
              <Inp label="Rental equity" value={profile.rentalPropertyEquity} onChange={v => update("rentalPropertyEquity", +v)} type="number" pre="$" />
            </div>
          </Card>
        </div>
      )}

      {/* INSURANCE & ESTATE TAB */}
      {tab === "insurance" && (
        <div className="space-y-4">
          <Card>
            <p className="text-sm text-white/55 font-bold mb-3">Insurance Coverage</p>
            <div className="space-y-1">
              <Toggle label="Own-occupation disability insurance" sub="Pays if you can't do YOUR specialty" value={profile.hasDI} onChange={v => update("hasDI", v)} />
              <Toggle label="Umbrella liability ($2M+)" sub="Excess coverage beyond auto/home" value={profile.hasUmbrella} onChange={v => update("hasUmbrella", v)} />
              <Toggle label="Term life insurance" sub="Income replacement for dependents" value={profile.hasLifeInsurance} onChange={v => update("hasLifeInsurance", v)} />
            </div>
            {profile.hasDI && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Inp label="DI coverage ($/mo)" value={profile.diCoverageMonthly} onChange={v => update("diCoverageMonthly", +v)} type="number" pre="$" />
              </div>
            )}
            {profile.hasLifeInsurance && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Inp label="Life coverage amount" value={profile.lifeCoverage} onChange={v => update("lifeCoverage", +v)} type="number" pre="$" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Inp label="Malpractice premium ($/yr)" value={profile.malpracticePremium} onChange={v => update("malpracticePremium", +v)} type="number" pre="$" />
            </div>
          </Card>
          <Card>
            <p className="text-sm text-white/55 font-bold mb-3">Estate Planning</p>
            <div className="space-y-1">
              <Toggle label="Will / testament" sub="Basic estate document" value={profile.hasWill} onChange={v => update("hasWill", v)} />
              <Toggle label="Revocable living trust" sub="Avoids probate, maintains privacy" value={profile.hasTrust} onChange={v => update("hasTrust", v)} />
              <Toggle label="Power of attorney" sub="Financial decision-maker if incapacitated" value={profile.hasPOA} onChange={v => update("hasPOA", v)} />
              <Toggle label="Healthcare directive" sub="Medical wishes documented" value={profile.hasHealthcareDirective} onChange={v => update("hasHealthcareDirective", v)} />
            </div>
          </Card>
        </div>
      )}

      {/* MODULES TAB */}
      {tab === "modules" && (
        <Card>
          <p className="text-sm text-white/55 font-bold mb-3">Active Modules</p>
          <p className="text-xs text-white/50 mb-3">Toggle modules on/off. Disabled modules won't appear in the sidebar.</p>
          <div className="space-y-0.5">
            {Object.entries(MODULES).filter(([k, m]) => !m.always).map(([k, m]) => (
              <div key={k} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.02] transition">
                <div className="flex items-center gap-3">
                  <Icon name={m.icon} size={16} className="opacity-70" />
                  <div>
                    <p className="text-sm text-white/55 font-medium">{m.label}</p>
                    <p className="text-xs text-white/50">{m.tier === "free" ? "Free" : m.tier === "pro" ? "Pro" : "Premium"} | {m.cat}</p>
                  </div>
                </div>
                <Toggle value={!(profile.disabledModules || []).includes(k)}
                  onChange={() => setProfile(prev => {
                    const disabled = prev.disabledModules || [];
                    return { ...prev, disabledModules: disabled.includes(k) ? disabled.filter(p => p !== k) : [...disabled, k] };
                  })} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* NOTIFICATIONS TAB */}
      {tab === "notifications" && (
        <div className="space-y-3">
          <Card>
            <p className="text-sm text-white/55 font-bold mb-3">Email Notifications</p>
            <div className="space-y-0.5">
              <Toggle label="Weekly summary" sub="Portfolio changes and action items" value={notifs.email_weekly_summary} onChange={v => toggleNotif("email_weekly_summary", v)} />
              <Toggle label="Tax deadlines" sub="Quarterly estimates and filing dates" value={notifs.email_tax_deadlines} onChange={v => toggleNotif("email_tax_deadlines", v)} />
              <Toggle label="License expiry" sub="DEA, state license, board certification" value={notifs.email_license_expiry} onChange={v => toggleNotif("email_license_expiry", v)} />
              <Toggle label="Market alerts" sub="Rate changes affecting your strategy" value={notifs.email_market_alerts} onChange={v => toggleNotif("email_market_alerts", v)} />
              <Toggle label="Product updates" sub="New features and improvements" value={notifs.email_product_updates} onChange={v => toggleNotif("email_product_updates", v)} />
            </div>
          </Card>
          <Card>
            <p className="text-sm text-white/55 font-bold mb-3">Push Notifications</p>
            <div className="space-y-0.5">
              <Toggle label="FI milestones" sub="Portfolio hits target milestones" value={notifs.push_fi_milestones} onChange={v => toggleNotif("push_fi_milestones", v)} />
              <Toggle label="Bill reminders" sub="Insurance, loan, tax payments due" value={notifs.push_bill_reminders} onChange={v => toggleNotif("push_bill_reminders", v)} />
              <Toggle label="Rate changes" sub="Interest rate shifts above 0.25%" value={notifs.push_rate_changes} onChange={v => toggleNotif("push_rate_changes", v)} />
            </div>
          </Card>
        </div>
      )}

      {/* DATA TAB */}
      {tab === "data" && (
        <div className="space-y-3">
          <Card>
            <p className="text-sm text-white/55 font-bold mb-3">Data Management</p>
            <div className="space-y-2">
              <button onClick={exportData}
                className="w-full py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 font-bold hover:bg-blue-500/15 transition">
                Export All Data (JSON)
              </button>
              <button onClick={() => navigate("onboarding")}
                className="w-full py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white/55 hover:bg-white/[0.06] transition">
                Re-run Onboarding Wizard
              </button>
              <button onClick={() => { if(confirm("Clear all local data? This cannot be undone.")) { localStorage.clear(); location.reload(); }}}
                className="w-full py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-bold hover:bg-red-500/15 transition">
                Clear All Local Data
              </button>
            </div>
            <p className="text-xs text-white/40 mt-3">Data stored locally in your browser and optionally synced to the cloud when signed in. We never sell your data.</p>
          </Card>
        </div>
      )}

      {saved && <Alert type="success">All changes saved.</Alert>}
    </div>
  );
}
