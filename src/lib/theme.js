// Theme + Language system
// Persists to localStorage, works across app, landing, and blog pages

export const THEMES = {
  dark: {
    id: "dark",
    label: "Dark",
    bg: "#06070b", bg2: "#0d0e14", card: "rgba(255,255,255,0.025)",
    cardSolid: "#0d0e14", border: "rgba(255,255,255,0.05)",
    text: "#ffffff", text2: "rgba(255,255,255,0.55)", text3: "rgba(255,255,255,0.35)",
    accent: "#34d399", accent2: "#60a5fa", accent3: "#a78bfa",
    navy: "#34d399", teal: "#34d399",
    inputBg: "rgba(255,255,255,0.03)", inputBorder: "rgba(255,255,255,0.06)",
    sidebarBg: "rgba(8,9,14,0.9)", topbarBg: "rgba(6,7,11,0.8)",
    chartGrid: "rgba(255,255,255,0.03)", chartAxis: "rgba(255,255,255,0.06)", chartText: "rgba(255,255,255,0.2)",
    tooltipBg: "#13141c", tooltipBorder: "rgba(255,255,255,0.1)",
    selectBg: "#13141c",
  },
  light: {
    id: "light",
    label: "Light",
    bg: "#FAFBFC", bg2: "#F1F4F8", card: "#FFFFFF",
    cardSolid: "#FFFFFF", border: "#E2E8F0",
    text: "#1E293B", text2: "#475569", text3: "#94A3B8",
    accent: "#0D9488", accent2: "#1E40AF", accent3: "#7C3AED",
    navy: "#0F2B4C", teal: "#0D9488",
    inputBg: "#FFFFFF", inputBorder: "#E2E8F0",
    sidebarBg: "#FFFFFF", topbarBg: "rgba(250,251,252,0.9)",
    chartGrid: "rgba(0,0,0,0.04)", chartAxis: "rgba(0,0,0,0.08)", chartText: "rgba(0,0,0,0.3)",
    tooltipBg: "#FFFFFF", tooltipBorder: "#E2E8F0",
    selectBg: "#FFFFFF",
  },
};

export function getTheme() {
  try { return localStorage.getItem("pw_theme") || "dark"; } catch { return "dark"; }
}

export function setThemeId(id) {
  try { localStorage.setItem("pw_theme", id); } catch {}
  applyTheme(id);
}

export function applyTheme(id) {
  const t = THEMES[id] || THEMES.dark;
  const root = document.documentElement;
  Object.entries(t).forEach(([k, v]) => {
    if (k === "id" || k === "label") return;
    root.style.setProperty(`--${k}`, v);
  });
  root.setAttribute("data-theme", id);
}

// Languages
export const LANGS = {
  en: { id: "en", label: "English", flag: "🇺🇸" },
  es: { id: "es", label: "Español", flag: "🇪🇸" },
};

export function getLang() {
  try { return localStorage.getItem("pw_lang") || "en"; } catch { return "en"; }
}

export function setLangId(id) {
  try { localStorage.setItem("pw_lang", id); } catch {}
}

