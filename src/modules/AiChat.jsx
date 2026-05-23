import { useState } from "react";
import { SPECIALTIES, fN } from "../lib/data";
import { Section, Card, Alert } from "../components/ui";

export default function AiChat({ profile }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Welcome! I'm your AI financial advisor. I know you're a ${profile.specialty} physician in ${profile.state}. How can I help with your finances today?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // In production: call Claude API with physician financial context
    // const response = await fetch("/api/ai/chat", {
    //   method: "POST",
    //   body: JSON.stringify({ messages: [...messages, userMsg], profile })
    // });

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'd analyze that based on your specialty, income level, and state tax situation. In production, this connects to the Claude API with full context about your financial profile, including salary benchmarks, tax optimization strategies, and loan repayment options specific to physicians."
      }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-4 animate-in">
      <Section title="AI Financial Advisor" sub="Claude-Powered" />
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
        <div className="h-80 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-emerald-500/15 text-emerald-200/80"
                  : "bg-white/[0.04] text-white/65"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/[0.04] px-3 py-2 rounded-xl">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-white/[0.05] p-3 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask about taxes, loans, retirement..."
            className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/30 placeholder:text-white/55" />
          <button onClick={send} disabled={loading || !input.trim()}
            className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-400 transition disabled:opacity-30">
            Send
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["How can I reduce my tax bill?", "Should I pursue PSLF?", "Am I saving enough for retirement?", "Review my disability coverage"].map(q => (
          <button key={q} onClick={() => { setInput(q); }}
            className="px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-xs text-white/65 hover:text-white/65 transition">
            {q}
          </button>
        ))}
      </div>
      <Alert type="info">Premium feature. Claude has context on your specialty, salary, state, and all financial data. Not a substitute for professional financial advice.</Alert>
    </div>
  );
}
