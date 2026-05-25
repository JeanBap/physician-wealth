// Stripe Checkout Session creator
// Server-side only - keys never sent to browser

export async function onRequestPost(context) {
  const STRIPE_KEY = context.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) return jsonRes({ error: "STRIPE_SECRET_KEY not set. Add it in Cloudflare Pages > Settings > Environment Variables." }, 500);

  try {
    const { priceId, email } = await context.request.json();
    if (!priceId) return jsonRes({ error: "Missing priceId" }, 400);

    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("success_url", "https://physician-wealth.com/#/billing?success=true");
    params.append("cancel_url", "https://physician-wealth.com/#/billing?canceled=true");
    params.append("line_items[0][price]", priceId);
    params.append("line_items[0][quantity]", "1");
    if (email) params.append("customer_email", email);
    params.append("subscription_data[trial_period_days]", "30");

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + STRIPE_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await res.json();
    if (session.error) return jsonRes({ error: session.error.message }, 400);
    return jsonRes({ url: session.url });
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