// Translation strings - core UI labels
// Modules keep English content; this covers chrome/nav/buttons
export const T = {
  en: {
    getStarted: "Get Started",
    signIn: "Sign In",
    startTrial: "Start Free Trial",
    watchDemo: "Watch Demo",
    features: "Features",
    pricing: "Pricing",
    howItWorks: "How It Works",
    research: "Research & Insights",
    testimonials: "Testimonials",
    settings: "Settings",
    billing: "Billing",
    logout: "Logout",
    dashboard: "Dashboard",
    community: "Community",
    newPost: "New Post",
    cancel: "Cancel",
    postAnonymously: "Post Anonymously",
    reply: "Reply",
    writeReply: "Write a reply...",
    replies: "replies",
    share: "Share",
    save: "Save",
    showMore: "more",
    showLess: "Show less",
    mostPopular: "MOST POPULAR",
    startFree: "Start Free",
    start14Day: "Start 14-Day Trial",
    paysForItself: "Pays for itself in one session",
    avgSavings: "Average user finds $15K+ in savings.",
    heroTitle1: "Stop Leaving",
    heroTitle2: "$50,000",
    heroTitle3: "on the Table Every Year",
    heroSub: "82% of physicians overpay taxes. Triple-pass AI analysis finds what your CPA misses. Specialty-specific. Real-time. Physician-grade.",
    everything: "Everything a physician needs",
    everythingSub: "48 interconnected modules. Change one number, watch the ripple across your entire financial picture.",
    threeMinutes: "Three minutes to clarity",
    step1: "Tell us about you",
    step1d: "5-step onboarding: specialty, salary, debt, assets, goals. Takes 2 minutes.",
    step2: "Upload your docs",
    step2d: "Tax returns, contracts, insurance. Triple-pass AI analyzes each document.",
    step3: "Get your plan",
    step3d: "Dashboard shows where you stand. Actions ranked by dollar impact.",
    physicianGrade: "physician-grade checkup",
    trialCta: "14-day free trial. No credit card. Cancel anytime.",
    blog: "The physician finance blog",
    blogSub: "Data-driven analysis on compensation, certifications, and wealth building.",
    theme: "Theme",
    language: "Language",
    dark: "Dark",
    light: "Light",
    appearance: "Appearance",
    hipaa: "HIPAA Compliant",
    encrypted: "256-bit Encrypted",
    npiVerified: "NPI Verified",
    notAdvice: "Not financial advice. Educational tool for physician financial planning.",
    // Features
    f_aiTax: "AI Tax Analysis",
    f_aiTaxD: "Triple-pass AI (DeepSeek + Haiku + Sonnet) identifies $15-50K in missed deductions from your returns.",
    f_specs: "20 Specialties",
    f_specsD: "Salary, malpractice, burnout benchmarks calibrated to your exact specialty and career stage.",
    f_fi: "Financial Independence",
    f_fiD: "Live countdown with physician salary trajectory, kid costs, and inflation modeling.",
    f_state: "State Arbitrage",
    f_stateD: "Tax + cost of living optimizer across all 50 states. See your real purchasing power.",
    f_contract: "Contract Scanner",
    f_contractD: "AI reads your employment contract and flags unfavorable clauses before you sign.",
    f_nw: "Net Worth Tracker",
    f_nwD: "Track wealth trajectory over time with milestone goals and progress alerts.",
    f_di: "Disability Simulator",
    f_diD: "Model income disruption scenarios. Compare own-occupation DI carriers.",
    f_re: "Real Estate Analysis",
    f_reD: "Property ROI modeling, physician mortgage comparison, syndication analysis.",
    f_vault: "Document Vault",
    f_vaultD: "Upload any financial document. AI builds a comprehensive context profile.",
    // Tiers
    tier_free: "Free", tier_pro: "Pro", tier_premium: "Premium",
    tier_freeD: "Core tools forever", tier_proD: "Full analytics suite", tier_premiumD: "AI-powered analysis",
    // Testimonials
    test1: "Found $32K in missed deductions. The AI scanner caught things my CPA missed for 3 years.",
    test2: "State arbitrage tool showed me moving from CA to TX gains $47K/year after COL. We moved.",
    test3: "The retirement planner showed I could retire 6 years earlier by selling rentals at 55.",
    overpayTaxes: "Physicians overpay taxes",
    avgOverpay: "Average overpayment",
    avgDebt: "Average trainee debt",
    financialTools: "Financial tools",
    physicians: "Physicians",
    salariesShared: "Salaries shared",
    avgFound: "Avg savings found",
    docsAnalyzed: "Docs analyzed",
    activeToday: "Active today",
    physiciansLove: "Physicians love this",
  },
  es: {
    getStarted: "Comenzar",
    signIn: "Iniciar Sesión",
    startTrial: "Prueba Gratuita",
    watchDemo: "Ver Demo",
    features: "Funcionalidades",
    pricing: "Precios",
    howItWorks: "Cómo Funciona",
    research: "Investigación y Análisis",
    testimonials: "Testimonios",
    settings: "Configuración",
    billing: "Facturación",
    logout: "Cerrar Sesión",
    dashboard: "Panel",
    community: "Comunidad",
    newPost: "Nueva Publicación",
    cancel: "Cancelar",
    postAnonymously: "Publicar Anónimamente",
    reply: "Responder",
    writeReply: "Escribe una respuesta...",
    replies: "respuestas",
    share: "Compartir",
    save: "Guardar",
    showMore: "más",
    showLess: "Mostrar menos",
    mostPopular: "MÁS POPULAR",
    startFree: "Comenzar Gratis",
    start14Day: "Prueba de 14 Días",
    paysForItself: "Se paga solo en una sesión",
    avgSavings: "El usuario promedio encuentra $15K+ en ahorros.",
    heroTitle1: "Deja de Perder",
    heroTitle2: "$50,000",
    heroTitle3: "Cada Año",
    heroSub: "El 82% de los médicos paga impuestos de más. El análisis de IA de triple pasada encuentra lo que tu contador no ve. Específico por especialidad. En tiempo real.",
    everything: "Todo lo que un médico necesita",
    everythingSub: "48 módulos interconectados. Cambia un número, observa el efecto en toda tu imagen financiera.",
    threeMinutes: "Tres minutos para la claridad",
    step1: "Cuéntanos sobre ti",
    step1d: "5 pasos: especialidad, salario, deuda, activos, metas. Toma 2 minutos.",
    step2: "Sube tus documentos",
    step2d: "Declaraciones de impuestos, contratos, seguros. La IA analiza cada documento.",
    step3: "Obtén tu plan",
    step3d: "El panel muestra dónde estás. Acciones ordenadas por impacto financiero.",
    physicianGrade: "chequeo de grado médico",
    trialCta: "14 días gratis. Sin tarjeta de crédito. Cancela cuando quieras.",
    blog: "El blog de finanzas médicas",
    blogSub: "Análisis basado en datos sobre compensación, certificaciones y creación de riqueza.",
    theme: "Tema",
    language: "Idioma",
    dark: "Oscuro",
    light: "Claro",
    appearance: "Apariencia",
    hipaa: "Cumple HIPAA",
    encrypted: "Cifrado 256-bit",
    npiVerified: "NPI Verificado",
    notAdvice: "No es asesoramiento financiero. Herramienta educativa para planificación financiera médica.",
    // Features
    f_aiTax: "Análisis Fiscal con IA",
    f_aiTaxD: "IA de triple pasada (DeepSeek + Haiku + Sonnet) identifica $15-50K en deducciones no reclamadas.",
    f_specs: "20 Especialidades",
    f_specsD: "Datos de salario, mala praxis y burnout calibrados para tu especialidad y etapa profesional.",
    f_fi: "Independencia Financiera",
    f_fiD: "Cuenta regresiva en tiempo real con trayectoria salarial, costos de hijos e inflación.",
    f_state: "Arbitraje Estatal",
    f_stateD: "Optimizador de impuestos + costo de vida en los 50 estados. Tu poder adquisitivo real.",
    f_contract: "Escáner de Contratos",
    f_contractD: "La IA analiza tu contrato laboral y señala cláusulas desfavorables antes de firmar.",
    f_nw: "Seguimiento Patrimonial",
    f_nwD: "Rastrea la trayectoria de tu patrimonio con metas y alertas de progreso.",
    f_di: "Simulador de Discapacidad",
    f_diD: "Modela escenarios de interrupción de ingresos. Compara aseguradoras de ocupación propia.",
    f_re: "Análisis Inmobiliario",
    f_reD: "Modelado de ROI de propiedades, comparación de hipotecas médicas, análisis de sindicación.",
    f_vault: "Archivo de Documentos",
    f_vaultD: "Sube cualquier documento financiero. La IA construye un perfil de contexto completo.",
    // Tiers
    tier_free: "Gratis", tier_pro: "Pro", tier_premium: "Premium",
    tier_freeD: "Herramientas básicas para siempre", tier_proD: "Suite completa de análisis", tier_premiumD: "Análisis potenciado por IA",
    // Testimonials
    test1: "Encontré $32K en deducciones perdidas. El escáner de IA detectó lo que mi contador no vio en 3 años.",
    test2: "La herramienta de arbitraje estatal me mostró que mudarme de CA a TX gana $47K/año. Nos mudamos.",
    test3: "El planificador de jubilación mostró que podría retirarme 6 años antes vendiendo propiedades a los 55.",
    overpayTaxes: "Médicos pagan impuestos de más",
    avgOverpay: "Sobrepago promedio",
    avgDebt: "Deuda promedio del residente",
    financialTools: "Herramientas financieras",
    physicians: "Médicos",
    salariesShared: "Salarios compartidos",
    avgFound: "Ahorro promedio encontrado",
    docsAnalyzed: "Docs analizados",
    activeToday: "Activos hoy",
    physiciansLove: "Los médicos lo adoran",
  },
};

export function t(key, lang) {
  return T[lang || getLang()]?.[key] || T.en[key] || key;
}
