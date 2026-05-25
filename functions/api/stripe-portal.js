// Stripe Customer Portal session
// Server-side only

export async function onRequestPost(context) {
  const STRIPE_KEY = context.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) return jsonRes({ error: "STRIPE_SECRET_KEY not set. Add it in Cloudflare Pages > Settings > Environment Variables." }, 500);

  try {
    const { email } = await context.request.json();
    if (!email) return jsonRes({ error: "Missing email" }, 400);

    const custRes = await fetch("https://api.stripe.com/v1/customers?email=" + encodeURIComponent(email) + "&limit=1", {
      headers: { "Authorization": "Bearer " + STRIPE_KEY },
    });
    const custData = await custRes.json();
    
    if (!custData.data?.length) {
      return jsonRes({ error: "No billing account found. Subscribe first." }, 404);
    }

    const params = new URLSearchParams();
    params.append("customer", custData.data[0].id);
    params.append("return_url", "https://physician-wealth.com/#/billing");

    const portalRes = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + STRIPE_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const portal = await portalRes.json();
    if (portal.error) return jsonRes({ error: portal.error.message }, 400);
    return jsonRes({ url: portal.url });
  } catch (err) {
    return jsonRes({ error: err.message }, 500);
  }
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
