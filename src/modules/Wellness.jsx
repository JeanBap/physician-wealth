import { SPECIALTIES } from "../lib/data";
import { Section, Card, Alert, Badge, Takeaway } from "../components/ui";

const RESOURCES = [
  { cat:"Crisis Support", items:[
    { name:"988 Suicide & Crisis Lifeline", detail:"Call or text 988. 24/7, free, confidential.", url:"https://988lifeline.org", urgent:true },
    { name:"Crisis Text Line", detail:"Text HOME to 741741", url:"https://crisistextline.org", urgent:true },
    { name:"Dr. Lorna Breen Heroes' Foundation", detail:"Physician-specific mental health resources and advocacy.", url:"https://drlornabreen.org", urgent:false },
  ]},
  { cat:"Confidential Counseling", items:[
    { name:"Physician Support Line", detail:"Free, confidential peer support. 1-888-409-0141. By physicians, for physicians.", url:"https://physiciansupportline.com", urgent:false },
    { name:"State PHP Programs", detail:"Every state has a Physician Health Program. Confidential support without board reporting in most cases.", url:"", urgent:false },
    { name:"Headspace for Physicians", detail:"Free meditation and mental health app access for medical professionals.", url:"https://headspace.com/health-professionals", urgent:false },
  ]},
  { cat:"Burnout Prevention", items:[
    { name:"Chart completion coaching", detail:"Reduce pajama-time charting. Epic efficiency training.", url:"", urgent:false },
    { name:"Peer support groups", detail:"Weekly physician wellness groups. Many hospitals offer internally.", url:"", urgent:false },
    { name:"Sabbatical planning", detail:"3-6 month career break. Financial planning critical before taking.", url:"", urgent:false },
    { name:"Part-time transition", detail:"0.6-0.8 FTE. Typically 20-40% pay cut but significant wellness gain.", url:"", urgent:false },
  ]},
  { cat:"Career Transition", items:[
    { name:"Non-clinical physician careers", detail:"Pharma, consulting, health tech, medical writing, expert witness, utilization review.", url:"", urgent:false },
    { name:"FIRE community for physicians", detail:"White Coat Investor, Physician on FIRE. Financial independence resources.", url:"https://physicianonfire.com", urgent:false },
    { name:"Locum tenens", detail:"Travel + flexibility + often higher pay. Good transition step.", url:"", urgent:false },
  ]},
];

export default function Wellness({ profile }) {
  const spec = SPECIALTIES[profile.specialty] || SPECIALTIES["Cardiology"];
  const riskLevel = spec.burn > 50 ? "high" : spec.burn > 35 ? "moderate" : "lower";

  return (
    <div className="space-y-5 animate-in">
      <Section title="Wellness & Mental Health" sub="Confidential Resources" />

      <div className={`p-4 rounded-xl border ${riskLevel === "high" ? "bg-red-500/[0.04] border-red-500/15" : riskLevel === "moderate" ? "bg-amber-500/[0.04] border-amber-500/10" : "bg-emerald-500/[0.04] border-emerald-500/10"}`}>
        <p className="text-sm text-white/55">
          {profile.specialty} has a <span className={`font-bold ${riskLevel === "high" ? "text-red-400" : riskLevel === "moderate" ? "text-amber-400" : "text-emerald-400"}`}>{spec.burn}% burnout rate</span> ({riskLevel} risk).
          1 in 6 physicians experience suicidal ideation. You are not alone, and help is confidential.
        </p>
      </div>

      {RESOURCES.map((cat, ci) => (
        <Card key={ci}>
          <p className="text-sm text-white/55 font-bold mb-3">{cat.cat}</p>
          <div className="space-y-3">
            {cat.items.map((r, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${r.urgent ? "bg-red-500/[0.03] border border-red-500/10" : "bg-white/[0.02]"}`}>
                <div className={`w-2 h-8 rounded-full flex-shrink-0 ${r.urgent ? "bg-red-400" : "bg-emerald-400/30"}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white/65 font-bold">{r.name}</p>
                    {r.urgent && <Badge color="#f87171">24/7</Badge>}
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">{r.detail}</p>
                </div>
                {r.url && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/15 transition flex-shrink-0">
                    Visit
                  </a>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Takeaway items={[
        `${profile.specialty} burnout rate: ${spec.burn}%. ${spec.burn > 40 ? "Above average. Proactive wellness planning is critical." : "Below average, but physician burnout affects all specialties."}`,
        `Physician Support Line (1-888-409-0141) is free, confidential, and staffed by psychiatrists. No board reporting.`,
        `Financial security reduces burnout. Physicians with 6+ months emergency fund report 40% lower burnout rates.`,
      ]} />
    </div>
  );
}
