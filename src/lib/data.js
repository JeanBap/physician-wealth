// src/lib/data.js
// ============================================================
// SHARED DATA LAYER — All components import from here
// ============================================================

// --- 20 PHYSICIAN SPECIALTIES ---
// m=median, lo=25th, hi=75th, mal=malpractice premium, res=residency years
// burn=burnout %, claimRate=annual malpractice claim probability, divRate=divorce rate
export const SPECIALTIES = {
  "Pediatric Surgery":{m:450800,lo:380000,hi:520000,mal:45000,res:7,burn:38,claimRate:.08,divRate:.22},
  "Cardiology":{m:432500,lo:370000,hi:510000,mal:25000,res:6,burn:43.5,claimRate:.07,divRate:.24},
  "Orthopedic Surgery":{m:365100,lo:310000,hi:450000,mal:40000,res:5,burn:40,claimRate:.14,divRate:.23},
  "Radiology":{m:359800,lo:300000,hi:430000,mal:15000,res:5,burn:45.2,claimRate:.05,divRate:.21},
  "General Surgery":{m:371300,lo:300000,hi:440000,mal:35000,res:5,burn:43.8,claimRate:.12,divRate:.23},
  "Dermatology":{m:347800,lo:280000,hi:420000,mal:10000,res:4,burn:35,claimRate:.03,divRate:.18},
  "Anesthesiology":{m:336600,lo:290000,hi:400000,mal:20000,res:4,burn:40,claimRate:.06,divRate:.22},
  "Gastroenterology":{m:348000,lo:290000,hi:420000,mal:18000,res:6,burn:43.5,claimRate:.06,divRate:.21},
  "Emergency Medicine":{m:320700,lo:270000,hi:380000,mal:18000,res:3,burn:49.8,claimRate:.08,divRate:.28},
  "Urology":{m:341000,lo:280000,hi:410000,mal:22000,res:5,burn:49.5,claimRate:.07,divRate:.25},
  "Psychiatry":{m:269100,lo:220000,hi:320000,mal:8000,res:4,burn:37,claimRate:.03,divRate:.19},
  "OB/GYN":{m:281100,lo:235000,hi:340000,mal:80000,res:4,burn:45.7,claimRate:.18,divRate:.24},
  "Neurology":{m:286300,lo:240000,hi:340000,mal:15000,res:4,burn:40,claimRate:.05,divRate:.21},
  "Ophthalmology":{m:301500,lo:250000,hi:370000,mal:12000,res:4,burn:36,claimRate:.04,divRate:.19},
  "Family Medicine":{m:256800,lo:210000,hi:300000,mal:8000,res:3,burn:45,claimRate:.05,divRate:.23},
  "Internal Medicine":{m:262700,lo:215000,hi:310000,mal:10000,res:3,burn:42,claimRate:.05,divRate:.22},
  "Pediatrics":{m:222300,lo:185000,hi:265000,mal:12000,res:3,burn:40,claimRate:.04,divRate:.20},
  "Pathology":{m:266000,lo:220000,hi:320000,mal:12000,res:4,burn:38,claimRate:.03,divRate:.18},
  "Pulmonology":{m:295000,lo:245000,hi:350000,mal:14000,res:6,burn:42,claimRate:.05,divRate:.21},
  "Endocrinology":{m:245000,lo:200000,hi:290000,mal:9000,res:6,burn:39,claimRate:.04,divRate:.20},
};

// --- STATE TAX RATES ---
export const STATE_TAX = {
  CA:.133,NY:.109,NJ:.1075,OR:.099,MN:.0985,HI:.11,MA:.09,VT:.0875,
  WI:.0765,ME:.0715,CT:.0699,SC:.07,ID:.058,MT:.0675,NE:.0664,DE:.066,
  MD:.0575,VA:.0575,NM:.059,RI:.0599,WV:.0565,IL:.0495,OK:.0475,UT:.0465,
  KS:.057,GA:.0549,AR:.055,MS:.05,AL:.05,LA:.0425,MI:.0425,MO:.048,
  CO:.044,NC:.045,OH:.0399,KY:.04,IN:.0305,PA:.0307,ND:.0195,AZ:.025,
  DC:.1075,FL:0,TX:0,NV:0,WA:0,WY:0,SD:0,TN:0,NH:0,AK:0
};

