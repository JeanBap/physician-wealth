// src/modules/Settings.jsx
// PROPS: { profile, setProfile, navigate }
// Full settings: notifications, email preferences, module management, data export, account deletion

import { useState } from "react";
import { MODULES, NOTIFICATION_DEFAULTS } from "../lib/data";
import { Section, Alert, Toggle, Btn, Card } from "../components/ui";

export default function Settings({ profile, setProfile, navigate }) {
  const [notifs, setNotifs] = useState(profile.notifications || NOTIFICATION_DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("modules"); // modules | notifications | account | data

  const tabs = [
    { id: "modules", label: "Modules" },
    { id: "notifications", label: "Notifications" },
    { id: "account", label: "Account" },
    { id: "data", label: "Data & Privacy" },
  ];

  const toggleModule = (id) => {
    setProfile(prev => ({
      ...prev,
      priorities: prev.priorities?.includes(id)
        ? prev.priorities.filter(p => p !== id)
        : [...(prev.priorities || []), id]
    }));
  };

  const toggleNotif = (key, val) => {
    const updated = { ...notifs, [key]: val };
    setNotifs(updated);
    setProfile(prev => ({ ...prev, notifications: updated }));
    // In production: upsertNotificationPrefs(userId, updated)
  };

  const save = () => {
    // In production: upsertProfile(userId, profile) + upsertNotificationPrefs
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const availableModules = Object.entries(MODULES).filter(([k, m]) => !m.always);

  return (
    <div className="space-y-5 animate-in">
      <Section title="Settings" sub="Preferences" />

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-medium transition flex-shrink-0 ${
              tab === t.id
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                : "text-white/25 border border-white/[0.06] hover:text-white/50"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* MODULES TAB */}
      {tab === "modules" && (
        <div className="space-y-4">
          <p className="text-[10px] text-white/25">Toggle modules on/off. Changes take effect immediately.</p>
          <div className="grid grid-cols-1 gap-1.5">
            {availableModules.map(([k, mod]) => {
              const active = profile.priorities?.includes(k);
              const locked = mod.tier !== "free" && !["trial", "pro", "premium"].includes(profile.plan);
              return (
                <button key={k} onClick={() => !locked && toggleModule(k)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition ${
                    active
                      ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                      : "border-white/[0.05] bg-white/[0.02]"
                  } ${locked ? "opacity-40" : ""}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: active ? (mod.color || "#34d399") : "rgba(255,255,255,0.1)" }} />
                    <span className={`text-[11px] font-medium ${active ? "text-white/70" : "text-white/30"}`}>
                      {mod.label}
                    </span>
                    {mod.tier !== "free" && (
                      <span className={`text-[7px] px-1 py-0.5 rounded uppercase font-bold ${
                        mod.tier === "premium" ? "bg-amber-500/15 text-amber-400" : "bg-blue-500/15 text-blue-400"
                      }`}>
                        {mod.tier}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-white/20">{active ? "ON" : "OFF"}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[9px] text-white/15">{(profile.priorities || []).length} modules active</p>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {tab === "notifications" && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Email Notifications</h3>
            <div className="space-y-1 divide-y divide-white/[0.03]">
              <Toggle label="Weekly financial summary" sub="Every Monday morning"
                value={notifs.email_weekly_summary} onChange={v => toggleNotif("email_weekly_summary", v)} />
              <Toggle label="Tax deadline reminders" sub="7 days before quarterly payments"
                value={notifs.email_tax_deadlines} onChange={v => toggleNotif("email_tax_deadlines", v)} />
              <Toggle label="License expiry alerts" sub="30, 14, and 7 days before"
                value={notifs.email_license_expiry} onChange={v => toggleNotif("email_license_expiry", v)} />
              <Toggle label="Market movement alerts" sub="When portfolio changes >5% in a day"
                value={notifs.email_market_alerts} onChange={v => toggleNotif("email_market_alerts", v)} />
              <Toggle label="Product updates" sub="New features and improvements"
                value={notifs.email_product_updates} onChange={v => toggleNotif("email_product_updates", v)} />
            </div>
          </Card>
          <Card>
            <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Push Notifications</h3>
            <div className="space-y-1 divide-y divide-white/[0.03]">
              <Toggle label="FI milestones" sub="When you hit savings targets"
                value={notifs.push_fi_milestones} onChange={v => toggleNotif("push_fi_milestones", v)} />
              <Toggle label="Bill reminders" sub="Upcoming payment due dates"
                value={notifs.push_bill_reminders} onChange={v => toggleNotif("push_bill_reminders", v)} />
              <Toggle label="Interest rate changes" sub="Fed rate decisions affecting your loans"
                value={notifs.push_rate_changes} onChange={v => toggleNotif("push_rate_changes", v)} />
            </div>
          </Card>
        </div>
      )}

      {/* ACCOUNT TAB */}
      {tab === "account" && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Account Details</h3>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between"><span className="text-white/30">Email</span><span className="text-white/60">{profile.email || "not set"}</span></div>
              <div className="flex justify-between"><span className="text-white/30">Plan</span><span className="text-emerald-400 uppercase font-bold">{profile.plan || "trial"}</span></div>
              <div className="flex justify-between"><span className="text-white/30">Member since</span><span className="text-white/60">{new Date().toLocaleDateString()}</span></div>
            </div>
          </Card>
          <Btn variant="secondary" onClick={() => navigate("billing")} className="w-full">
            Manage Subscription
          </Btn>
          <Btn variant="secondary" onClick={() => navigate("profile")} className="w-full">
            Edit Profile
          </Btn>
        </div>
      )}

      {/* DATA & PRIVACY TAB */}
      {tab === "data" && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Your Data</h3>
            <p className="text-[10px] text-white/25 mb-3">
              All data stored in encrypted Supabase database. Bank connections via Plaid (read-only).
            </p>
            <div className="space-y-2">
              <Btn variant="secondary" className="w-full" onClick={() => {
                // In production: fetch all user data, create JSON blob, trigger download
                const data = JSON.stringify(profile, null, 2);
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = "physicianwealth-export.json"; a.click();
              }}>
                Export All Data (JSON)
              </Btn>
              <Btn variant="secondary" className="w-full" onClick={() => {
                // In production: disconnect all Plaid items
                alert("All bank connections would be disconnected. Implement with Plaid item/remove API.");
              }}>
                Disconnect All Banks
              </Btn>
            </div>
          </Card>
          <Card className="border-red-500/15">
            <h3 className="text-[10px] text-red-400/60 uppercase tracking-widest mb-2">Danger Zone</h3>
            <p className="text-[10px] text-white/20 mb-3">
              This permanently deletes your account, all data, and bank connections.
            </p>
            <Btn variant="danger" className="w-full" onClick={() => {
              if (confirm("Are you sure? This cannot be undone.")) {
                // In production: supabase.auth.admin.deleteUser(userId)
                // Cancel Stripe subscription
                // Delete all Plaid items
                alert("Account deletion would happen here.");
              }
            }}>
              Delete Account
            </Btn>
          </Card>
        </div>
      )}

      {saved && <Alert type="success">Settings saved.</Alert>}
    </div>
  );
}
