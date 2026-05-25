import { useState, useEffect } from "react";
import { Icon } from "../components/icons";
import { Section, Card, Alert, Btn, Badge, Takeaway } from "../components/ui";

const CREDENTIAL_TYPES = [
  { type:"medical_license", label:"State Medical License", renewalYears:2, cmeRequired:true, icon:"hospital" },
  { type:"dea", label:"DEA Registration", renewalYears:3, cmeRequired:false, icon:"pill" },
  { type:"board_cert", label:"Board Certification", renewalYears:10, cmeRequired:true, icon:"filetext" },
  { type:"bls", label:"BLS/ACLS Certification", renewalYears:2, cmeRequired:false, icon:"wellness" },
  { type:"state_license_2", label:"Additional State License", renewalYears:2, cmeRequired:true, icon:"locumrates" },
  { type:"hospital_privileges", label:"Hospital Privileges", renewalYears:2, cmeRequired:false, icon:"hospital" },
  { type:"malpractice", label:"Malpractice Insurance", renewalYears:1, cmeRequired:false, icon:"scale" },
  { type:"npi", label:"NPI Number", renewalYears:0, cmeRequired:false, icon:"rvucalc" },
  { type:"caqh", label:"CAQH Profile", renewalYears:0.25, cmeRequired:false, icon:"clipboard" },
];

function loadCredentials() {
  try { return JSON.parse(localStorage.getItem("pw_credentials") || "[]"); } catch { return []; }
}

