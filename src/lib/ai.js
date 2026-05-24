// src/lib/ai.js
// Triple-pass multi-model analysis engine
// Pass 1: DeepSeek (free research pass - broad pattern recognition)
// Pass 2: Claude Haiku (fast validation + fact-checking)
// Pass 3: Claude Sonnet (final synthesis with extended thinking)

const MODELS = {
  deepseek: "deepseek-chat",
  haiku: "claude-haiku-4-5-20251001",
  sonnet: "claude-sonnet-4-20250514",
};

function getProxyUrl() {
  if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
    return '/api/analyze';
  }
  return null; // dev mode - won't work without proxy
}

async function callModel(provider, model, systemPrompt, userContent, maxTokens = 2000, thinking = false) {
  const proxyUrl = getProxyUrl();
  if (!proxyUrl) throw new Error("API proxy not configured. Set up CF Pages Functions.");

  const body = {
    provider,
    model,
    system: systemPrompt,
    messages: [{ role: "user", content: userContent }],
    max_tokens: maxTokens,
  };
  if (thinking) body.thinking = true;

  const res = await fetch(proxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${provider}/${model} error ${res.status}: ${err}`);
  }

  const data = await res.json();

  // Handle both Anthropic and OpenAI-compatible response formats
  if (data.content) {
    // Anthropic format
    return (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
  } else if (data.choices) {
    // OpenAI-compatible format (DeepSeek)
    return data.choices[0]?.message?.content || "";
  }
  return JSON.stringify(data);
}

// Convenience wrappers
const callDeepSeek = (sys, usr, max) => callModel("deepseek", MODELS.deepseek, sys, usr, max);
const callHaiku = (sys, usr, max) => callModel("anthropic", MODELS.haiku, sys, usr, max);
const callSonnet = (sys, usr, max, thinking) => callModel("anthropic", MODELS.sonnet, sys, usr, max, thinking);

/**
 * Triple-pass multi-model analysis
 * 
 * Pass 1 (Research): DeepSeek - broad pattern recognition, identifies key issues
 * Pass 2 (Validation): Claude Haiku - fast fact-check, catches errors, adds precision
 * Pass 3 (Synthesis): Claude Sonnet - final merge with extended thinking, produces output
 * 
 * Falls back gracefully: if DeepSeek fails, runs Haiku twice. If Haiku fails, Sonnet does all.
 */
export async function analyzeTriple(systemPrompt, userContent, mergePrompt) {
  let pass1, pass2, pass3;

  // Pass 1: DeepSeek research (free tier, broad analysis)
  try {
    pass1 = await callDeepSeek(
      systemPrompt + "\n\nYou are performing the RESEARCH pass. Be thorough. Identify ALL relevant patterns, risks, and opportunities. Cast a wide net.",
      userContent,
      2000
    );
  } catch (e) {
    console.warn("DeepSeek pass failed, falling back to Haiku:", e.message);
    pass1 = await callHaiku(systemPrompt + "\n\nResearch pass: identify all relevant patterns and risks.", userContent, 2000);
  }

  // Pass 2: Claude Haiku validation (fast, precise)
  try {
    pass2 = await callHaiku(
      systemPrompt + "\n\nYou are performing the VALIDATION pass. A previous AI identified these findings. Verify accuracy, catch errors, add missing details, and flag anything incorrect:\n\n" + pass1.slice(0, 3000),
      userContent,
      2000
    );
  } catch (e) {
    console.warn("Haiku validation failed:", e.message);
    pass2 = pass1; // use research pass as fallback
  }

  // Pass 3: Claude Sonnet synthesis (thinking enabled for deep reasoning)
  const synthSystem = mergePrompt || `You are a senior financial analyst producing the FINAL definitive analysis. You have two prior passes:

RESEARCH PASS (broad pattern recognition):
${pass1.slice(0, 3000)}

VALIDATION PASS (fact-checked, precise):
${pass2.slice(0, 3000)}

Synthesize into one authoritative analysis. Where passes agree, state with high confidence. Where they disagree, use your judgment to determine the correct answer. Return ONLY valid JSON matching the schema requested in the original analysis.`;

  try {
    pass3 = await callSonnet(synthSystem, userContent, 3000, true);
  } catch (e) {
    // If thinking mode fails, try without
    console.warn("Sonnet thinking failed, retrying without:", e.message);
    pass3 = await callSonnet(synthSystem, userContent, 3000, false);
  }

  return { pass1, pass2, pass3, merged: pass3, raw: pass3 };
}

// Legacy double-pass (Sonnet only) - for simpler tasks
export async function analyzeDouble(systemPrompt, userContent, mergePrompt) {
  const [p1, p2] = await Promise.all([
    callHaiku(systemPrompt, userContent),
    callSonnet(systemPrompt, userContent),
  ]);

  const mergeSys = mergePrompt || `Merge two analyses into one definitive JSON result. Prefer the more precise answer. Flag disagreements.`;

  const merged = await callSonnet(
    mergeSys,
    `PASS 1 (Haiku):\n${p1}\n\nPASS 2 (Sonnet):\n${p2}\n\nMerge into one JSON. Same schema.`
  );

  return { pass1: p1, pass2: p2, merged, raw: merged };
}

export function parseAIResponse(text) {
  try {
    const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(clean);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return null; }
    }
    return null;
  }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

// Context-aware analysis: uses triple-pass with user context
export async function analyzeWithContext(systemPrompt, userContent, userContextMd) {
  const contextPrefix = userContextMd
    ? `\n\n## USER FINANCIAL CONTEXT:\n${userContextMd}\n\n---\n\n`
    : "";
  return analyzeTriple(systemPrompt + contextPrefix, userContent);
}

export default { analyzeTriple, analyzeDouble, parseAIResponse, fileToBase64, analyzeWithContext };
