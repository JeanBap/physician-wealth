import { useState } from "react";
import { SPECIALTIES, fN, fmt } from "../lib/data";
import { Section, Stat, Card, Alert, Btn } from "../components/ui";
import { analyzeDouble, parseAIResponse, fileToBase64 } from "../lib/ai";

const COVERAGE_TYPES = [
  { id:"malpractice", name:"Malpractice", essential:true },
  { id:"disability", name:"Disability (Own-Occ)", essential:true },
  { id:"life", name:"Term Life", essential:true },
  { id:"umbrella", name:"Umbrella", essential:true },
  { id:"health", name:"Health Insurance", essential:true },
  { id:"cyber", name:"Cyber Liability", essential:false },
  { id:"business", name:"Business Overhead", essential:false },
];

export default function Insurance({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const sal = profile.salary || spec.m;
  const [has, setHas] = useState(COVERAGE_TYPES.reduce((o, c) => ({ ...o, [c.id]: c.essential }), {}));
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const toggle = (id) => setHas(prev => ({ ...prev, [id]: !prev[id] }));
  const costs = { malpractice:spec.mal, disability:Math.round(sal/100000*2100), life:Math.round(sal*0.003), umbrella:500, health:7200, cyber:800, business:1200 };
  const totalCost = Object.entries(costs).filter(([k]) => has[k]).reduce((s,[,v]) => s+v, 0);
  const missing = COVERAGE_TYPES.filter(c => c.essential && !has[c.id]);
  const gapScore = Math.round((COVERAGE_TYPES.filter(c => has[c.id]).length / COVERAGE_TYPES.length) * 100);

  const runAnalysis = async () => {
    if (!file) return;
    setAnalyzing(true); setError(""); setResult(null);
    try {
      setProgress("Reading insurance policy...");
      const base64 = await fileToBase64(file);
      const mediaType = file.type || "application/pdf";

      const systemPrompt = `You are a physician insurance specialist. Analyze this insurance policy/declaration for a ${profile.specialty} physician earning ${fN(sal)}/yr in ${profile.state}. Malpractice risk: claim rate ${(spec.claimRate*100).toFixed(1)}%.

Return ONLY valid JSON:
{
  "policyType": "string",
  "carrier": "string",
  "coverageAmount": "string",
  "premiumAnnual": number or null,
  "score": number (0-100),
  "coverageGaps": [
    { "gap": "string", "risk": "High|Medium|Low", "recommendation": "string", "estimatedCost": "string" }
  ],
  "strengths": ["string array"],
  "weaknesses": ["string array"],
  "competitorComparison": [
    { "carrier": "string", "estimatedPremium": "string", "advantage": "string" }
  ],
  "recommendations": [
    { "action": "string", "priority": "High|Medium|Low", "potentialSavings": "string" }
  ],
  "summary": "string"
}`;

      const userContent = [
        { type: "document", source: { type: "base64", media_type: mediaType, data: base64 } },
        { type: "text", text: `Analyze this insurance document. Physician: ${profile.specialty}, ${profile.state}, earning ${fN(sal)}/yr.` }
      ];

      setProgress("AI Pass 1 of 2...");
      const analysis = await analyzeDouble(systemPrompt, userContent);
      setProgress("Parsing results...");
      const parsed = parseAIResponse(analysis.merged);
      if (parsed) setResult(parsed);
      else setError("Could not parse AI response.");
    } catch (err) { setError(err.message || "Analysis failed."); }
    setAnalyzing(false); setProgress("");
  };

  return (
    <div className="space-y-5 animate-in">
      <Section title="AI Insurance Analyzer" sub="Double-Pass Review" />

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Coverage score" value={`${gapScore}%`} color={gapScore > 80 ? "#34d399" : gapScore > 50 ? "#fbbf24" : "#f87171"} />
        <Stat label="Annual premium" value={fmt(totalCost)} color="#60a5fa" />
        <Stat label="Gaps" value={missing.length} color={missing.length > 0 ? "#f87171" : "#34d399"} />
      </div>

      {/* Upload */}
      <Card className="text-center py-6" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.06) 0%, transparent 60%)",
      }}>
        <p className="text-white/40 text-sm font-bold mb-1">Upload Insurance Policy</p>
        <p className="text-[9px] text-white/15 mb-4">Declarations page, policy docs. AI reviews twice for accuracy.</p>
        <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => setFile(e.target.files[0])}
          className="hidden" id="ins-upload" />
        <label htmlFor="ins-upload" className="cursor-pointer px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white/50 hover:bg-white/[0.08] transition inline-block">
          {file ? file.name : "Choose File"}
        </label>
        {file && !analyzing && (
          <div className="mt-3"><Btn onClick={runAnalysis}>Analyze Policy (2 AI passes)</Btn></div>
        )}
        {analyzing && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-[10px] text-amber-400/50">{progress}</p>
          </div>
        )}
        {error && <Alert type="danger">{error}</Alert>}
      </Card>

      {/* AI Results */}
      {result && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Policy score" value={`${result.score}/100`} color={result.score > 70 ? "#34d399" : "#fbbf24"} />
            <Stat label="Coverage gaps" value={result.coverageGaps?.length || 0} color="#f87171" />
            <Stat label="Carrier" value={result.carrier || "N/A"} color="#60a5fa" />
          </div>

          {result.summary && (
            <Card style={{ borderColor: "rgba(251,191,36,0.15)", background: "rgba(251,191,36,0.03)" }}>
              <p className="text-[10px] text-amber-400/50 uppercase tracking-widest mb-1">AI Summary (Double-Verified)</p>
              <p className="text-[11px] text-white/50 leading-relaxed">{result.summary}</p>
            </Card>
          )}

          {result.coverageGaps?.length > 0 && (
            <Card>
              <p className="text-[10px] text-red-400/60 uppercase tracking-widest mb-2">Coverage Gaps</p>
              {result.coverageGaps.map((g, i) => (
                <div key={i} className="py-1.5 border-b border-white/[0.03] last:border-0">
                  <div className="flex justify-between"><p className="text-[10px] text-white/50">{g.gap}</p><span className={`text-[8px] ${g.risk==="High"?"text-red-400":"text-amber-400"}`}>{g.risk}</span></div>
                  <p className="text-[8px] text-emerald-400/40">{g.recommendation} ({g.estimatedCost})</p>
                </div>
              ))}
            </Card>
          )}

          {result.recommendations?.length > 0 && (
            <Card>
              <p className="text-[10px] text-emerald-400/60 uppercase tracking-widest mb-2">Recommendations</p>
              {result.recommendations.map((r, i) => (
                <div key={i} className="py-1.5 border-b border-white/[0.03] last:border-0">
                  <p className="text-[10px] text-white/50">{r.action}</p>
                  <div className="flex gap-2 text-[8px]"><span className="text-white/20">{r.priority} priority</span>{r.potentialSavings && <span className="text-emerald-400/40">{r.potentialSavings}</span>}</div>
                </div>
              ))}
            </Card>
          )}

          <Btn variant="secondary" onClick={() => { setResult(null); setFile(null); }} className="w-full">Analyze Another Policy</Btn>
        </>
      )}

      {/* Manual checklist fallback */}
      {!result && !analyzing && (
        <Card>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Coverage Checklist</p>
          {COVERAGE_TYPES.map(c => (
            <button key={c.id} onClick={() => toggle(c.id)} className="w-full flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded flex items-center justify-center text-[8px] ${has[c.id]?"bg-emerald-500/20 text-emerald-400":"bg-white/[0.05] text-white/15"}`}>{has[c.id]?"✓":""}</div>
                <div>
                  <p className={`text-[11px] font-medium ${has[c.id]?"text-white/60":"text-white/25"}`}>{c.name}</p>
                  <p className="text-[8px] text-white/15">{c.essential?"Essential":"Recommended"} | Est. {fN(costs[c.id])}/yr</p>
                </div>
              </div>
              {!has[c.id] && c.essential && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">GAP</span>}
            </button>
          ))}
        </Card>
      )}

      {missing.length > 0 && !result && <Alert type="danger">Missing essential coverage: {missing.map(m=>m.name).join(", ")}.</Alert>}
    </div>
  );
}
