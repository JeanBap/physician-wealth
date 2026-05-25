import { useState, useEffect, useCallback, useMemo } from "react";
import { Icon } from "../components/icons";
import { SPECIALTIES, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Alert, Btn, Badge } from "../components/ui";
import { saveDocument, getDocuments, updateDocument, deleteDocument, getUserContext, saveUserContext } from "../lib/supabase";
import { analyzeTriple, analyzeDouble } from "../lib/ai";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { chartText } from "../lib/chartColors";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-[#13141c] border border-white/10 rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/40 mb-1">{label}</p>
    {payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: {p.value}</p>)}</div>);
};

const DOC_TYPES = [
  { v:"tax_return", l:"Tax Return", icon:"chart", color:"#a78bfa" },
  { v:"contract", l:"Employment Contract", icon:"memo", color:"#f87171" },
  { v:"insurance", l:"Insurance Policy", icon:"shield", color:"#fbbf24" },
  { v:"paystub", l:"Pay Stub / W-2", icon:"money", color:"#34d399" },
  { v:"loan_stmt", l:"Loan Statement", icon:"target", color:"#60a5fa" },
  { v:"investment", l:"Investment Statement", icon:"trendingup", color:"#f472b6" },
  { v:"real_estate", l:"Property / Lease", icon:"home", color:"#fbbf24" },
  { v:"medical", l:"License / Credential", icon:"hospital", color:"#818cf8" },
  { v:"estate", l:"Will / Trust / POA", icon:"clipboard", color:"#a78bfa" },
  { v:"other", l:"Other Document", icon:"filetext", color:"var(--chartText, rgba(0,0,0,0.3))" },
];

function buildContextMd(profile, docs) {
  const spec = SPECIALTIES[profile.specialty] || {};
  const totalIncome = (profile.salary||0) + (profile.moonlightIncome||0) + (profile.rentalIncome||0);
  const totalDebt = (profile.loans||0) + (profile.mortgageBalance||0) + (profile.carLoan||0) + (profile.creditCardDebt||0);
  const totalAssets = (profile.savings||0) + (profile.retirement||0) + (profile.investments||0) +
    (profile.hsa||0) + (profile.plan529||0) + (profile.cryptoAssets||0) +
    Math.max(0, (profile.homeValue||0) - (profile.mortgageBalance||0)) + (profile.rentalPropertyEquity||0);

  let md = `# Physician Financial Profile\n\n`;
  md += `## Identity\n`;
  md += `- Name: Dr. ${profile.firstName || ""} ${profile.lastName || ""}\n`;
  md += `- Specialty: ${profile.specialty} (median ${fmt(spec.m||0)}, burnout ${spec.burn||0}%, claim rate ${((spec.claimRate||0)*100).toFixed(1)}%)\n`;
  md += `- State: ${profile.state || "NY"}\n`;
  md += `- Age: ${profile.age || 35} | Career stage: ${profile.stage || "early"}\n`;
  md += `- Married: ${profile.married ? "Yes" : "No"}${profile.kids > 0 ? ` | Children: ${profile.kids}` : ""}\n`;
  if (profile.hasSpouse && profile.spouseSpecialty) {
    md += `- Spouse: ${profile.spouseSpecialty}, salary ${fmt(profile.spouseSalary||0)}, loans ${fmt(profile.spouseLoans||0)}\n`;
  }
  md += `\n## Income\n`;
  md += `- W-2 salary: ${fmt(profile.salary||0)}\n`;
  if (profile.moonlightIncome > 0) md += `- Moonlighting: ${fmt(profile.moonlightIncome)}\n`;
  if (profile.rentalIncome > 0) md += `- Rental income: ${fmt(profile.rentalIncome)}\n`;
  md += `- Total income: ${fmt(totalIncome)}\n`;
  md += `\n## Assets (${fmt(totalAssets)})\n`;
  md += `- Savings: ${fmt(profile.savings||0)}\n`;
  md += `- Retirement (401k/IRA): ${fmt(profile.retirement||0)}\n`;
  md += `- Investments: ${fmt(profile.investments||0)}\n`;
  if (profile.hsa > 0) md += `- HSA: ${fmt(profile.hsa)}\n`;
  if (profile.plan529 > 0) md += `- 529 plans: ${fmt(profile.plan529)}\n`;
  if (profile.cryptoAssets > 0) md += `- Crypto/alt: ${fmt(profile.cryptoAssets)}\n`;
  if (profile.homeValue > 0) md += `- Home value: ${fmt(profile.homeValue)} (equity: ${fmt(Math.max(0, profile.homeValue - (profile.mortgageBalance||0)))})\n`;
  if (profile.rentalPropertyValue > 0) md += `- Rental property: ${fmt(profile.rentalPropertyValue)} (equity: ${fmt(profile.rentalPropertyEquity||0)})\n`;
  md += `\n## Debt (${fmt(totalDebt)})\n`;
  if (profile.loans > 0) md += `- Student loans: ${fmt(profile.loans)}\n`;
  if (profile.mortgageBalance > 0) md += `- Mortgage: ${fmt(profile.mortgageBalance)}\n`;
  if (profile.carLoan > 0) md += `- Car loan: ${fmt(profile.carLoan)}\n`;
  if (profile.creditCardDebt > 0) md += `- Credit card: ${fmt(profile.creditCardDebt)}\n`;
  md += `\n## Net Worth: ${fmt(totalAssets - totalDebt)}\n`;
  md += `\n## Insurance\n`;
  md += `- Disability (own-occ): ${profile.hasDI ? "YES" : "NO"}\n`;
  md += `- Umbrella ($2M+): ${profile.hasUmbrella ? "YES" : "NO"}\n`;
  md += `- Life insurance: ${profile.hasLifeInsurance ? "YES" : "NO"}\n`;
  md += `\n## Estate Planning\n`;
  md += `- Will: ${profile.hasWill ? "YES" : "NO"}\n`;
  md += `- Trust: ${profile.hasTrust ? "YES" : "NO"}\n`;
  md += `- POA: ${profile.hasPOA ? "YES" : "NO"}\n`;
  md += `- Healthcare directive: ${profile.hasHealthcareDirective ? "YES" : "NO"}\n`;
  md += `- Target retirement age: ${profile.retireAge || 60}\n`;

  if (docs.length > 0) {
    md += `\n## Uploaded Documents (${docs.length})\n\n`;
    docs.forEach((d, i) => {
      const type = DOC_TYPES.find(t => t.v === d.file_type);
      md += `### ${i+1}. ${d.filename} (${type?.l || d.file_type})\n`;
      md += `- Uploaded: ${new Date(d.created_at).toLocaleDateString()}\n`;
      md += `- Status: ${d.status || "uploaded"}\n`;
      if (d.ai_summary) {
        md += `- AI Summary: ${d.ai_summary}\n`;
      }
      if (d.ai_key_findings && Array.isArray(d.ai_key_findings)) {
        md += `- Key Findings:\n`;
        d.ai_key_findings.forEach(f => { md += `  - ${f}\n`; });
      }
      md += `\n`;
    });
  }

  return md;
}

