import { useState } from "react";
import { SPECIALTIES, fN } from "../lib/data";
import { Section, Stat, Card, Alert, Btn } from "../components/ui";
import { analyzeTriple, analyzeDouble, parseAIResponse, fileToBase64 } from "../lib/ai";
import { saveDocument } from "../lib/supabase";

const CLAUSES = [
  { name: "Non-compete radius", good: "< 10 miles", bad: "> 25 miles", weight: 3 },
  { name: "Non-compete duration", good: "< 1 year", bad: "> 2 years", weight: 3 },
  { name: "Tail coverage", good: "Employer-paid", bad: "Physician-paid", weight: 2 },
  { name: "Termination notice", good: "> 90 days", bad: "< 30 days", weight: 2 },
  { name: "Without cause termination", good: "Mutual right", bad: "Employer only", weight: 3 },
  { name: "Partnership track", good: "Defined timeline", bad: "Vague/none", weight: 1 },
  { name: "Benefits start date", good: "Day 1", bad: "After 90 days", weight: 1 },
  { name: "CME allowance", good: "> $3,000/yr", bad: "< $1,000/yr", weight: 1 },
];

export default function Contracts({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [scores, setScores] = useState(CLAUSES.map(() => 5));

  const toggleScore = (i) => setScores(prev => prev.map((s, j) => j === i ? (s === 5 ? 0 : s === 0 ? 10 : 0) : s));

  const totalWeight = CLAUSES.reduce((s, c) => s + c.weight, 0);
  const weighted = CLAUSES.reduce((s, c, i) => s + (scores[i] / 10) * c.weight, 0);
  const manualScore = Math.round((weighted / totalWeight) * 100);

  const runAnalysis = async () => {
    if (!file) return;
    setAnalyzing(true); setError(""); setResult(null);
    try {
      setProgress("Reading contract...");
      const base64 = await fileToBase64(file);
      const mediaType = file.type || "application/pdf";

      const systemPrompt = `You are a physician employment contract specialist. Analyze this contract for a ${profile.specialty} physician. Median salary for this specialty: ${fN(spec.m)}.

Return ONLY valid JSON:
{
  "contractType": "string",
  "overallScore": number (0-100),
  "baseSalary": number or null,
  "salaryAssessment": "string (above/below/at median)",
  "clauses": [
    {
      "name": "string",
      "found": "string (what the contract says)",
      "rating": "good|neutral|bad",
      "concern": "string or null",
      "suggestion": "string (negotiation recommendation)"
    }
  ],
  "redFlags": ["string array of critical issues"],
  "positives": ["string array of favorable terms"],
  "negotiationPriorities": [
    { "clause": "string", "currentTerm": "string", "suggestedTerm": "string", "impact": "High|Medium|Low" }
  ],
  "financialImpact": {
    "estimatedValue": number,
    "potentialUpside": number,
    "hiddenCosts": number
  },
  "summary": "string (3-4 sentence overview)"
}`;

      const userContent = [
        { type: "document", source: { type: "base64", media_type: mediaType, data: base64 } },
        { type: "text", text: `Analyze this physician employment contract. Specialty: ${profile.specialty}. State: ${profile.state}. Current market median: ${fN(spec.m)}.` }
      ];

      setProgress("AI Pass 1 of 2...");
      const analysis = await analyzeTriple(systemPrompt, userContent);
      setProgress("Parsing results...");
      const parsed = parseAIResponse(analysis.merged);
      if (parsed) setResult(parsed);
      else setError("Could not parse AI response.");
    } catch (err) {
      setError(err.message || "Analysis failed.");
    }
    setAnalyzing(false); setProgress("");
  };

  return (
    <div className="space-y-5 animate-in">
      <Section title="AI Contract Analyzer" sub="Double-Pass Review" />

      {/* Upload */}
      <Card className="text-center py-6" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(244,114,182,0.06) 0%, transparent 60%)",
      }}>
        <p className="text-white/55 text-sm font-bold mb-1">Upload Employment Contract</p>
        <p className="text-xs text-white/55 mb-4">PDF or image. AI reviews every clause twice for accuracy.</p>
        <input type="file" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={e => setFile(e.target.files[0])}
          className="hidden" id="contract-upload" />
        <label htmlFor="contract-upload" className="cursor-pointer px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white/65 hover:bg-white/[0.08] transition inline-block">
          {file ? file.name : "Choose File"}
        </label>
        {file && !analyzing && (
          <div className="mt-3"><Btn onClick={runAnalysis}>Analyze Contract (2 AI passes)</Btn></div>
        )}
        {analyzing && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
            <p className="text-sm text-pink-400/50">{progress}</p>
          </div>
        )}
        {error && <Alert type="danger">{error}</Alert>}
      </Card>

      {/* AI Results */}
      {result && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Contract score" value={`${result.overallScore}/100`} color={result.overallScore > 70 ? "#34d399" : result.overallScore > 40 ? "#fbbf24" : "#f87171"} />
            <Stat label="Red flags" value={result.redFlags?.length || 0} color="#f87171" />
            <Stat label="Positives" value={result.positives?.length || 0} color="#34d399" />
          </div>

          {result.summary && (
            <Card style={{ borderColor: "rgba(244,114,182,0.15)", background: "rgba(244,114,182,0.03)" }}>
              <p className="text-sm text-pink-400/50 uppercase tracking-widest mb-1">AI Summary (Double-Verified)</p>
              <p className="text-sm text-white/65 leading-relaxed">{result.summary}</p>
            </Card>
          )}

          {result.clauses?.length > 0 && (
            <Card>
              <p className="text-sm text-white/55 uppercase tracking-widest mb-2">Clause Analysis</p>
              {result.clauses.map((c, i) => (
                <div key={i} className="py-2 border-b border-white/[0.03] last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/75 font-medium">{c.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${c.rating==="good"?"bg-emerald-500/15 text-emerald-400":c.rating==="bad"?"bg-red-500/15 text-red-400":"bg-white/[0.05] text-white/65"}`}>
                      {c.rating}
                    </span>
                  </div>
                  <p className="text-xs text-white/55 mt-0.5">{c.found}</p>
                  {c.suggestion && <p className="text-xs text-emerald-400/70 mt-0.5">Negotiate: {c.suggestion}</p>}
                </div>
              ))}
            </Card>
          )}

          {result.negotiationPriorities?.length > 0 && (
            <Card>
              <p className="text-sm text-amber-400/60 uppercase tracking-widest mb-2">Negotiation Priorities</p>
              {result.negotiationPriorities.map((n, i) => (
                <div key={i} className="py-1.5 border-b border-white/[0.03] last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/65 font-medium">{n.clause}</p>
                    <span className={`text-xs ${n.impact==="High"?"text-red-400":n.impact==="Medium"?"text-amber-400":"text-blue-400"}`}>{n.impact}</span>
                  </div>
                  <p className="text-xs text-white/55">Current: {n.currentTerm} | Ask for: {n.suggestedTerm}</p>
                </div>
              ))}
            </Card>
          )}

          {result.redFlags?.length > 0 && (
            <Card>
              <p className="text-sm text-red-400/80 uppercase tracking-widest mb-2">Red Flags</p>
              {result.redFlags.map((f, i) => (
                <p key={i} className="text-sm text-red-300/50 mb-1 flex gap-1.5"><span className="text-red-400">!</span> {f}</p>
              ))}
            </Card>
          )}

          <Btn variant="secondary" onClick={() => { setResult(null); setFile(null); }} className="w-full">
            Analyze Another Contract
          </Btn>
        </>
      )}

      {/* Manual scoring fallback */}
      {!result && !analyzing && (
        <>
          <p className="text-xs text-white/55 uppercase tracking-widest">Manual Scoring (upload for AI analysis)</p>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Manual score" value={`${manualScore}/100`} color={manualScore > 70 ? "#34d399" : manualScore > 40 ? "#fbbf24" : "#f87171"} />
            <Stat label="Red flags" value={CLAUSES.filter((_, i) => scores[i] === 0 && CLAUSES[i].weight >= 2).length} color="#f87171" />
            <Stat label="Specialty median" value={fN(spec.m)} color="#60a5fa" />
          </div>
          <Card>
            <p className="text-sm text-white/55 uppercase tracking-widest mb-2">Key Clauses (tap to rate)</p>
            {CLAUSES.map((c, i) => (
              <button key={i} onClick={() => toggleScore(i)} className="w-full flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0 text-left">
                <div>
                  <p className="text-sm text-white/75 font-medium">{c.name}</p>
                  <p className="text-xs text-white/55">Good: {c.good} | Bad: {c.bad}</p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${scores[i]===10?"bg-emerald-500/15 text-emerald-400":scores[i]===0?"bg-red-500/15 text-red-400":"bg-white/[0.05] text-white/65"}`}>
                  {scores[i]===10?"Good":scores[i]===0?"Bad":"N/A"}
                </span>
              </button>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}
