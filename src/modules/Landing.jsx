import { useState, useEffect, useRef } from "react";
import { MODULES } from "../lib/data";
import { getTheme, setThemeId, applyTheme, getLang, setLangId, t, THEMES, LANGS } from "../lib/theme";
import { LIVE_METRICS, RECENT_ACTIVITY } from "../lib/socialProof";
import {
  Shield, TrendingUp, Building2, FileText, Calculator, PiggyBank,
  BarChart3, Heart, Brain, Stethoscope, Scale, MapPin, Users, Star,
  ChevronRight, ArrowRight, Lock, CheckCircle2, Zap, Target,
  DollarSign, LineChart, Clock, Award, Sparkles, Activity,
  FileSearch, Briefcase, GraduationCap, Home as HomeIcon, BadgeCheck,
  Globe, BookOpen, AlertCircle,
} from "lucide-react";

/* ── Theme A: Swiss Medical ── */
const T = {
  bg: "#FAFBFC", bg2: "#F1F4F8", card: "#FFFFFF",
  navy: "#0F2B4C", navyL: "#1B3F6B", teal: "#0D9488", tealL: "#14B8A6",
  gold: "#C8952E", text: "#1E293B", text2: "#475569", text3: "#94A3B8",
  border: "#E2E8F0",
};

const FEATURES = [
  { icon: Brain, title: "AI Tax Analysis", desc: "Triple-pass AI (DeepSeek + Haiku + Sonnet) identifies $15-50K in missed deductions from your returns.", bg: "#F0FDF4", stroke: T.teal },
  { icon: Activity, title: "20 Specialties", desc: "Salary, malpractice, burnout benchmarks calibrated to your exact specialty and career stage.", bg: "#EFF6FF", stroke: T.navy },
  { icon: Clock, title: "Financial Independence", desc: "Live countdown with physician salary trajectory, kid costs, and inflation modeling.", bg: "#FFFBEB", stroke: T.gold },
  { icon: Globe, title: "State Arbitrage", desc: "Tax + cost of living optimizer across all 50 states. See your real purchasing power.", bg: "#F5F3FF", stroke: "#7C3AED" },
  { icon: FileSearch, title: "Contract Scanner", desc: "AI reads your employment contract and flags unfavorable clauses before you sign.", bg: "#FFF1F2", stroke: "#E11D48" },
  { icon: LineChart, title: "Net Worth Tracker", desc: "Track wealth trajectory over time with milestone goals and progress alerts.", bg: "#F0FDF4", stroke: T.teal },
  { icon: Shield, title: "Disability Simulator", desc: "Model income disruption scenarios. Compare own-occupation DI carriers.", bg: "#FEF2F2", stroke: "#DC2626" },
  { icon: HomeIcon, title: "Real Estate Analysis", desc: "Property ROI modeling, physician mortgage comparison, syndication analysis.", bg: "#FFFBEB", stroke: T.gold },
  { icon: BookOpen, title: "Document Vault", desc: "Upload any financial document. AI builds a comprehensive context profile.", bg: "#EFF6FF", stroke: T.navy },
];

const TIERS = [
  { tier: "Free", price: "$0", desc: "Core tools forever", icon: Activity, color: T.text3, btnBg: T.bg2, btnColor: T.navy, btnBorder: T.border,
    features: ["Dashboard (13 widgets)", "Financial Independence Calc", "Salary Benchmarking", "Income Map (100 metros)", "Spending Analysis", "Emergency Fund", "Net Worth Tracker", "Lifestyle Creep Detector", "W-4 Optimizer", "Credential Tracker", "Checklists (3 tracks)", "Community", "Salary Database", "Wellness Resources", "Provider Marketplace"] },
  { tier: "Pro", price: "$29", per: "/mo", desc: "Full analytics suite", icon: BarChart3, color: T.teal, popular: true, btnBg: T.teal, btnColor: "#fff", btnBorder: T.teal,
    features: ["Everything in Free, plus:", "Tax Scanner (AI)", "Tax Calendar (19 dates)", "State Arbitrage (50 states)", "Dual-Physician Planning", "Backdoor Roth Wizard", "Charitable Giving Optimizer", "Loan Optimizer (4 strategies)", "Debt Payoff Visualizer", "Retirement Planner", "Real Estate ROI", "Estate Plan & Protection", "Insurance Review", "Disability Simulator", "Malpractice Risk Assessment", "Contract Review Tools", "Offer Comparison (lifetime)", "Negotiation Kit (16 items)", "Practice Buyout Analysis", "Partnership Track", "Moonlighting ROI", "Burnout Cost Calculator", "Locum Rates", "RVU Calculator", "Document Vault", "Linked Bank Accounts"] },
  { tier: "Premium", price: "$99", per: "/mo", desc: "AI-powered analysis", icon: Sparkles, color: T.navy, btnBg: T.navy, btnColor: "#fff", btnBorder: T.navy,
    features: ["Everything in Pro, plus:", "AI Tax Return Scanner", "AI Contract Scanner", "AI Document Scanner", "AI Chat Advisor", "Full context-aware AI", "Triple-pass: DeepSeek + Haiku + Sonnet", "Priority support"] },
];

