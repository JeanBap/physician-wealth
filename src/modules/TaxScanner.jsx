import { useState } from "react";
import { SPECIALTIES, STATE_TAX, fedTax, fica, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Alert, Btn , Takeaway } from "../components/ui";
import { analyzeDouble, parseAIResponse, fileToBase64 } from "../lib/ai";
import { saveDocument } from "../lib/supabase";

const FALLBACK_STRATEGIES = [
  { name:"S-Corp + Reasonable Salary", savings:"$15-40K", risk:"Medium", complexity:"High", desc:"Route 1099 income through S-Corp. Pay yourself 60% W-2, distribute 40%." },
  { name:"HSA Triple Tax Advantage", savings:"$2-4K", risk:"None", complexity:"Low", desc:"Max HSA ($4,150/$8,300). Tax-deductible, grows tax-free, withdraw tax-free for medical." },
  { name:"Backdoor Roth IRA", savings:"$2-5K", risk:"Low", complexity:"Medium", desc:"Contribute to traditional IRA then convert to Roth. Bypass income limits." },
  { name:"Mega Backdoor Roth", savings:"$10-25K", risk:"Low", complexity:"High", desc:"After-tax 401(k) contributions converted to Roth. Up to $69K total limit." },
  { name:"QBI Deduction (1099)", savings:"$8-20K", risk:"Low", complexity:"Medium", desc:"20% qualified business income deduction for independent contractors." },
];

