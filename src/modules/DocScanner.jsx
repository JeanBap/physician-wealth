import { useState } from "react";
import { fN } from "../lib/data";
import { Section, Stat, Card, Alert, Btn } from "../components/ui";
import { analyzeDouble, parseAIResponse, fileToBase64 } from "../lib/ai";

export default function DocScanner({ profile }) {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const runAnalysis = async () => {
    if (!file) return;
    setAnalyzing(true); setError(""); setResult(null);
    try {
      setProgress("Reading document...");
      const base64 = await fileToBase64(file);
      const mediaType = file.type || "application/pdf";

      const systemPrompt = `You are a physician financial document analyst. Analyze this document for a ${profile.specialty} physician earning ${fN(profile.salary || 300000)}/yr in ${profile.state || "NY"}.

Identify the document type and provide a thorough analysis. Return ONLY valid JSON:
{
  "documentType": "string (contract, insurance policy, tax return, loan statement, benefits package, etc)",
  "score": number (0-100, overall document quality/favorability),
  "summary": "string (3-4 sentence overview)",
  "keyFindings": [
    { "finding": "string", "impact": "positive|negative|neutral", "details": "string" }
  ],
  "redFlags": ["string array"],
  "positives": ["string array"],
  "recommendations": [
    { "action": "string", "priority": "High|Medium|Low", "reasoning": "string" }
  ],
  "financialImpact": {
    "currentCost": "string or null",
    "potentialSavings": "string or null",
    "risks": "string or null"
  },
  "nextSteps": ["string array of specific actions to take"]
}`;

      const userContent = [
        { type: "document", source: { type: "base64", media_type: mediaType, data: base64 } },
        { type: "text", text: `Analyze this document thoroughly. Physician: ${profile.specialty}, ${profile.state}, ${fN(profile.salary || 300000)}/yr, ${profile.married ? "married" : "single"}.` }
      ];

      setProgress("AI Pass 1 of 2...");
      const analysis = await analyzeDouble(systemPrompt, userContent);
      setProgress("Parsing results...");
      const parsed = parseAIResponse(analysis.merged);
      if (parsed) setResult(parsed);
      else setError("Could not parse AI response. Try a clearer document.");
    } catch (err) { setError(err.message || "Analysis failed."); }
    setAnalyzing(false); setProgress("");
  };

  return (
    <div className="space-y-5 animate-in">
      <Section title="AI Document Scanner" sub="Double-Pass Analysis" />

      {!result ? (
        <Card className="text-center py-8" style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(96,165,250,0.06) 0%, transparent 60%)",
        }}>
          <p className="text-white/40 text-sm font-bold mb-1">Upload Any Financial Document</p>
          <p className="text-[9px] text-white/15 mb-4">Contracts, insurance, tax returns, loan statements, benefits packages. AI analyzes twice for accuracy.</p>
          <input type="file" accept=".pdf,.png,.jpg,.jpeg,.docx,.csv,.txt" onChange={e => setFile(e.target.files[0])}
            className="hidden" id="doc-upload" />
          <label htmlFor="doc-upload" className="cursor-pointer px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white/50 hover:bg-white/[0.08] transition inline-block">
            {file ? file.name : "Choose File"}
          </label>
          {file && !analyzing && (
            <div className="mt-3"><Btn onClick={runAnalysis}>Scan Document (2 AI passes)</Btn></div>
          )}
          {analyzing && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-[10px] text-blue-400/50">{progress}</p>
            </div>
          )}
          {error && <Alert type="danger">{error}</Alert>}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Score" value={`${result.score}/100`} color={result.score > 70 ? "#34d399" : result.score > 40 ? "#fbbf24" : "#f87171"} />
            <Stat label="Red flags" value={result.redFlags?.length || 0} color="#f87171" />
            <Stat label="Type" value={result.documentType || "Unknown"} color="#60a5fa" />
          </div>

          {result.summary && (
            <Card style={{ borderColor: "rgba(96,165,250,0.15)", background: "rgba(96,165,250,0.03)" }}>
              <p className="text-[10px] text-blue-400/50 uppercase tracking-widest mb-1">AI Summary (Double-Verified)</p>
              <p className="text-[11px] text-white/50 leading-relaxed">{result.summary}</p>
            </Card>
          )}

          {result.keyFindings?.length > 0 && (
            <Card>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Key Findings</p>
              {result.keyFindings.map((f, i) => (
                <div key={i} className="py-1.5 border-b border-white/[0.03] last:border-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] ${f.impact==="positive"?"text-emerald-400":f.impact==="negative"?"text-red-400":"text-white/20"}`}>
                      {f.impact==="positive"?"+":f.impact==="negative"?"!":"~"}
                    </span>
                    <p className="text-[10px] text-white/50">{f.finding}</p>
                  </div>
                  <p className="text-[8px] text-white/15 ml-4">{f.details}</p>
                </div>
              ))}
            </Card>
          )}

          {result.redFlags?.length > 0 && (
            <Card>
              <p className="text-[10px] text-red-400/60 uppercase tracking-widest mb-2">Red Flags</p>
              {result.redFlags.map((f, i) => (
                <p key={i} className="text-[10px] text-red-300/50 mb-1 flex gap-1.5"><span className="text-red-400">!</span> {f}</p>
              ))}
            </Card>
          )}

          {result.recommendations?.length > 0 && (
            <Card>
              <p className="text-[10px] text-emerald-400/60 uppercase tracking-widest mb-2">Recommendations</p>
              {result.recommendations.map((r, i) => (
                <div key={i} className="py-1.5 border-b border-white/[0.03] last:border-0">
                  <div className="flex justify-between"><p className="text-[10px] text-white/50">{r.action}</p><span className={`text-[8px] ${r.priority==="High"?"text-red-400":"text-amber-400"}`}>{r.priority}</span></div>
                  <p className="text-[8px] text-white/15">{r.reasoning}</p>
                </div>
              ))}
            </Card>
          )}

          {result.nextSteps?.length > 0 && (
            <Card>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Next Steps</p>
              {result.nextSteps.map((s, i) => (
                <p key={i} className="text-[10px] text-white/30 mb-1 flex gap-1.5"><span className="text-emerald-400/40">{i+1}.</span> {s}</p>
              ))}
            </Card>
          )}

          <Btn variant="secondary" onClick={() => { setResult(null); setFile(null); }} className="w-full">Scan Another Document</Btn>
        </>
      )}
    </div>
  );
}
