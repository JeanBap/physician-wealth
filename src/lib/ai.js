// src/lib/ai.js
// Double-pass Claude Sonnet analysis engine
// Production: proxied through /api/analyze (API key server-side)
// Dev/artifact: direct API call (key handled by platform)

const MODEL = "claude-sonnet-4-20250514";

function getApiUrl() {
  // Production: use our proxy
  if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
    return '/api/analyze';
  }
  // Dev fallback
  return 'https://api.anthropic.com/v1/messages';
}

async function callClaude(systemPrompt, userContent, maxTokens = 2000) {
  const apiUrl = getApiUrl();
  const isProxy = apiUrl.includes('/api/');

  const body = isProxy
    ? { system: systemPrompt, messages: [{ role: "user", content: userContent }], max_tokens: maxTokens }
    : { model: MODEL, max_tokens: maxTokens, system: systemPrompt, messages: [{ role: "user", content: userContent }] };

  const headers = { "Content-Type": "application/json" };
  if (!isProxy) {
    headers["anthropic-version"] = "2023-06-01";
    // In artifact context, key is handled automatically
  }

  const res = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = (data.content || [])
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("\n");
  return text;
}

// Double-pass: run analysis twice independently, then merge
export async function analyzeDouble(systemPrompt, userContent, mergePrompt) {
  const [pass1, pass2] = await Promise.all([
    callClaude(systemPrompt, userContent),
    callClaude(systemPrompt, userContent),
  ]);

  const mergeSystem = mergePrompt || `You are a senior financial analyst reviewing two independent analyses of the same data. Merge them into one definitive analysis. Where they agree, state with high confidence. Where they disagree, note both perspectives. Return ONLY valid JSON matching the schema requested in the original analysis.`;

  const merged = await callClaude(
    mergeSystem,
    `ANALYSIS PASS 1:\n${pass1}\n\nANALYSIS PASS 2:\n${pass2}\n\nMerge into one definitive JSON analysis. Same JSON schema. Prefer consensus. Flag disagreements.`
  );

  return { pass1, pass2, merged, raw: merged };
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

export default { analyzeDouble, parseAIResponse, fileToBase64 };