export default function DocumentVault({ profile, user }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);
  const [contextMd, setContextMd] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [selectedType, setSelectedType] = useState("other");
  const [tab, setTab] = useState("docs"); // docs | context | upload

  const userId = user?.id || "local";

  // Load docs on mount
  useEffect(() => {
    (async () => {
      const { data } = await getDocuments(userId);
      setDocs(data || []);
      const { data: ctx } = await getUserContext(userId);
      if (ctx?.context_md) setContextMd(ctx.context_md);
      setLoading(false);
    })();
  }, [userId]);

  // Upload handler
  const handleUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    // Read file content
    const text = await file.text();
    const truncated = text.slice(0, 50000); // limit for AI

    const doc = {
      filename: file.name,
      file_type: selectedType,
      file_size: file.size,
      content_text: truncated,
      source_module: "vault",
      status: "uploaded",
      tags: [selectedType],
    };

    const { data: saved } = await saveDocument(userId, doc);
    if (saved) {
      setDocs(prev => [saved, ...prev]);
    }
    setUploading(false);
    e.target.value = "";
  }, [userId, selectedType]);

  // AI analyze a document
  const analyzeDoc = useCallback(async (doc) => {
    setAnalyzing(doc.id);
    try {
      const systemPrompt = `You are a physician financial advisor AI. Analyze this ${DOC_TYPES.find(t => t.v === doc.file_type)?.l || "document"} for a ${profile.specialty} physician earning ${fmt(profile.salary||0)} in ${profile.state||"NY"}.

Return a JSON object with:
- "summary": 2-3 sentence overview
- "key_findings": array of 3-8 specific findings (strings)
- "risk_flags": array of any concerns
- "action_items": array of recommended next steps
- "estimated_impact": dollar amount this could save/cost annually

Be specific with numbers. Reference the physician's specialty and income level.`;

      const result = await analyzeTriple(systemPrompt, doc.content_text || "No content available");

      let parsed = {};
      try {
        const clean = result.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch {
        parsed = { summary: result, key_findings: [], risk_flags: [], action_items: [] };
      }

      await updateDocument(doc.id, {
        ai_summary: parsed.summary || result.slice(0, 500),
        ai_key_findings: parsed.key_findings || [],
        status: "analyzed",
        analysis_result: parsed,
      });

      setDocs(prev => prev.map(d => d.id === doc.id ? {
        ...d, ai_summary: parsed.summary || result.slice(0, 500),
        ai_key_findings: parsed.key_findings || [],
        status: "analyzed", analysis_result: parsed
      } : d));
    } catch (err) {
      await updateDocument(doc.id, { status: "error" });
      setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: "error" } : d));
    }
    setAnalyzing(null);
  }, [profile]);

  // Rebuild context
  const rebuildContext = useCallback(async () => {
    const md = buildContextMd(profile, docs);
    setContextMd(md);
    const findings = docs.reduce((s, d) => s + (d.ai_key_findings?.length || 0), 0);
    await saveUserContext(userId, md, docs.length, findings);
  }, [profile, docs, userId]);

  // Auto-rebuild context when docs change
  useEffect(() => {
    if (!loading) rebuildContext();
  }, [docs.length, loading]);

  const handleDelete = async (docId) => {
    if (!confirm("Delete this document?")) return;
    await deleteDocument(docId);
    setDocs(prev => prev.filter(d => d.id !== docId));
  };

  const analyzedCount = docs.filter(d => d.status === "analyzed").length;
  const totalFindings = docs.reduce((s, d) => s + (d.ai_key_findings?.length || 0), 0);

  const typeDistribution = useMemo(() => {
    const counts = {};
    docs.forEach(d => { counts[d.file_type] = (counts[d.file_type] || 0) + 1; });
    return Object.entries(counts).map(([type, count]) => {
      const t = DOC_TYPES.find(dt => dt.v === type);
      return { name: t?.l?.split(" ")[0] || type, value: count, color: t?.color || "#fff" };
    });
  }, [docs]);

  return (
    <div className="space-y-5 animate-in">
      <Section title="Document Vault" sub="Upload, Analyze, Build Context" />

      <div className="grid grid-cols-4 gap-2">
        <Stat label="Documents" value={docs.length} color="#60a5fa" />
        <Stat label="Analyzed" value={analyzedCount} color="#34d399" />
        <Stat label="Findings" value={totalFindings} color="#a78bfa" />
        <Stat label="Context" value={contextMd ? "Built" : "Empty"} color={contextMd ? "#34d399" : "#fbbf24"} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/[0.05]">
        {[{id:"upload",l:"Upload",icon:"filetext"},{id:"docs",l:`Documents (${docs.length})`,icon:"vault"},{id:"context",l:"AI Context",icon:"aichat"}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-bold transition ${tab === t.id ? "bg-white/[0.06] text-white/75" : "text-white/40 hover:text-white/55"}`}>
            <Icon name={t.icon} size={16} className="opacity-70" />{t.l}
          </button>
        ))}
      </div>

      {/* UPLOAD TAB */}
      {tab === "upload" && (
        <div className="space-y-4">
          <Card>
            <p className="text-sm text-white/55 font-bold mb-3">Upload a Document</p>
            <p className="text-xs text-white/40 mb-4">Upload tax returns, contracts, insurance policies, statements. AI will analyze and extract key findings that feed into your financial profile context.</p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider font-medium mb-1.5">Document type</label>
                <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/65 outline-none">
                  {DOC_TYPES.map(t => <option key={t.v} value={t.v} className="bg-[#13141c]">{t.l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider font-medium mb-1.5">File</label>
                <input type="file" accept=".txt,.pdf,.csv,.doc,.docx" onChange={handleUpload} disabled={uploading}
                  className="w-full text-sm text-white/40 file:mr-3 file:rounded-lg file:bg-emerald-500/10 file:border-emerald-500/20 file:border file:text-emerald-400 file:text-sm file:font-bold file:px-4 file:py-2 file:cursor-pointer" />
              </div>
            </div>
            {uploading && <p className="text-sm text-emerald-400/70 animate-pulse">Uploading...</p>}
          </Card>

          {/* Document type guide */}
          <Card>
            <p className="text-sm text-white/55 font-bold mb-3">What to Upload</p>
            <div className="grid grid-cols-2 gap-2">
              {DOC_TYPES.filter(t => t.v !== "other").map(t => (
                <div key={t.v} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]">
                  <Icon name={t.icon} size={16} className="opacity-70" />
                  <div>
                    <p className="text-sm text-white/55 font-medium">{t.l}</p>
                    <p className="text-xs text-white/40">AI extracts key data, flags issues</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* DOCUMENTS TAB */}
      {tab === "docs" && (
        <div className="space-y-3">
          {docs.length === 0 && !loading && (
            <Card>
              <div className="text-center py-8">
                <p className="text-2xl mb-2 opacity-30">📁</p>
                <p className="text-sm text-white/40 mb-1">No documents yet</p>
                <p className="text-xs text-white/40">Upload tax returns, contracts, or statements to build your AI context.</p>
                <button onClick={() => setTab("upload")} className="mt-3 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 font-bold">
                  Upload First Document
                </button>
              </div>
            </Card>
          )}

          {typeDistribution.length > 0 && (
            <Card>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Documents by Type</p>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={typeDistribution} barCategoryGap="20%">
                  <XAxis dataKey="name" tick={{ fontSize:11, fill:chartText() }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:10, fill:chartText() }} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <Bar dataKey="value" name="Count" radius={[4,4,0,0]}>{typeDistribution.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {docs.map(doc => {
            const type = DOC_TYPES.find(t => t.v === doc.file_type);
            const isAnalyzing = analyzing === doc.id;
            return (
              <Card key={doc.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="mt-0.5"><Icon name={type?.icon || "filetext"} size={20} className="opacity-60" /></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/65 font-bold truncate">{doc.filename}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge color={type?.color || "#fff"}>{type?.l || doc.file_type}</Badge>
                        <span className="text-xs text-white/40">{new Date(doc.created_at).toLocaleDateString()}</span>
                        {doc.file_size && <span className="text-xs text-white/40">{(doc.file_size/1024).toFixed(0)}KB</span>}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                          doc.status === "analyzed" ? "bg-emerald-500/10 text-emerald-400" :
                          doc.status === "error" ? "bg-red-500/10 text-red-400" :
                          doc.status === "analyzing" ? "bg-amber-500/10 text-amber-400" :
                          "bg-white/[0.06] text-white/40"}`}>{doc.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {doc.status !== "analyzed" && (
                      <button onClick={() => analyzeDoc(doc)} disabled={isAnalyzing}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-bold hover:bg-emerald-500/15 transition disabled:opacity-40">
                        {isAnalyzing ? "Analyzing..." : "Analyze"}
                      </button>
                    )}
                    <button onClick={() => handleDelete(doc.id)}
                      className="px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-bold hover:bg-red-500/15 transition">
                      Del
                    </button>
                  </div>
                </div>

                {/* AI Analysis Results */}
                {doc.ai_summary && (
                  <div className="mt-3 pt-3 border-t border-white/[0.05]">
                    <p className="text-sm text-white/55 mb-2">{doc.ai_summary}</p>
                    {doc.ai_key_findings?.length > 0 && (
                      <div className="space-y-1 mt-2">
                        <p className="text-xs text-white/40 uppercase font-bold">Key Findings</p>
                        {doc.ai_key_findings.map((f, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 mt-1.5 flex-shrink-0" />
                            <p className="text-xs text-white/50">{f}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {doc.analysis_result?.action_items?.length > 0 && (
                      <div className="space-y-1 mt-2">
                        <p className="text-xs text-white/40 uppercase font-bold">Action Items</p>
                        {doc.analysis_result.action_items.map((a, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-1.5 flex-shrink-0" />
                            <p className="text-xs text-white/50">{a}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {doc.analysis_result?.estimated_impact && (
                      <p className="text-sm text-emerald-400/70 font-bold mt-2">
                        Estimated impact: {typeof doc.analysis_result.estimated_impact === "number" ? fN(doc.analysis_result.estimated_impact) : doc.analysis_result.estimated_impact}/yr
                      </p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* CONTEXT TAB */}
      {tab === "context" && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-white/55 font-bold">AI Context Summary</p>
                <p className="text-xs text-white/40">Auto-generated from your profile + uploaded documents. This is what AI modules use for context.</p>
              </div>
              <button onClick={rebuildContext}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-bold hover:bg-emerald-500/15">
                Rebuild
              </button>
            </div>
            <div className="bg-[#0a0b10] rounded-lg p-4 border border-white/[0.04] max-h-96 overflow-y-auto">
              <pre className="text-xs text-white/50 whitespace-pre-wrap font-mono leading-relaxed">{contextMd || "No context built yet. Complete onboarding and upload documents."}</pre>
            </div>
            <div className="flex justify-between mt-2 text-xs text-white/40">
              <span>{docs.length} documents | {totalFindings} findings</span>
              <span>{contextMd.length.toLocaleString()} chars</span>
            </div>
          </Card>

          <Alert type="info">
            This context is automatically sent to AI modules (Tax Scanner, Contract Scanner, Doc Scanner, AI Chat) so they understand your complete financial picture. Rebuild after uploading new documents or changing profile data.
          </Alert>
        </div>
      )}

      {loading && <p className="text-sm text-white/40 text-center animate-pulse">Loading documents...</p>}
    </div>
  );
}
