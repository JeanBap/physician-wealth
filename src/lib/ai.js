// src/lib/ai.js
// Double-pass Claude Sonnet analysis engine
// Runs the same prompt twice independently, then merges for higher accuracy

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

async function callClaude(systemPrompt, userContent, maxTokens = 2000) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    }),
  });
  const data = await res.json();
  const text = (data.content || [])
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("\n");
  return text;
}

// Double-pass: run analysis twice independently, then merge
export async function analyzeDouble(systemPrompt, userContent, mergePrompt) {
  // Pass 1 and Pass 2 in parallel
  const [pass1, pass2] = await Promise.all([
    callClaude(systemPrompt, userContent),
    callClaude(systemPrompt, userContent),
  ]);

  // Merge pass: combine both analyses for higher confidence
  const mergeSystem = mergePrompt || `You are a senior financial analyst reviewing two independent analyses of the same data. Merge them into one definitive analysis. Where they agree, state with high confidence. Where they disagree, note both perspectives. Return ONLY valid JSON matching the schema requested in the original analysis.`;

  const merged = await callClaude(
    mergeSystem,
    `ANALYSIS PASS 1:\n${pass1}\n\nANALYSIS PASS 2:\n${pass2}\n\nMerge these into one definitive JSON analysis. Keep the same JSON schema. Prefer consensus findings. Flag disagreements.`
  );

  return { pass1, pass2, merged, raw: merged };
}

// Parse JSON from Claude response (handles markdown fences)
export function parseAIResponse(text) {
  try {
    const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(clean);
  } catch {
    // Try to find JSON object in text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return null; }
    }
    return null;
  }
}

// File to text (for uploads)
export function fileToText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("File read failed"));
    if (file.type === "application/pdf") {
      // For PDFs, read as base64 for Claude
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  });
}

// File to base64 for PDF/image upload to Claude
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

export default { analyzeDouble, parseAIResponse, fileToText, fileToBase64 };