// --- STATE NAMES ---
export const STATE_NAMES = {
  CA:"California",NY:"New York",NJ:"New Jersey",OR:"Oregon",MN:"Minnesota",
  HI:"Hawaii",MA:"Massachusetts",VT:"Vermont",WI:"Wisconsin",ME:"Maine",
  CT:"Connecticut",SC:"South Carolina",ID:"Idaho",MT:"Montana",NE:"Nebraska",
  DE:"Delaware",MD:"Maryland",VA:"Virginia",NM:"New Mexico",RI:"Rhode Island",
  WV:"West Virginia",IL:"Illinois",OK:"Oklahoma",UT:"Utah",KS:"Kansas",
  GA:"Georgia",AR:"Arkansas",MS:"Mississippi",AL:"Alabama",LA:"Louisiana",
  MI:"Michigan",MO:"Missouri",CO:"Colorado",NC:"North Carolina",OH:"Ohio",
  KY:"Kentucky",IN:"Indiana",PA:"Pennsylvania",ND:"North Dakota",AZ:"Arizona",
  DC:"Washington DC",FL:"Florida",TX:"Texas",NV:"Nevada",WA:"Washington",
  WY:"Wyoming",SD:"South Dakota",TN:"Tennessee",NH:"New Hampshire",AK:"Alaska"
};

// --- CAREER STAGES ---
export const STAGES = {
  resident: {
    label: "Resident/Fellow",
    sub: "Training phase",
    defaults: { salary: 65000, loans: 300000, savings: 5000, retirement: 0, age: 28 },
    recommended: ["loans","salary","insurance","ficountdown","contracts"]
  },
  early: {
    label: "Early Career (1-5yr)",
    sub: "First attending job",
    defaults: { salary: 350000, loans: 250000, savings: 40000, retirement: 50000, age: 33 },
    recommended: ["tax","loans","contracts","salary","ficountdown","disability","plaid","insurance"]
  },
  mid: {
    label: "Mid-Career (5-15yr)",
    sub: "Peak earning years",
    defaults: { salary: 400000, loans: 80000, savings: 150000, retirement: 400000, age: 42 },
    recommended: ["tax","retirement","statemove","ficountdown","moonlight","plaid","burnout","spending"]
  },
  senior: {
    label: "Senior/Pre-Retirement",
    sub: "Wealth preservation",
    defaults: { salary: 450000, loans: 0, savings: 300000, retirement: 1500000, age: 55 },
    recommended: ["retirement","tax","ficountdown","practicebuy","plaid","spending"]
  },
};

// --- MODULE REGISTRY ---
// To add a module: 1) add entry here, 2) create component, 3) register in App.jsx pageMap
// tier: "free" = always available, "pro" = $29/mo, "premium" = $99/mo
export const MODULES = {
  dashboard:     { label:"Dashboard",        icon:"◎", tier:"free",    always:true },
  salary:        { label:"Salary",           icon:"◈", tier:"free",    color:"#34d399" },
  ficountdown:   { label:"FI Countdown",     icon:"◈", tier:"free",    color:"#34d399" },
  loans:         { label:"Loans",            icon:"◇", tier:"pro",     color:"#60a5fa" },
  tax:           { label:"Tax Scanner",      icon:"◉", tier:"pro",     color:"#a78bfa" },
  contracts:     { label:"Contracts",        icon:"◆", tier:"pro",     color:"#f87171" },
  insurance:     { label:"Insurance",        icon:"◇", tier:"pro",     color:"#fbbf24" },
  retirement:    { label:"Retirement",       icon:"◎", tier:"pro",     color:"#f472b6" },
  spending:      { label:"Spending",         icon:"◎", tier:"pro",     color:"#f87171" },
  plaid:         { label:"Linked Accounts",  icon:"◈", tier:"pro",     color:"#818cf8" },
  disability:    { label:"Disability Sim",   icon:"◇", tier:"pro",     color:"#f87171" },
  dualphys:      { label:"Dual-Physician",   icon:"◎", tier:"pro",     color:"#f472b6" },
  practicebuy:   { label:"Practice Buyout",  icon:"◆", tier:"pro",     color:"#34d399" },
  moonlight:     { label:"Moonlighting",     icon:"◈", tier:"pro",     color:"#fbbf24" },
  burnout:       { label:"Burnout Cost",     icon:"◉", tier:"pro",     color:"#f87171" },
  statemove:     { label:"State Arbitrage",  icon:"◇", tier:"pro",     color:"#a78bfa" },
  malrisk:       { label:"Malpractice Risk", icon:"◎", tier:"pro",     color:"#f87171" },
  docscan:       { label:"Doc Scanner",      icon:"◆", tier:"premium", color:"#60a5fa" },
  aichat:        { label:"AI Advisor",       icon:"◎", tier:"premium", color:"#34d399" },
  settings:      { label:"Settings",         icon:"◎", tier:"free",    always:true },
  billing:       { label:"Billing",          icon:"◎", tier:"free",    always:true },
};

