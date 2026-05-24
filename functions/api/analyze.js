// Multi-model API proxy for PhysicianWealth
// Env vars: ANTHROPIC_API_KEY, DEEPSEEK_API_KEY (optional)

export async function onRequestPost(context) {
  const ANTHROPIC_KEY = context.env.ANTHROPIC_API_KEY;
  const DEEPSEEK_KEY = context.env.DEEPSEEK_API_KEY;

  if (!ANTHROPIC_KEY) {
    return jsonRes({ error: "ANTHROPIC_API_KEY not set. Add it in Cloudflare Pages > Settings > Environment Variables." }, 500);
  }

  try {
    const body = await context.request.json();
    const provider = body.provider || "anthropic";
    const model = body.model || "claude-sonnet-4-20250514";

    if (!body.system || !body.messages) {
      return jsonRes({ error: "Missing system or messages" }, 400);
    }

    if (provider === "deepseek") {
      if (!DEEPSEEK_KEY) {
        return routeAnthropic(ANTHROPIC_KEY, "claude-haiku-4-5-20251001", body);
      }
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + DEEPSEEK_KEY,
        },
        body: JSON.stringify({
          model: body.model || "deepseek-chat",
          max_tokens: body.max_tokens || 2000,
          messages: [{ role: "system", content: body.system }, ...body.messages],
        }),
      });
      return jsonRes(await res.json());
    } else {
      return routeAnthropic(ANTHROPIC_KEY, model, body);
    }
  } catch (err) {
    return jsonRes({ error: err.message }, 500);
  }
}

async function routeAnthropic(apiKey, model, body) {
  const reqBody = {
    model,
    max_tokens: body.max_tokens || 2000,
    system: body.system,
    messages: body.messages,
  };

  if (body.thinking && model.includes("sonnet")) {
    reqBody.thinking = { type: "enabled", budget_tokens: 5000 };
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

  return jsonRes(await res.json());
}

function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
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