export default function CredentialTracker({ profile }) {
  const [credentials, setCredentials] = useState(loadCredentials);
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState("medical_license");
  const [newExpiry, setNewExpiry] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [cmeCredits, setCmeCredits] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pw_cme") || '{"earned":0,"required":50,"cycle":"2024-2026"}'); } catch { return {earned:0,required:50,cycle:"2024-2026"}; }
  });

  useEffect(() => { localStorage.setItem("pw_credentials", JSON.stringify(credentials)); }, [credentials]);
  useEffect(() => { localStorage.setItem("pw_cme", JSON.stringify(cmeCredits)); }, [cmeCredits]);

  const addCredential = () => {
    if (!newExpiry) return;
    const typeInfo = CREDENTIAL_TYPES.find(t => t.type === newType);
    credentials.push({ id: Date.now(), type: newType, label: typeInfo?.label || newType, icon: typeInfo?.icon || "📄", expiry: newExpiry, notes: newNotes, renewalYears: typeInfo?.renewalYears || 1 });
    setCredentials([...credentials]);
    setShowAdd(false); setNewExpiry(""); setNewNotes("");
  };

  const removeCredential = (id) => setCredentials(credentials.filter(c => c.id !== id));

  const today = new Date();
  const sorted = [...credentials].sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
  const expiringSoon = sorted.filter(c => { const d = new Date(c.expiry); const diff = (d - today) / 86400000; return diff > 0 && diff <= 90; });
  const expired = sorted.filter(c => new Date(c.expiry) < today);

  const cmePct = cmeCredits.required > 0 ? Math.min(100, Math.round(cmeCredits.earned / cmeCredits.required * 100)) : 0;

  return (
    <div className="space-y-5 animate-in">
      <Section title="Credential Tracker" sub="Licenses, CME, Renewals" />

      {expired.length > 0 && <Alert type="danger">{expired.length} credential(s) EXPIRED: {expired.map(c => c.label).join(", ")}. Renew immediately to avoid claim denials.</Alert>}
      {expiringSoon.length > 0 && <Alert type="warn">{expiringSoon.length} credential(s) expiring within 90 days.</Alert>}

      {/* CME Progress */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-white/55 font-bold">CME Credits ({cmeCredits.cycle})</p>
          <span className="text-sm font-bold" style={{ color: cmePct >= 100 ? "#34d399" : cmePct > 50 ? "#fbbf24" : "#f87171" }}>{cmeCredits.earned}/{cmeCredits.required}</span>
        </div>
        <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full transition-all duration-500" style={{ width:`${cmePct}%`, background: cmePct >= 100 ? "#34d399" : cmePct > 50 ? "#fbbf24" : "#f87171" }} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-white/50 mb-1">Credits earned</label>
            <input value={cmeCredits.earned} onChange={e => setCmeCredits(prev => ({...prev, earned:+e.target.value}))} type="number"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/65 outline-none" />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Required</label>
            <input value={cmeCredits.required} onChange={e => setCmeCredits(prev => ({...prev, required:+e.target.value}))} type="number"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/65 outline-none" />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Cycle</label>
            <input value={cmeCredits.cycle} onChange={e => setCmeCredits(prev => ({...prev, cycle:e.target.value}))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/65 outline-none" />
          </div>
        </div>
      </Card>

      {/* Credentials list */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-white/55 font-bold">Active Credentials ({credentials.length})</p>
          <Btn variant="secondary" onClick={() => setShowAdd(!showAdd)}>{showAdd ? "Cancel" : "+ Add"}</Btn>
        </div>

        {showAdd && (
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] mb-3 space-y-2 animate-in">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-white/50 mb-1">Type</label>
                <select value={newType} onChange={e => setNewType(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/65 outline-none">
                  {CREDENTIAL_TYPES.map(t => <option key={t.type} value={t.type} className="bg-[#13141c]">{t.icon} {t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Expiry date</label>
                <input type="date" value={newExpiry} onChange={e => setNewExpiry(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/65 outline-none" />
              </div>
            </div>
            <input value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Notes (state, number, etc.)"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/65 outline-none" />
            <Btn onClick={addCredential}>Add Credential</Btn>
          </div>
        )}

        {credentials.length === 0 && !showAdd && (
          <p className="text-sm text-white/40 text-center py-6">No credentials tracked yet. Add your medical license, DEA, and board certification to get expiry alerts.</p>
        )}

        <div className="space-y-2">
          {sorted.map(cred => {
            const expDate = new Date(cred.expiry);
            const daysLeft = Math.ceil((expDate - today) / 86400000);
            const isExpired = daysLeft < 0;
            const isUrgent = daysLeft >= 0 && daysLeft <= 30;
            const isSoon = daysLeft > 30 && daysLeft <= 90;
            return (
              <div key={cred.id} className={`flex items-center justify-between py-3 px-3 rounded-xl border ${isExpired ? "bg-red-500/[0.04] border-red-500/15" : isUrgent ? "bg-amber-500/[0.04] border-amber-500/10" : "border-white/[0.04]"}`}>
                <div className="flex items-center gap-3">
                  <Icon name={cred.icon} size={16} className="opacity-70" />
                  <div>
                    <p className="text-sm text-white/65 font-medium">{cred.label}</p>
                    <p className="text-xs text-white/40">{cred.notes || ""} {cred.renewalYears > 0 ? `| Renews every ${cred.renewalYears}yr` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isExpired ? "text-red-400" : isUrgent ? "text-amber-400" : isSoon ? "text-amber-400/70" : "text-white/55"}`}>
                      {isExpired ? `Expired ${Math.abs(daysLeft)}d ago` : `${daysLeft}d left`}
                    </p>
                    <p className="text-xs text-white/40">{expDate.toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => removeCredential(cred.id)} className="text-xs text-red-400/40 hover:text-red-400">X</button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Takeaway items={[
        `${credentials.length} credentials tracked. ${expired.length > 0 ? `${expired.length} EXPIRED. Renew immediately.` : expiringSoon.length > 0 ? `${expiringSoon.length} expiring soon.` : "All current."}`,
        `CME progress: ${cmeCredits.earned}/${cmeCredits.required} credits (${cmePct}%). ${cmePct < 50 ? "Behind pace. Schedule CME activities." : "On track."}`,
        `Missed license renewals cause claim denials and revenue loss. 80%+ of healthcare orgs experience credentialing delays.`,
      ]} />
    </div>
  );
}
