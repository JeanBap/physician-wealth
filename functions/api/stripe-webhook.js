// Stripe webhook handler for PhysicianWealth
// Syncs subscription events to Supabase pw_subscriptions table

export async function onRequestPost(context) {
  const STRIPE_KEY = context.env.STRIPE_SECRET_KEY;
  const STRIPE_WEBHOOK_SECRET = context.env.STRIPE_WEBHOOK_SECRET;
  const SUPABASE_URL = context.env.SUPABASE_URL || "https://tosyulolriavzgkpwzrn.supabase.co";
  const SUPABASE_KEY = context.env.SUPABASE_SERVICE_KEY;

  if (!STRIPE_KEY || !SUPABASE_KEY) {
    return jsonRes({ error: "Missing STRIPE_SECRET_KEY or SUPABASE_SERVICE_KEY" }, 500);
  }

  const body = await context.request.text();
  const sig = context.request.headers.get("stripe-signature");

  // Verify webhook signature if secret is set
  let event;
  if (STRIPE_WEBHOOK_SECRET && sig) {
    try {
      event = await verifyStripeSignature(body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return jsonRes({ error: "Invalid signature: " + err.message }, 400);
    }
  } else {
    event = JSON.parse(body);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutComplete(event.data.object, STRIPE_KEY, SUPABASE_URL, SUPABASE_KEY);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.created":
        await handleSubscriptionUpdate(event.data.object, SUPABASE_URL, SUPABASE_KEY);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, SUPABASE_URL, SUPABASE_KEY);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object, SUPABASE_URL, SUPABASE_KEY);
        break;
      default:
        break;
    }
    return jsonRes({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return jsonRes({ error: err.message }, 500);
  }
}

async function handleCheckoutComplete(session, stripeKey, supabaseUrl, supabaseKey) {
  const email = session.customer_email || session.customer_details?.email;
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  
  if (!email || !subscriptionId) return;

  // Get subscription details from Stripe
  const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    headers: { "Authorization": `Bearer ${stripeKey}` },
  });
  const sub = await subRes.json();

  const priceId = sub.items?.data?.[0]?.price?.id;
  const tier = getTierFromPrice(priceId);

  await upsertSubscription(supabaseUrl, supabaseKey, {
    email,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    tier,
    status: sub.status,
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    price_id: priceId,
  });
}

async function handleSubscriptionUpdate(sub, supabaseUrl, supabaseKey) {
  const priceId = sub.items?.data?.[0]?.price?.id;
  const tier = getTierFromPrice(priceId);

  await updateSubscriptionByStripeId(supabaseUrl, supabaseKey, sub.id, {
    tier,
    status: sub.status,
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    price_id: priceId,
    cancel_at_period_end: sub.cancel_at_period_end,
  });
}

async function handleSubscriptionDeleted(sub, supabaseUrl, supabaseKey) {
  await updateSubscriptionByStripeId(supabaseUrl, supabaseKey, sub.id, {
    tier: "free",
    status: "canceled",
  });
}

async function handlePaymentFailed(invoice, supabaseUrl, supabaseKey) {
  if (invoice.subscription) {
    await updateSubscriptionByStripeId(supabaseUrl, supabaseKey, invoice.subscription, {
      status: "past_due",
    });
  }
}

function getTierFromPrice(priceId) {
  const priceMap = {
    "price_1Tak1GELqxga7hwXtn95eVkd": "pro",
    "price_1Tak1HELqxga7hwXJmDHghqP": "pro",
    "price_1Tak1HELqxga7hwXpGmYbdIc": "premium",
    "price_1Tak1IELqxga7hwXjKmKd9Bi": "premium",
  };
  return priceMap[priceId] || "pro";
}

async function upsertSubscription(url, key, data) {
  // Try update first
  const existing = await fetch(
    `${url}/rest/v1/pw_subscriptions?email=eq.${encodeURIComponent(data.email)}`,
    { headers: { "apikey": key, "Authorization": `Bearer ${key}` } }
  );
  const rows = await existing.json();

  if (rows.length > 0) {
    await fetch(
      `${url}/rest/v1/pw_subscriptions?email=eq.${encodeURIComponent(data.email)}`,
      {
        method: "PATCH",
        headers: {
          "apikey": key,
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
      }
    );
  } else {
    await fetch(`${url}/rest/v1/pw_subscriptions`, {
      method: "POST",
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(data),
    });
  }
}

async function updateSubscriptionByStripeId(url, key, stripeSubId, data) {
  await fetch(
    `${url}/rest/v1/pw_subscriptions?stripe_subscription_id=eq.${stripeSubId}`,
    {
      method: "PATCH",
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
    }
  );
}

// Simple Stripe signature verification (timing-safe not available in Workers, but functional)
async function verifyStripeSignature(payload, sigHeader, secret) {
  const parts = sigHeader.split(",").reduce((acc, part) => {
    const [k, v] = part.split("=");
    acc[k] = v;
    return acc;
  }, {});
  
  const timestamp = parts["t"];
  const sig = parts["v1"];
  if (!timestamp || !sig) throw new Error("Missing signature parts");

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, "0")).join("");

  if (expected !== sig) throw new Error("Signature mismatch");
  
  // Check timestamp tolerance (5 min)
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
  if (age > 300) throw new Error("Timestamp too old");
  
  return JSON.parse(payload);
}

function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
