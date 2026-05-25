import { useState } from "react";
import { PROVIDER_CATEGORIES, fmt } from "../lib/data";
import { Section, Card, Alert, Badge, Takeaway } from "../components/ui";
import { Icon } from "../components/icons";

export default function Marketplace({ profile }) {
  const [selectedCat, setSelectedCat] = useState(null);

  const urgentNeeds = [];
  if (!profile.hasDI) urgentNeeds.push("disability");
  if (!profile.hasUmbrella) urgentNeeds.push("insurance");
  if (!profile.hasWill && !profile.hasTrust) urgentNeeds.push("legal");
  if (profile.loans > 100000) urgentNeeds.push("loans");

  return (
    <div className="space-y-5 animate-in">
      <Section title="Provider Marketplace" sub="Vetted Specialists for Physicians" />

      {urgentNeeds.length > 0 && (
        <Alert type="warn">
          Based on your profile, you may need: {urgentNeeds.map(n => PROVIDER_CATEGORIES.find(c => c.id === n)?.name).filter(Boolean).join(", ")}
        </Alert>
      )}

      <p className="text-sm text-white/50">Curated providers who specialize in physician finances. All recommendations are independent.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROVIDER_CATEGORIES.map(cat => {
          const isUrgent = urgentNeeds.includes(cat.id);
          const isSelected = selectedCat === cat.id;
          return (
            <button key={cat.id} onClick={() => setSelectedCat(isSelected ? null : cat.id)}
              className={`text-left p-4 rounded-xl glass border-glow transition-all duration-300 hover:scale-[1.01] ${isSelected ? "ring-1 ring-emerald-500/30" : ""} ${isUrgent ? "border-amber-500/20" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background:"rgba(13,148,136,0.08)"}}><Icon name={cat.iconName || "activity"} size={20} className="text-emerald-400" /></div>
                {isUrgent && <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold">Needed</span>}
              </div>
              <p className="text-sm text-white/65 font-bold mt-2">{cat.name}</p>
              <p className="text-xs text-white/40 mt-1">{cat.desc}</p>
              
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2 animate-in">
                  <p className="text-xs text-white/50 uppercase font-bold">Recommended Providers</p>
                  {cat.examples.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50" />
                        <span className="text-sm text-white/55">{ex}</span>
                      </div>
                      <button className="text-xs px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/15 transition">
                        Learn More
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-white/40 mt-2 italic">We may earn referral fees from some providers. This doesn't affect our recommendations.</p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* What to look for guides */}
      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-3">What to Look For</p>
        <div className="space-y-3">
          {[
            { q:"Tax CPA", a:"Must specialize in physician W-2 + 1099 + S-Corp. Ask: 'How many physician clients do you have?' Should be 50+." },
            { q:"Wealth Manager", a:"Fee-only (not commission). Fiduciary. AUM fee under 0.75%. Ask if they understand PSLF, backdoor Roth, and physician contracts." },
            { q:"Insurance Broker", a:"Independent (not captive to one carrier). Must offer own-occupation DI. Get quotes from 3+ carriers." },
            { q:"Contract Attorney", a:"Physician-specific. Should review non-competes, termination clauses, and tail coverage provisions." },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg bg-white/[0.02]">
              <p className="text-sm text-white/55 font-bold">{item.q}</p>
              <p className="text-xs text-white/40 mt-1">{item.a}</p>
            </div>
          ))}
        </div>
      </Card>

      <Takeaway items={[
        `${urgentNeeds.length > 0 ? `${urgentNeeds.length} gaps in your coverage need attention. Start with ${PROVIDER_CATEGORIES.find(c => c.id === urgentNeeds[0])?.name || "insurance"}.` : "No urgent gaps. Annual review recommended."}`,
        `Fee-only advisors save physicians avg $15-30K/yr vs commission-based. Always ask for fiduciary status.`,
        `Get 3 quotes for any insurance product. Physician-specific brokers often find 20-30% better rates.`,
      ]} />
    </div>
  );
}
