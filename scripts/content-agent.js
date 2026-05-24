#!/usr/bin/env node
/**
 * PhysicianWealth Content Agent
 * Searches public physician forums, rewords into original discussion posts.
 * 
 * Usage: ANTHROPIC_API_KEY=xxx node scripts/content-agent.js
 * 
 * FREE SOURCES (no subscription needed):
 * 1. Reddit: r/whitecoatinvestor, r/medicine, r/physicians (public)
 * 2. Bogleheads: bogleheads.org/forum (public)
 * 3. White Coat Investor Forum: forum.whitecoatinvestor.com (free signup)
 * 4. Student Doctor Network: forums.studentdoctor.net (free signup)
 * 5. Physician Side Gigs: Facebook group (free, request join)
 * 6. Doximity: doximity.com (free for MDs, NPI needed)
 */

const QUERIES = [
  "physician salary negotiation","doctor contract non-compete",
  "physician burnout financial","physician PSLF student loan",
  "doctor tax S-corp optimization","physician disability insurance",
  "doctor real estate investing","physician backdoor roth IRA",
  "doctor lifestyle creep attending","physician offer comparison",
  "doctor moonlighting side income","physician malpractice premium",
  "doctor partnership buy-in","physician FIRE retirement",
  "doctor employer review hospital",
];

async function searchReddit(query) {
  try {
    const res = await fetch(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=year&limit=10`,
      { headers: { "User-Agent": "PhysicianWealth-Agent/1.0" } }
    );
    const data = await res.json();
    return (data?.data?.children || [])
      .map(c => ({ title: c.data.title, body: (c.data.selftext || "").slice(0, 400), sub: c.data.subreddit, score: c.data.score, comments: c.data.num_comments }))
      .filter(p => p.body.length > 50);
  } catch (e) { return []; }
}

async function main() {
  console.log("PhysicianWealth Content Agent\n============================\n");
  
  let all = [];
  for (const q of QUERIES) {
    const posts = await searchReddit(q);
    console.log(`"${q}": ${posts.length} results`);
    all.push(...posts);
    await new Promise(r => setTimeout(r, 1100));
  }

  const seen = new Set();
  const unique = all.filter(p => { const k = p.title.toLowerCase().slice(0,40); if (seen.has(k)) return false; seen.add(k); return true; });
  
  console.log(`\nTotal: ${all.length} raw, ${unique.length} unique`);
  console.log(`\nTop posts by engagement:`);
  unique.sort((a,b) => b.score - a.score).slice(0,15).forEach(p =>
    console.log(`  [${p.score}pts, ${p.comments}cmt] r/${p.sub}: ${p.title.slice(0,80)}`)
  );

  console.log(`\nFree sources to subscribe to:`);
  console.log(`  1. Reddit: r/whitecoatinvestor, r/medicine, r/physicians`);
  console.log(`  2. forum.whitecoatinvestor.com (free signup)`);
  console.log(`  3. forums.studentdoctor.net (free signup)`);
  console.log(`  4. Facebook: "Physician Side Gigs" group (free join)`);
  console.log(`  5. bogleheads.org/forum (public)`);
  console.log(`  6. doximity.com (free for MDs)`);
}

main().catch(console.error);