// --- BANK REGISTRY (Plaid-connected institutions) ---
// To add a bank: just add one object. Plaid handles the actual API connection.
export const BANK_REGISTRY = [
  { id:"mercury",    name:"Mercury",         logo:"M",  color:"#6366f1", cat:"business", types:["checking","savings"],             sample:[{n:"Mercury Business Checking",type:"checking",bal:124800},{n:"Mercury Treasury",type:"savings",bal:250000}] },
  { id:"brex",       name:"Brex",            logo:"B",  color:"#f97316", cat:"business", types:["checking","credit"],              sample:[{n:"Brex Business Account",type:"checking",bal:87500},{n:"Brex Credit Line",type:"credit",bal:-12400}] },
  { id:"chase",      name:"Chase",           logo:"C",  color:"#1e40af", cat:"bank",     types:["checking","savings"],             sample:[{n:"Chase Total Checking",type:"checking",bal:34520}] },
  { id:"bofa",       name:"Bank of America", logo:"BA", color:"#dc2626", cat:"bank",     types:["checking","savings","credit"],    sample:[{n:"BofA Checking",type:"checking",bal:18200}] },
  { id:"wells",      name:"Wells Fargo",     logo:"WF", color:"#b91c1c", cat:"bank",     types:["checking","savings"],             sample:[{n:"Wells Fargo Checking",type:"checking",bal:22100}] },
  { id:"citi",       name:"Citibank",        logo:"Ci", color:"#0369a1", cat:"bank",     types:["checking","savings","credit"],    sample:[{n:"Citi Priority",type:"checking",bal:41000}] },
  { id:"capital_one",name:"Capital One",      logo:"CO", color:"#dc2626", cat:"bank",     types:["checking","savings"],             sample:[{n:"Capital One 360",type:"checking",bal:19500}] },
  { id:"amex",       name:"Amex",            logo:"AX", color:"#2563eb", cat:"credit",   types:["credit"],                         sample:[{n:"Amex Platinum",type:"credit",bal:-4200}] },
  { id:"fidelity",   name:"Fidelity",        logo:"F",  color:"#16a34a", cat:"invest",   types:["retirement","investment"],         sample:[{n:"Fidelity 401(k)",type:"retirement",bal:150000},{n:"Fidelity Brokerage",type:"investment",bal:85000}] },
  { id:"schwab",     name:"Schwab",          logo:"S",  color:"#0891b2", cat:"invest",   types:["retirement","investment"],         sample:[{n:"Schwab Brokerage",type:"investment",bal:80000}] },
  { id:"vanguard",   name:"Vanguard",        logo:"V",  color:"#b91c1c", cat:"invest",   types:["retirement","investment"],         sample:[{n:"Vanguard IRA",type:"retirement",bal:45000}] },
  { id:"etrade",     name:"E*TRADE",         logo:"ET", color:"#7c3aed", cat:"invest",   types:["retirement","investment"],         sample:[{n:"E*TRADE Brokerage",type:"investment",bal:32000}] },
  { id:"robinhood",  name:"Robinhood",       logo:"R",  color:"#16a34a", cat:"invest",   types:["investment"],                      sample:[{n:"Robinhood Individual",type:"investment",bal:12400}] },
  { id:"wealthfront",name:"Wealthfront",     logo:"Wf", color:"#6366f1", cat:"invest",   types:["investment","savings"],            sample:[{n:"Wealthfront Cash",type:"savings",bal:55000}] },
  { id:"betterment", name:"Betterment",      logo:"Bt", color:"#0284c7", cat:"invest",   types:["investment","retirement"],         sample:[{n:"Betterment Investing",type:"investment",bal:67000}] },
  { id:"sofi",       name:"SoFi",            logo:"So", color:"#6d28d9", cat:"bank",     types:["checking","savings"],             sample:[{n:"SoFi Money",type:"checking",bal:11200}] },
  { id:"ally",       name:"Ally Bank",       logo:"Al", color:"#7c3aed", cat:"bank",     types:["savings"],                         sample:[{n:"Ally HYSA",type:"savings",bal:35000}] },
  { id:"marcus",     name:"Marcus (GS)",     logo:"GS", color:"#1e3a5f", cat:"bank",     types:["savings"],                         sample:[{n:"Marcus HYSA",type:"savings",bal:42000}] },
  // ADD MORE: copy pattern above. Plaid handles the actual bank connection.
];

