import { useState } from "react";
import { Section, Stat, Card, Alert, Btn } from "../components/ui";

export default function DocScanner({ profile }) {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = () => {
    setAnalyzing(true);
    // In production: upload to Supabase Storage, send to Claude API for analysis
    setTimeout(() => {
      setResult({
        type: "Employment Contract",
        score: 72,
        redFlags: [
          "Non-compete radius: 30 miles (above recommended 10 miles)",
          "Tail coverage: physician-paid ($12,000-$18,000 estimated)",
          "Termination: employer can terminate without cause with 60-day notice",
        ],
        positives: [
          "Base salary above specialty median",
          "Sign-on bonus with reasonable clawback period (1 year)",
          "CME allowance: $5,000/year with 5 days paid",
          "Partnership track defined at 3 years",
        ],
        recommendations: [
          "Negotiate non-compete down to 10-15 miles",
          "Request employer-paid tail coverage",
          "Extend termination notice to 90 days minimum",
        ],
      });
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="space-y-5 animate-in">
      <Section title="AI Document Scanner" sub="Contract & Policy Analysis" />
      {!result ? (
        <Card className="text-center py-8">
          <p className="text-white/30 text-sm mb-3">Upload a contract, insurance policy, or financial document</p>
          <p className="text-[9px] text-white/15 mb-4">Supported: PDF, DOCX, images. AI analyzes for red flags and optimization opportunities.</p>
          <input type="file" accept=".pdf,.docx,.doc,.png,.jpg" onChange={e => setFile(e.target.files[0])}
            className="hidden" id="doc-upload" />
          <label htmlFor="doc-upload" className="cursor-pointer px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white/50 hover:bg-white/[0.08] transition inline-block">
            {file ? file.name : "Choose File"}
          </label>
          {file && (
            <div className="mt-3">
              <Btn onClick={analyze} disabled={analyzing}>
                {analyzing ? "Analyzing..." : "Scan Document"}
              </Btn>
            </div>
          )}
          {analyzing && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-[10px] text-white/25">Claude is analyzing your document...</p>
            </div>
          )}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Document score" value={`${result.score}/100`} color={result.score > 70 ? "#34d399" : result.score > 40 ? "#fbbf24" : "#f87171"} />
            <Stat label="Red flags" value={result.redFlags.length} color="#f87171" />
            <Stat label="Positives" value={result.positives.length} color="#34d399" />
          </div>
          <Card>
            <h3 className="text-[10px] text-red-400/60 uppercase tracking-widest mb-2">Red Flags</h3>
            <div className="space-y-1.5">
              {result.redFlags.map((f, i) => (
                <p key={i} className="text-[10px] text-red-300/60 flex gap-1.5"><span className="text-red-400">!</span> {f}</p>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="text-[10px] text-emerald-400/60 uppercase tracking-widest mb-2">Positives</h3>
            <div className="space-y-1.5">
              {result.positives.map((p, i) => (
                <p key={i} className="text-[10px] text-emerald-300/60 flex gap-1.5"><span className="text-emerald-400">+</span> {p}</p>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="text-[10px] text-blue-400/60 uppercase tracking-widest mb-2">Recommendations</h3>
            <div className="space-y-1.5">
              {result.recommendations.map((r, i) => (
                <p key={i} className="text-[10px] text-blue-300/60 flex gap-1.5"><span className="text-blue-400">*</span> {r}</p>
              ))}
            </div>
          </Card>
          <Btn variant="secondary" onClick={() => { setResult(null); setFile(null); }} className="w-full">
            Scan Another Document
          </Btn>
        </>
      )}
      <Alert type="info">Premium feature. Documents analyzed by Claude AI. Your files are encrypted in transit and deleted after analysis.</Alert>
    </div>
  );
}