const BLOG_POSTS = [
  { title: "2026 Physician Salary Report", desc: "10,000+ words. Every specialty, every state, COL-adjusted.", url: "/physician-salary-report-2026.html", tag: "REPORT", tagBg: "#F0FDF4", tagColor: T.teal },
  { title: "Is Board Certification Worth It?", desc: "The $47K annual premium analyzed across 20+ specialties.", url: "/blog/board-certification-roi.html", tag: "SERIES", tagBg: "#EFF6FF", tagColor: T.navy },
  { title: "The $600K Fellowship Question", desc: "Break-even analysis for every major subspecialty fellowship.", url: "/blog/fellowship-financial-breakeven.html", tag: "SERIES", tagBg: "#EFF6FF", tagColor: T.navy },
  { title: "Pain Management: Highest-ROI Fellowship", desc: "1 year, $140K raise, break-even in 2.8 years.", url: "/blog/pain-management-fellowship-roi.html", tag: "NEW", tagBg: "#FFFBEB", tagColor: T.gold },
];

function AnimatedCounter({ target, duration = 2000, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const s = Date.now();
        const tick = () => { const t = Math.min(1, (Date.now() - s) / duration); setCount(Math.round(target * (1 - Math.pow(1 - t, 4)))); if (t < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick); obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

export default function Landing({ navigate, theme: themeProp, toggleTheme: toggleThemeProp, lang: langProp, toggleLang: toggleLangProp }) {
  // Use props if available, otherwise manage locally (for standalone/blog)
  const [localTheme, setLocalTheme] = useState(getTheme);
  const [localLang, setLocalLang] = useState(getLang);
  const theme = themeProp || localTheme;
  const lang = langProp || localLang;
  const toggleTheme = toggleThemeProp || (() => { const next = localTheme === "dark" ? "light" : "dark"; setLocalTheme(next); setThemeId(next); });
  const toggleLang = toggleLangProp || (() => { const next = localLang === "en" ? "es" : "en"; setLocalLang(next); setLangId(next); });
  const isLight = theme === "light";
  useEffect(() => { applyTheme(theme); }, [theme]);
  const [expandedTier, setExpandedTier] = useState(null);

  const sectionLabel = (text, color = T.teal) => (
    <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color, marginBottom: 8 }}>{text}</p>
  );

  return (
    <div style={{ background: "var(--bg)", color: T.text, fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        .serif { font-family: 'Playfair Display', Georgia, serif; }
        .feat-card { transition: all 0.25s; }
        .feat-card:hover { border-color: ${T.teal}; box-shadow: 0 8px 30px rgba(13,148,136,0.08); transform: translateY(-2px); }
        .blog-card { transition: all 0.25s; text-decoration: none; display: block; }
        .blog-card:hover { border-color: ${T.teal}; box-shadow: 0 8px 30px rgba(13,148,136,0.06); transform: translateY(-1px); }
        .price-card { transition: all 0.2s; }
        .price-card:hover { box-shadow: 0 8px 24px rgba(15,43,76,0.06); }
        @keyframes tickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>

      {/* Nav */}
      <nav style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: T.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={20} color="#fff" strokeWidth={2} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.navy }}>Physician<span style={{ color: T.teal }}>Wealth</span></span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={toggleLang} style={{ padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--inputBg)", color: "var(--text3)", fontSize: 12, cursor: "pointer" }}>{LANGS[lang]?.flag} {lang.toUpperCase()}</button>
          <button onClick={toggleTheme} style={{ padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--inputBg)", color: "var(--text3)", fontSize: 12, cursor: "pointer" }}>{theme === "dark" ? "☀️" : "🌙"}</button>
          <button onClick={() => navigate("auth")} style={{ padding: "10px 20px", border: "none", background: "none", color: "var(--text2)", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>{t("signIn", lang)}</button>
          <button onClick={() => navigate("auth")} style={{ padding: "10px 24px", border: "none", borderRadius: 8, background: "var(--navy)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{t("getStarted", lang)}</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px 60px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 100, background: T.bg2, border: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.teal, marginBottom: 24 }}>
          <Zap size={13} /> 48 Financial Tools for Physicians
        </div>
        <h1 className="serif" style={{ fontSize: 60, fontWeight: 900, lineHeight: 1.06, color: T.navy, marginBottom: 20, letterSpacing: -1 }}>
          Stop Leaving <em style={{ fontStyle: "normal", color: T.teal }}>$50,000</em><br />on the Table Every Year
        </h1>
        <p style={{ fontSize: 19, color: T.text2, maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.6 }}>
          82% of physicians overpay taxes. Triple-pass AI analysis finds what your CPA misses. Specialty-specific. Real-time. Physician-grade.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => navigate("auth")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", borderRadius: 10, background: T.teal, color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(13,148,136,0.25)" }}>
            Start Free Trial <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate("auth")} style={{ padding: "14px 28px", borderRadius: 10, background: T.card, color: T.navy, border: `1.5px solid ${T.border}`, fontSize: 16, fontWeight: 500, cursor: "pointer" }}>
            Watch Demo
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 28, flexWrap: "wrap" }}>
          {[
            { icon: Shield, text: "HIPAA Compliant" },
            { icon: Lock, text: "256-bit Encrypted" },
            { icon: BadgeCheck, text: "NPI Verified" },
          ].map((b, i) => (
            <span key={i} style={{ fontSize: 12, color: T.text3, display: "flex", alignItems: "center", gap: 5 }}>
              <b.icon size={14} color={T.teal} strokeWidth={1.8} /> {b.text}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        {[
          { v: 82, s: "%", l: "Physicians overpay taxes", icon: AlertCircle },
          { v: 50, p: "$", s: "K", l: "Average annual overpayment", icon: DollarSign },
          { v: 296, p: "$", s: "K", l: "Average trainee debt", icon: GraduationCap },
          { v: 48, s: "+", l: "Financial planning tools", icon: BarChart3 },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center", padding: 16 }}>
            <s.icon size={20} color={T.teal} strokeWidth={1.5} style={{ margin: "0 auto 8px", display: "block", opacity: 0.6 }} />
            <p style={{ fontSize: 38, fontWeight: 900, color: T.navy }}>
              <AnimatedCounter target={s.v} prefix={s.p || ""} suffix={s.s || ""} duration={1500 + i * 200} />
            </p>
            <p style={{ fontSize: 13, color: T.text3, marginTop: 4 }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Ticker */}
      <div style={{ overflow: "hidden", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32, animation: "tickerScroll 60s linear infinite", whiteSpace: "nowrap" }}>
          {[...RECENT_ACTIVITY, ...RECENT_ACTIVITY].map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: T.text3, flexShrink: 0 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.teal, opacity: 0.5 }} />
              {item.text} <span style={{ color: T.border }}>{item.time}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px" }}>
        {sectionLabel("Features")}
        <h2 className="serif" style={{ fontSize: 38, fontWeight: 900, color: T.navy, marginBottom: 6 }}>Everything a physician needs</h2>
        <p style={{ fontSize: 16, color: T.text2, marginBottom: 48, maxWidth: 480 }}>48 interconnected modules. Change one number, watch the ripple across your entire financial picture.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feat-card" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, cursor: "pointer" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <f.icon size={22} color={f.stroke} strokeWidth={1.8} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 32px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          {sectionLabel("How It Works", T.navy)}
          <h2 className="serif" style={{ fontSize: 34, fontWeight: 900, color: T.navy }}>Three minutes to clarity</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
          {[
            { step: "01", title: "Tell us about you", desc: "5-step onboarding: specialty, salary, debt, assets, goals. Takes 2 minutes.", icon: Users, color: T.teal },
            { step: "02", title: "Upload your docs", desc: "Tax returns, contracts, insurance. Triple-pass AI analyzes each document.", icon: FileText, color: T.navy },
            { step: "03", title: "Get your plan", desc: "Dashboard shows where you stand. Actions ranked by dollar impact.", icon: Target, color: T.gold },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", position: "relative" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: T.bg2, border: `1px solid ${T.border}`, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={24} color={s.color} strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.step}</p>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: T.navy, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{s.desc}</p>
              {i < 2 && <div style={{ position: "absolute", top: 28, right: -16, color: T.border }}><ChevronRight size={20} /></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          {sectionLabel("Pricing")}
          <h2 className="serif" style={{ fontSize: 34, fontWeight: 900, color: T.navy, marginBottom: 6 }}>Pays for itself in one session</h2>
          <p style={{ fontSize: 16, color: T.text2 }}>Average user finds $15K+ in savings. That's 150x ROI on Premium.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {TIERS.map((p, i) => {
            const expanded = expandedTier === i;
            const show = expanded ? p.features : p.features.slice(0, 7);
            const more = p.features.length > 7;
            return (
              <div key={i} className="price-card" style={{ background: T.card, border: `${p.popular ? 2 : 1}px solid ${p.popular ? T.teal : T.border}`, borderRadius: 16, padding: 32, position: "relative" }}>
                {p.popular && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: T.teal, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 16px", borderRadius: 100, textTransform: "uppercase", letterSpacing: 1 }}>Most Popular</div>}
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: T.text3 }}>{p.tier}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2, margin: "8px 0 4px" }}>
                  <span className="serif" style={{ fontSize: 48, fontWeight: 900, color: T.navy }}>{p.price}</span>
                  {p.per && <span style={{ fontSize: 16, fontWeight: 400, color: T.text3 }}>{p.per}</span>}
                </div>
                <p style={{ fontSize: 14, color: T.text2, marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${T.border}` }}>{p.desc}</p>
                <div style={{ marginBottom: 12 }}>
                  {show.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                      <CheckCircle2 size={15} color={T.teal} strokeWidth={1.8} style={{ marginTop: 2, flexShrink: 0, opacity: f.startsWith("Everything") ? 1 : 0.5 }} />
                      <span style={{ fontSize: 14, color: f.startsWith("Everything") ? T.text : T.text2, fontWeight: f.startsWith("Everything") ? 600 : 400 }}>{f}</span>
                    </div>
                  ))}
                </div>
                {more && (
                  <button onClick={() => setExpandedTier(expanded ? null : i)} style={{ fontSize: 13, fontWeight: 600, color: T.teal, background: "none", border: "none", cursor: "pointer", marginBottom: 12, padding: 0 }}>
                    {expanded ? "Show less" : `+ ${p.features.length - 7} more`}
                  </button>
                )}
                <button onClick={() => navigate("auth")} style={{ width: "100%", padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${p.btnBorder}`, background: p.btnBg, color: p.btnColor }}>
                  {p.tier === "Free" ? "Start Free" : "Start 14-Day Trial"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Blog */}
      <div id="blog-section">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px", borderTop: `1px solid ${T.border}` }}>
        {sectionLabel("Research & Insights")}
        <h2 className="serif" style={{ fontSize: 34, fontWeight: 900, color: T.navy, marginBottom: 6 }}>The physician finance blog</h2>
        <p style={{ fontSize: 16, color: T.text2, marginBottom: 48, maxWidth: 480 }}>Data-driven analysis on compensation, certifications, and wealth building.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {BLOG_POSTS.map((post, i) => (
            <a key={i} href={post.url} className="blog-card" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, color: "inherit" }}>
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: post.tagBg, color: post.tagColor, marginBottom: 12 }}>{post.tag}</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: T.navy, marginBottom: 8, lineHeight: 1.3 }}>{post.title}</h3>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{post.desc}</p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: T.teal, marginTop: 12 }}>Read <ArrowRight size={14} /></span>
            </a>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 32px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          {sectionLabel("Testimonials", T.gold)}
          <h2 className="serif" style={{ fontSize: 34, fontWeight: 900, color: T.navy }}>Physicians love this</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { quote: "Found $32K in missed deductions. The AI scanner caught things my CPA missed for 3 years.", name: "Dr. Sarah Chen", spec: "Cardiology, NY", save: "$32,400/yr" },
            { quote: "State arbitrage tool showed me moving from CA to TX gains $47K/year after COL. We moved.", name: "Dr. Marcus Rivera", spec: "Orthopedic Surgery, TX", save: "$47,100/yr" },
            { quote: "The retirement planner showed I could retire 6 years earlier by selling rentals at 55.", name: "Dr. Priya Patel", spec: "Emergency Medicine, FL", save: "6 yrs earlier" },
          ].map((t, i) => (
            <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>{Array(5).fill(0).map((_, j) => <Star key={j} size={16} fill="#fbbf24" color="#fbbf24" />)}</div>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.65, marginBottom: 20 }}>&ldquo;{t.quote}&rdquo;</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: T.text3 }}>{t.spec}</p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 900, color: T.teal }}>{t.save}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust metrics */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 32px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          {[
            { v: LIVE_METRICS.totalUsers.toLocaleString(), l: "Physicians", icon: Users },
            { v: LIVE_METRICS.salariesShared.toLocaleString(), l: "Salaries shared", icon: BarChart3 },
            { v: "$" + Math.round(LIVE_METRICS.avgSavingsFound / 1000) + "K", l: "Avg savings found", icon: TrendingUp },
            { v: LIVE_METRICS.documentsAnalyzed.toLocaleString(), l: "Docs analyzed", icon: FileText },
            { v: LIVE_METRICS.activeToday.toLocaleString(), l: "Active today", icon: Activity },
          ].map((s, i) => (
            <div key={i} style={{ background: T.bg2, borderRadius: 14, padding: 20, textAlign: "center", border: `1px solid ${T.border}` }}>
              <s.icon size={18} color={T.teal} strokeWidth={1.5} style={{ margin: "0 auto 8px", display: "block", opacity: 0.5 }} />
              <p style={{ fontSize: 22, fontWeight: 900, color: T.navy }}>{s.v}</p>
              <p style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 32px", textAlign: "center" }}>
        <h2 className="serif" style={{ fontSize: 38, fontWeight: 900, color: T.navy, marginBottom: 12 }}>
          Your money deserves a<br /><span style={{ color: T.teal }}>physician-grade checkup</span>
        </h2>
        <p style={{ fontSize: 16, color: T.text2, marginBottom: 28 }}>14-day free trial. No credit card. Cancel anytime.</p>
        <button onClick={() => navigate("auth")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 40px", borderRadius: 12, background: T.teal, color: "#fff", border: "none", fontSize: 17, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(13,148,136,0.25)" }}>
          Start Free Trial <ArrowRight size={20} />
        </button>
      </div>

      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: "32px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: T.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={13} color="#fff" strokeWidth={2} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Physician<span style={{ color: T.teal }}>Wealth</span></span>
        </div>
        <p style={{ fontSize: 12, color: T.text3 }}>Not financial advice. Educational tool for physician financial planning.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          <a href="#blog" onClick={e => { e.preventDefault(); document.getElementById("blog-section")?.scrollIntoView({ behavior: "smooth" }); }} style={{ fontSize: 12, color: T.teal, textDecoration: "none", fontWeight: 600 }}>Blog</a>
          <a href="/privacy.html" style={{ fontSize: 12, color: T.text3, textDecoration: "none" }}>Privacy Policy</a>
          <a href="/terms.html" style={{ fontSize: 12, color: T.text3, textDecoration: "none" }}>Terms of Service</a>
          <a href="/cookie-policy.html" style={{ fontSize: 12, color: T.text3, textDecoration: "none" }}>Cookie Policy</a>
        </div>
      </div>
    </div>
  );
}
