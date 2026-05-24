import { useState, useEffect, useRef } from "react";
import { SPECIALTIES, fmt } from "../lib/data";
import { Section, Card, Btn } from "../components/ui";
import { analyzeTriple, analyzeWithContext } from "../lib/ai";
import { getUserContext } from "../lib/supabase";

export default function AiChat({ profile, user }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "I'm your AI financial advisor. I have access to your complete financial profile and uploaded documents. Ask me anything about tax optimization, loan strategies, insurance, retirement planning, or real estate." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextMd, setContextMd] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { data } = await getUserContext(user?.id || "local");
      if (data?.context_md) setContextMd(data.context_md);
    })();
  }, [user]);

  useEffect(() => {
    // Scroll within chat container only, not the whole page
    const container = bottomRef.current?.parentElement;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const systemPrompt = `You are a physician financial advisor AI for PhysicianWealth. You specialize in tax optimization, student loan strategies, insurance, retirement planning, real estate investing, and asset protection for high-income US physicians. Be specific with numbers. Reference the user's actual financial data when available. Give actionable advice.`;

      const conversationContext = messages.slice(-6).map(m => `${m.role}: ${m.content}`).join("\n");
      const fullQuery = `Previous conversation:\n${conversationContext}\n\nUser question: ${userMsg}`;

      const result = await analyzeWithContext(systemPrompt, fullQuery, contextMd);
      setMessages(prev => [...prev, { role: "assistant", content: result }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "AI analysis requires the ANTHROPIC_API_KEY to be configured. In the meantime, I can help you navigate the calculator modules which work offline." }]);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 animate-in">
      <Section title="AI Financial Advisor" sub="Claude-Powered with Your Context" />

      {contextMd && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/15">
          <span className="text-sm">🧠</span>
          <p className="text-xs text-emerald-400/70">Context loaded: profile + {contextMd.split("###").length - 1} documents. AI responses are personalized.</p>
        </div>
      )}

      {/* Chat messages */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
              m.role === "user"
                ? "bg-emerald-500/15 border border-emerald-500/20 text-white/65"
                : "bg-white/[0.03] border border-white/[0.06] text-white/55"
            }`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
              <p className="text-sm text-white/40 animate-pulse">Analyzing with double-pass AI...</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask about tax strategies, loan optimization, RE investing..."
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/65 outline-none focus:border-emerald-500/30 placeholder:text-white/25" />
        <Btn onClick={send} disabled={loading || !input.trim()}>Send</Btn>
      </div>

      <p className="text-xs text-white/40 text-center">AI uses your uploaded documents and profile data for personalized advice. Not a substitute for a licensed financial advisor.</p>
    </div>
  );
}
