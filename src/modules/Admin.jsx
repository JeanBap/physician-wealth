import { useState, useEffect, useCallback } from "react";
import { PROVIDER_CATEGORIES } from "../lib/data";
import { Section, Card, Btn, Alert, Badge } from "../components/ui";

function loadProviderLinks() {
  try { return JSON.parse(localStorage.getItem("pw_admin_providers") || "null"); } catch { return null; }
}

function saveProviderLinks(data) {
  localStorage.setItem("pw_admin_providers", JSON.stringify(data));
}

export default function Admin({ user }) {
  const isAdmin = user?.email === "papoutsis89@gmail.com" || user?.isAdmin;
  const [providers, setProviders] = useState(() => {
    const saved = loadProviderLinks();
    if (saved) return saved;
    // Initialize from PROVIDER_CATEGORIES
    return PROVIDER_CATEGORIES.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      providers: cat.examples.map((name, i) => ({
        id: `${cat.id}-${i}`,
        name,
        url: "",
        referralCode: "",
        commission: "",
        notes: "",
        active: true,
      })),
    }));
  });
  const [saved, setSaved] = useState(false);
  const [expandedCat, setExpandedCat] = useState(null);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card>
          <p className="text-lg text-red-400 font-bold text-center">Access Denied</p>
          <p className="text-sm text-white/50 text-center mt-2">Admin access required. Sign in with papoutsis89@gmail.com.</p>
        </Card>
      </div>
    );
  }

  const updateProvider = (catId, provId, field, value) => {
    setProviders(prev => prev.map(cat =>
      cat.id === catId ? {
        ...cat,
        providers: cat.providers.map(p => p.id === provId ? { ...p, [field]: value } : p)
      } : cat
    ));
  };

  const addProvider = (catId) => {
    setProviders(prev => prev.map(cat =>
      cat.id === catId ? {
        ...cat,
        providers: [...cat.providers, { id: `${catId}-${Date.now()}`, name: "New Provider", url: "", referralCode: "", commission: "", notes: "", active: true }]
      } : cat
    ));
  };

  const removeProvider = (catId, provId) => {
    setProviders(prev => prev.map(cat =>
      cat.id === catId ? { ...cat, providers: cat.providers.filter(p => p.id !== provId) } : cat
    ));
  };

  const handleSave = () => {
    saveProviderLinks(providers);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const totalProviders = providers.reduce((s, c) => s + c.providers.length, 0);
  const activeProviders = providers.reduce((s, c) => s + c.providers.filter(p => p.active).length, 0);
  const withLinks = providers.reduce((s, c) => s + c.providers.filter(p => p.url).length, 0);

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(providers, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `pw-providers-${new Date().toISOString().split("T")[0]}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setProviders(data);
      saveProviderLinks(data);
      setSaved(true);
    } catch { alert("Invalid JSON file"); }
  };

  return (
    <div className="space-y-5 animate-in">
      <div className="flex items-center justify-between">
        <Section title="Admin Panel" sub="Provider & Referral Management" />
        <div className="flex gap-2">
          <Btn variant="secondary" onClick={exportConfig}>Export</Btn>
          <label className="px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm text-white/50 cursor-pointer hover:bg-white/[0.1] transition">
            Import
            <input type="file" accept=".json" onChange={importConfig} className="hidden" />
          </label>
          <Btn onClick={handleSave}>{saved ? "Saved!" : "Save All"}</Btn>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><p className="text-xs text-white/50">Total Providers</p><p className="text-2xl font-black text-white/65">{totalProviders}</p></Card>
        <Card><p className="text-xs text-white/50">Active</p><p className="text-2xl font-black text-emerald-400">{activeProviders}</p></Card>
        <Card><p className="text-xs text-white/50">With Links</p><p className="text-2xl font-black text-blue-400">{withLinks}</p></Card>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {providers.map(cat => (
          <Card key={cat.id}>
            <button onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
              className="w-full flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <span className="text-xl">{cat.icon}</span>
                <div>
                  <p className="text-sm text-white/65 font-bold">{cat.name}</p>
                  <p className="text-xs text-white/40">{cat.providers.length} providers | {cat.providers.filter(p => p.active).length} active | {cat.providers.filter(p => p.url).length} linked</p>
                </div>
              </div>
              <span className="text-white/40">{expandedCat === cat.id ? "v" : ">"}</span>
            </button>

            {expandedCat === cat.id && (
              <div className="mt-4 space-y-3 animate-in">
                {cat.providers.map(prov => (
                  <div key={prov.id} className={`p-4 rounded-xl border ${prov.active ? "bg-white/[0.02] border-white/[0.06]" : "bg-red-500/[0.02] border-red-500/10 opacity-60"}`}>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Provider Name</label>
                        <input value={prov.name} onChange={e => updateProvider(cat.id, prov.id, "name", e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/65 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">URL / Referral Link</label>
                        <input value={prov.url} onChange={e => updateProvider(cat.id, prov.id, "url", e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/65 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Referral Code</label>
                        <input value={prov.referralCode} onChange={e => updateProvider(cat.id, prov.id, "referralCode", e.target.value)}
                          placeholder="REF123"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/65 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Commission / Rev Share</label>
                        <input value={prov.commission} onChange={e => updateProvider(cat.id, prov.id, "commission", e.target.value)}
                          placeholder="$50/signup or 10%"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/65 outline-none" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs text-white/50 mb-1">Notes</label>
                      <input value={prov.notes} onChange={e => updateProvider(cat.id, prov.id, "notes", e.target.value)}
                        placeholder="Contact person, contract terms, etc."
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/65 outline-none" />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={prov.active} onChange={e => updateProvider(cat.id, prov.id, "active", e.target.checked)} className="accent-emerald-500" />
                        <span className="text-xs text-white/50">Active</span>
                      </label>
                      <button onClick={() => removeProvider(cat.id, prov.id)} className="text-xs text-red-400/50 hover:text-red-400">Remove</button>
                    </div>
                  </div>
                ))}
                <button onClick={() => addProvider(cat.id)}
                  className="w-full py-2.5 rounded-lg border border-dashed border-white/10 text-sm text-white/40 hover:text-white/55 hover:border-white/20 transition">
                  + Add Provider
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {saved && <Alert type="success">Provider configuration saved.</Alert>}
    </div>
  );
}