// --- PRICING TIERS ---
export const PRICING = {
  free: {
    name: "Free Preview",
    price: 0,
    period: "forever",
    modules: ["dashboard","salary","ficountdown"],
    features: ["3 core modules","Salary benchmarking","FI countdown timer","Basic profile"],
    cta: "Current Plan"
  },
  trial: {
    name: "Pro Trial",
    price: 0,
    period: "30 days",
    modules: "all_pro",
    features: ["All Pro modules for 30 days","Full access, no limits","Auto-converts to Pro at $29/mo","Cancel anytime before trial ends"],
    cta: "Start Free Trial"
  },
  pro: {
    name: "Pro",
    price: 29,
    priceId: "price_REPLACE_WITH_STRIPE_PRICE_ID_PRO",
    period: "month",
    modules: "all_pro",
    features: ["All 17 financial modules","Bank account linking (Plaid)","Tax optimization scanner","Disability & burnout simulators","State tax arbitrage","Practice buyout calculator","Moonlighting ROI","Contract analyzer","Malpractice risk score"],
    cta: "Upgrade to Pro"
  },
  premium: {
    name: "Premium",
    price: 79,
    priceId: "price_REPLACE_WITH_STRIPE_PRICE_ID_PREMIUM",
    period: "month",
    modules: "all",
    features: ["Everything in Pro","AI Financial Advisor (Claude-powered)","AI Document Scanner","Priority email support","Custom financial reports","Early access to new features"],
    cta: "Upgrade to Premium"
  }
};

// --- NOTIFICATION DEFAULTS ---
export const NOTIFICATION_DEFAULTS = {
  email_weekly_summary: true,
  email_tax_deadlines: true,
  email_license_expiry: true,
  email_market_alerts: false,
  email_product_updates: true,
  push_fi_milestones: true,
  push_bill_reminders: true,
  push_rate_changes: false,
};

// --- FINANCIAL HELPERS ---
export const fmt = (n) => {
  if (n == null) return "$0";
  const a = Math.abs(n);
  if (a >= 1e6) return `${n < 0 ? '-' : ''}$${(a / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `${n < 0 ? '-' : ''}$${(a / 1e3).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString()}`;
};

export const fN = (n) => `$${Math.round(n).toLocaleString()}`;

export const fedTax = (income, married = false) => {
  const brackets = married
    ? [[0,23200,.1],[23200,94300,.12],[94300,201050,.22],[201050,383900,.24],[383900,487450,.32],[487450,731200,.35],[731200,1e9,.37]]
    : [[0,11600,.1],[11600,47150,.12],[47150,100525,.22],[100525,191950,.24],[191950,243725,.32],[243725,609350,.35],[609350,1e9,.37]];
  let tax = 0;
  for (const [lo, hi, rate] of brackets) {
    if (income <= lo) break;
    tax += (Math.min(income, hi) - lo) * rate;
  }
  return tax;
};

export const fica = (income) =>
  Math.min(income, 168600) * 0.062 + income * 0.0145 + Math.max(0, income - 200000) * 0.009;

export const pmtCalc = (principal, annualRate, months) => {
  const mr = annualRate / 1200;
  return mr === 0 ? principal / months : principal * mr * Math.pow(1 + mr, months) / (Math.pow(1 + mr, months) - 1);
};

export const marginalRate = (state) => 0.35 + (STATE_TAX[state] || 0);

// --- DEFAULT USER PROFILE ---
export const DEFAULT_PROFILE = {
  // Identity
  firstName: "",
  lastName: "",
  email: "",
  // Medical
  specialty: "Cardiology",
  state: "NY",
  age: 35,
  stage: "early",
  npiNumber: "",
  // Financial
  salary: 0,
  married: false,
  loans: 250000,
  savings: 50000,
  retirement: 100000,
  investments: 80000,
  // Spouse (if dual-physician)
  hasSpouse: false,
  spouseSpecialty: "Internal Medicine",
  spouseSalary: 0,
  spouseLoans: 0,
  // App state
  priorities: [],
  connectedBanks: [],
  // Subscription
  plan: "trial",        // free | trial | pro | premium
  trialStartDate: null, // ISO date string
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  // Notifications
  notifications: { ...NOTIFICATION_DEFAULTS },
};

// --- ACCOUNT COLORS ---
export const ACCOUNT_COLORS = {
  checking: "#60a5fa",
  savings: "#34d399",
  retirement: "#a78bfa",
  investment: "#fbbf24",
  credit: "#f87171",
};
