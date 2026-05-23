import { useState, useCallback } from "react";
import { MODULES, NOTIFICATION_DEFAULTS } from "../lib/data";
import { upsertProfile, upsertNotificationPrefs } from "../lib/supabase";
import { Section, Alert, Toggle, Btn, Card } from "../components/ui";

export default function Settings({ profile, setProfile, navigate, user }) {
  const [notifs, setNotifs] = useState(profile.notifications || NOTIFICATION_DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("modules");

  const tabs = [
    { id: "modules", label: "Modules", icon: "📊" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "account", label: "Account", icon: "👤" },
    { id: "data", label: "Data & Privacy", icon: "🔒" },
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
  };

  const saveAll = useCallback(async () => {
    setSaving(true);
    try {
      if (user?.id) {
        await upsertProfile(user.id, profile);
        await upsertNotificationPrefs(user.id, notifs);
      }
      // Always save to localStorage as backup
      try { localStorage.setItem("pw_profile", JSON.stringify(profile)); } catch {}
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Save failed", e);
    }
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
        <Section title="Settings" sub="Customize your experience" />
        <button onClick={saveAll} disabled={saving}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${saved ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-white/[0.06] border-white/[0.08] text-white/55 hover:bg-white/[0.1]"} border`}>
          {saving ? "Saving..." : saved ? "Saved!" : "Save All"}
        </button>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/[0.05]">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition ${tab === t.id ? "bg-white/[0.06] text-white/75" : "text-white/55 hover:text-white/55"}`}>
            <span className="mr-1">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {tab === "modules" && (
        <Card>
          <p className="text-xs text-white/55 uppercase tracking-widest mb-3">Active Modules</p>
          <p className="text-xs text-white/55 mb-3">Toggle modules on/off. Disabled modules won't appear in sidebar.</p>
          <div className="space-y-1">
            {Object.entries(MODULES).filter(([k, m]) => !m.always).map(([k, m]) => (
              <div key={k} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.02] transition">
                <div className="flex items-center gap-3">
                  <span className="text-sm opacity-30">{m.icon}</span>
                  <div>
                    <p className="text-sm text-white/65 font-medium">{m.label}</p>
                    <p className="text-xs text-white/55">{m.tier === "free" ? "Free" : m.tier === "pro" ? "Pro" : "Premium"}</p>
                  </div>
                </div>
                <Toggle value={profile.priorities?.includes(k) !== false}
                  onChange={() => toggleModule(k)} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "notifications" && (
        <div className="space-y-3">
          <Card>
            <p className="text-sm text-white/75 font-bold mb-3">Email Notifications</p>
            <div className="space-y-0.5">
              <Toggle label="Weekly summary" sub="Portfolio changes, action items" value={notifs.email_weekly_summary} onChange={v => toggleNotif("email_weekly_summary", v)} />
              <Toggle label="Tax deadlines" sub="Quarterly estimates, filing dates" value={notifs.email_tax_deadlines} onChange={v => toggleNotif("email_tax_deadlines", v)} />
              <Toggle label="License expiry" sub="DEA, state license, board cert" value={notifs.email_license_expiry} onChange={v => toggleNotif("email_license_expiry", v)} />
              <Toggle label="Market alerts" sub="Rate changes affecting your strategy" value={notifs.email_market_alerts} onChange={v => toggleNotif("email_market_alerts", v)} />
              <Toggle label="Product updates" sub="New features and improvements" value={notifs.email_product_updates} onChange={v => toggleNotif("email_product_updates", v)} />
            </div>
          </Card>
          <Card>
            <p className="text-sm text-white/75 font-bold mb-3">Push Notifications</p>
            <div className="space-y-0.5">
              <Toggle label="FI milestones" sub="Portfolio hits target milestones" value={notifs.push_fi_milestones} onChange={v => toggleNotif("push_fi_milestones", v)} />
              <Toggle label="Bill reminders" sub="Insurance, loan, tax payments due" value={notifs.push_bill_reminders} onChange={v => toggleNotif("push_bill_reminders", v)} />
              <Toggle label="Rate changes" sub="Interest rate shifts above 0.25%" value={notifs.push_rate_changes} onChange={v => toggleNotif("push_rate_changes", v)} />
            </div>
          </Card>
        </div>
      )}

      {tab === "account" && (
        <Card>
          <p className="text-sm text-white/75 font-bold mb-3">Account Details</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-white/[0.04]">
              <span className="text-white/65">Email</span><span className="text-white/65">{user?.email || "Not connected"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/[0.04]">
              <span className="text-white/65">Plan</span><span className="text-emerald-400/70">{user?.isAdmin ? "Admin (Full)" : profile.tier || "Free"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/[0.04]">
              <span className="text-white/65">Specialty</span><span className="text-white/65">{profile.specialty || "Not set"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/[0.04]">
              <span className="text-white/65">State</span><span className="text-white/65">{profile.state || "Not set"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-white/65">Data saved</span><span className="text-white/65">{user?.id ? "Cloud + Local" : "Local only"}</span>
            </div>
          </div>
          <button onClick={() => navigate("onboarding")}
            className="mt-4 w-full py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white/75 hover:text-white/65 transition">
            Re-run Onboarding
          </button>
        </Card>
      )}

      {tab === "data" && (
        <div className="space-y-3">
          <Card>
            <p className="text-sm text-white/75 font-bold mb-3">Data Management</p>
            <div className="space-y-2">
              <button onClick={exportData}
                className="w-full py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 font-bold hover:bg-blue-500/15 transition">
                Export All Data (JSON)
              </button>
              <button onClick={() => { if(confirm("Clear all local data?")) { localStorage.clear(); location.reload(); }}}
                className="w-full py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-bold hover:bg-red-500/15 transition">
                Clear Local Data
              </button>
            </div>
            <p className="text-xs text-white/65 mt-3">Data stored locally in your browser and optionally synced to Supabase when signed in. No data sold.</p>
          </Card>
          <Alert type="info">Your data never leaves your browser unless you're signed in. All calculations run client-side.</Alert>
        </div>
      )}

      {saved && <Alert type="success">Settings saved successfully.</Alert>}
    </div>
  );
}
