// Multi-model API proxy
// Routes requests to DeepSeek or Anthropic based on provider field
// Env vars needed: ANTHROPIC_API_KEY, DEEPSEEK_API_KEY

export async function onRequestPost(context) {
  const ANTHROPIC_KEY = context.env.ANTHROPIC_API_KEY;
  const DEEPSEEK_KEY = context.env.DEEPSEEK_API_KEY;

  try {
    const body = await context.request.json();
    const provider = body.provider || "anthropic";
    const model = body.model || "claude-sonnet-4-20250514";

    if (!body.system || !body.messages) {
      return jsonRes({ error: "Missing system or messages" }, 400);
    }

    let apiUrl, headers, reqBody;

    if (provider === "deepseek") {
      // DeepSeek uses OpenAI-compatible API
      if (!DEEPSEEK_KEY) {
        // Fallback to Haiku if no DeepSeek key
        return routeAnthropic(ANTHROPIC_KEY, "claude-haiku-4-5-20251001", body);
      }
      apiUrl = "https://api.deepseek.com/chat/completions";
      headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_KEY}`,
      };
      reqBody = {
        model: body.model || "deepseek-chat",
        max_tokens: body.max_tokens || 2000,
        messages: [
          { role: "system", content: body.system },
          ...body.messages,
        ],
      };
    } else {
      // Anthropic (Haiku or Sonnet)
      return routeAnthropic(ANTHROPIC_KEY, model, body);
    }

    const res = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(reqBody),
    });

    const data = await res.json();
    return jsonRes(data);

  } catch (err) {
    return jsonRes({ error: err.message }, 500);
  }
}

async function routeAnthropic(apiKey, model, body) {
  if (!apiKey) {
    return jsonRes({ error: "ANTHROPIC_API_KEY not configured" }, 500);
  }

  const reqBody = {
    model,
    max_tokens: body.max_tokens || 2000,
    system: body.system,
    messages: body.messages,
  };

  // Extended thinking for Sonnet synthesis pass
  if (body.thinking && model.includes("sonnet")) {
    reqBody.thinking = { type: "enabled", budget_tokens: 5000 };
    // Thinking requires higher max_tokens
    reqBody.max_tokens = Math.max(reqBody.max_tokens, 8000);
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(reqBody),
  });

  const data = await res.json();
  return jsonRes(data);
}

function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