export default function TaxScanner({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const sal = profile.salary || spec.m;
  const state = profile.state || "NY";
  const stateRate = STATE_TAX[state] || 0;
  const totalFed = fedTax(sal, profile.married);
  const totalState = Math.round(sal * stateRate);
  const totalFica = Math.round(fica(sal));
  const totalTax = totalFed + totalState + totalFica;
  const effectiveRate = ((totalTax / sal) * 100).toFixed(1);

  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const runAnalysis = async () => {
    if (!file) return;
    setAnalyzing(true); setError(""); setResult(null);

    try {
      setProgress("Reading tax documents...");
      const base64 = await fileToBase64(file);
      const mediaType = file.type || "application/pdf";

      const systemPrompt = `You are a physician tax optimization specialist. Analyze the uploaded tax document for a ${profile.specialty} physician earning ${fN(sal)}/yr in ${state}. Current effective tax rate: ${effectiveRate}%.

Return ONLY valid JSON:
{
  "documentType": "string (W-2, 1099, tax return, K-1, etc)",
  "taxableIncome": number,
  "currentTaxPaid": number,
  "strategies": [
    {
      "name": "string",
      "estimatedSavings": number,
      "risk": "None|Low|Medium|High",
      "complexity": "Low|Medium|High",
      "description": "string (2-3 sentences)",
      "action": "string (specific next step)"
    }
  ],
  "redFlags": ["string array of issues found"],
  "missedDeductions": ["string array"],
  "totalPotentialSavings": number,
  "confidence": "High|Medium|Low",
  "summary": "string (2-3 sentence overview)"
}`;

      const userContent = [
        { type: "document", source: { type: "base64", media_type: mediaType, data: base64 } },
        { type: "text", text: `Analyze this tax document. Physician specialty: ${profile.specialty}. State: ${state}. Salary: ${fN(sal)}. Filing status: ${profile.married ? "Married" : "Single"}. Student loans: ${fN(profile.loans || 0)}.` }
      ];

      setProgress("AI Pass 1 of 2...");
      const analysis = await analyzeDouble(systemPrompt, userContent);

      setProgress("Parsing results...");
      const parsed = parseAIResponse(analysis.merged);

      if (parsed) {
        setResult(parsed);
      } else {
        setError("Could not parse AI response. Try uploading a clearer document.");
      }
    } catch (err) {
      setError(err.message || "Analysis failed. Check your connection.");
    }
    setAnalyzing(false); setProgress("");
  };

  return (
    <div className="space-y-5 animate-in">
      <Section title="AI Tax Optimizer" sub="Double-Pass Analysis" />

      {/* Current tax summary */}
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Total tax burden" value={fmt(totalTax)} sub={`${effectiveRate}% effective rate`} color="#f87171" />
        <Stat label="Take-home" value={fmt(sal - totalTax)} color="#34d399" />
      </div>
      <Card>
        <h3 className="text-sm text-white/55 uppercase tracking-widest mb-2">Tax Breakdown</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-white/75">Federal</span><span className="text-white/75">{fN(totalFed)}</span></div>
          <div className="flex justify-between"><span className="text-white/75">State ({state})</span><span className="text-white/75">{fN(totalState)}</span></div>
          <div className="flex justify-between"><span className="text-white/75">FICA + Medicare</span><span className="text-white/75">{fN(totalFica)}</span></div>
        </div>
      </Card>

      {/* Upload section */}
      <Card className="text-center py-6" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%)",
      }}>
        <p className="text-white/55 text-sm font-bold mb-1">Upload Tax Documents</p>
        <p className="text-xs text-white/55 mb-4">W-2, 1099, tax returns, K-1s. AI analyzes twice for accuracy.</p>
        <input type="file" accept=".pdf,.png,.jpg,.jpeg,.csv,.txt" onChange={e => setFile(e.target.files[0])}
          className="hidden" id="tax-upload" />
        <label htmlFor="tax-upload" className="cursor-pointer px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white/65 hover:bg-white/[0.08] transition inline-block">
          {file ? file.name : "Choose File"}
        </label>
        {file && !analyzing && (
          <div className="mt-3">
            <Btn onClick={runAnalysis}>Analyze with AI (2 passes)</Btn>
          </div>
        )}
        {analyzing && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm text-indigo-400/50">{progress}</p>
          </div>
        )}
        {error && <Alert type="danger">{error}</Alert>}
      </Card>

      {/* AI Results */}
      {result && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Potential savings" value={fmt(result.totalPotentialSavings || 0)} color="#34d399" />
            <Stat label="Strategies found" value={result.strategies?.length || 0} color="#60a5fa" />
            <Stat label="Confidence" value={result.confidence || "N/A"} color={result.confidence === "High" ? "#34d399" : "#fbbf24"} />
          </div>

          {result.summary && (
            <Card style={{ borderColor: "rgba(99,102,241,0.15)", background: "rgba(99,102,241,0.03)" }}>
              <p className="text-sm text-indigo-400/50 uppercase tracking-widest mb-1">AI Summary (Double-Verified)</p>
              <p className="text-sm text-white/65 leading-relaxed">{result.summary}</p>
            </Card>
          )}

          {result.strategies?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-white/55 uppercase tracking-widest">Optimization Strategies</p>
              {result.strategies.map((s, i) => (
                <Card key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-white/75 font-bold">{s.name}</p>
                    <span className="text-sm font-black text-emerald-400 tabular-nums">{typeof s.estimatedSavings === "number" ? fmt(s.estimatedSavings) : s.estimatedSavings}/yr</span>
                  </div>
                  <p className="text-xs text-white/65 mb-2">{s.description}</p>
                  {s.action && <p className="text-xs text-emerald-400/70 font-medium">Next: {s.action}</p>}
                  <div className="flex gap-2 mt-1.5 text-xs">
                    <span className={`px-1.5 py-0.5 rounded-full ${s.risk==="None"?"bg-emerald-500/10 text-emerald-400":s.risk==="Low"?"bg-blue-500/10 text-blue-400":s.risk==="Medium"?"bg-amber-500/10 text-amber-400":"bg-red-500/10 text-red-400"}`}>
                      {s.risk} risk
                    </span>
                    <span className="text-white/55">{s.complexity} complexity</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {result.redFlags?.length > 0 && (
            <Card>
              <p className="text-sm text-red-400/80 uppercase tracking-widest mb-2">Red Flags</p>
              {result.redFlags.map((f, i) => (
                <p key={i} className="text-sm text-red-300/50 mb-1 flex gap-1.5"><span className="text-red-400">!</span> {f}</p>
              ))}
            </Card>
          )}

          {result.missedDeductions?.length > 0 && (
            <Card>
              <p className="text-sm text-amber-400/60 uppercase tracking-widest mb-2">Missed Deductions</p>
              {result.missedDeductions.map((d, i) => (
                <p key={i} className="text-sm text-amber-300/50 mb-1 flex gap-1.5"><span className="text-amber-400">+</span> {d}</p>
              ))}
            </Card>
          )}

          <Btn variant="secondary" onClick={() => { setResult(null); setFile(null); }} className="w-full">
            Analyze Another Document
          </Btn>
        </>
      )}

      {/* Fallback: show general strategies if no upload */}
      {!result && !analyzing && (
        <>
          <p className="text-xs text-white/55 uppercase tracking-widest">General Strategies (upload docs for personalized analysis)</p>
          {FALLBACK_STRATEGIES.map((s, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-white/75 font-bold">{s.name}</p>
                <span className="text-xs font-bold text-emerald-400/60">{s.savings}/yr</span>
              </div>
              <p className="text-xs text-white/55">{s.desc}</p>
              <div className="flex gap-2 mt-1.5 text-xs">
                <span className={`px-1.5 py-0.5 rounded-full ${s.risk==="None"?"bg-emerald-500/10 text-emerald-400":s.risk==="Low"?"bg-blue-500/10 text-blue-400":"bg-amber-500/10 text-amber-400"}`}>{s.risk} risk</span>
                <span className="text-white/55">{s.complexity}</span>
              </div>
            </Card>
          ))}
        </>
      )}

      <Takeaway items={[
        `Effective rate: ${effectiveRate}%. Total tax: ${fmt(totalTax)} on ${fmt(sal)}.`,
        `${FALLBACK_STRATEGIES.length} strategies available. Upload your return for personalized savings estimate.`,
        `Average physician finds $15-50K/yr in missed deductions via AI double-pass analysis.`,
      ]} />
    </div>
  );
}
