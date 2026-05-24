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
export const STATE_COL = {
  AL:87.9, AK:127.2, AZ:102.2, AR:89.0, CA:138.5, CO:105.0, CT:112.8, DE:102.5,
  FL:102.8, GA:93.4, HI:183.9, ID:97.3, IL:93.4, IN:90.5, IA:89.4, KS:88.0,
  KY:90.3, LA:91.2, ME:109.0, MD:112.7, MA:148.4, MI:91.0, MN:97.7, MS:85.7,
  MO:88.4, MT:99.3, NE:91.8, NV:104.0, NH:112.4, NJ:115.2, NM:93.8, NY:128.7,
  NC:95.7, ND:92.2, OH:91.0, OK:84.7, OR:113.1, PA:99.2, RI:109.5, SC:96.2,
  SD:93.4, TN:91.1, TX:92.1, UT:100.7, VT:114.7, VA:103.0, WA:114.2, WV:86.2,
  WI:95.0, WY:93.1, DC:148.7
};

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
  dashboard:     { label:"Dashboard",        icon:"◎", tier:"free",    always:true, cat:"Core" },
  salary:        { label:"Salary",           icon:"◈", tier:"free",    color:"#34d399", cat:"Core" },
  ficountdown:   { label:"FI Countdown",     icon:"◈", tier:"free",    color:"#34d399", cat:"Core" },
  spending:      { label:"Spending",         icon:"◎", tier:"free",    color:"#f87171", cat:"Core" },
  loans:         { label:"Loans",            icon:"◇", tier:"pro",     color:"#60a5fa", cat:"Debt" },
  tax:           { label:"Tax Scanner",      icon:"◉", tier:"pro",     color:"#a78bfa", cat:"Tax" },
  statemove:     { label:"State Arbitrage",  icon:"◇", tier:"pro",     color:"#a78bfa", cat:"Tax" },
  dualphys:      { label:"Dual-Physician",   icon:"◎", tier:"pro",     color:"#f472b6", cat:"Tax" },
  retirement:    { label:"Retirement",       icon:"◎", tier:"pro",     color:"#f472b6", cat:"Wealth" },
  realestate:    { label:"Real Estate",      icon:"◆", tier:"pro",     color:"#fbbf24", cat:"Wealth" },
  estateplan:    { label:"Estate Planning",  icon:"◇", tier:"pro",     color:"#a78bfa", cat:"Wealth" },
  insurance:     { label:"Insurance",        icon:"◇", tier:"pro",     color:"#fbbf24", cat:"Protection" },
  disability:    { label:"Disability Sim",   icon:"◇", tier:"pro",     color:"#f87171", cat:"Protection" },
  malrisk:       { label:"Malpractice Risk", icon:"◎", tier:"pro",     color:"#f87171", cat:"Protection" },
  contracts:     { label:"Contracts",        icon:"◆", tier:"pro",     color:"#f87171", cat:"Career" },
  practicebuy:   { label:"Practice Buyout",  icon:"◆", tier:"pro",     color:"#34d399", cat:"Career" },
  moonlight:     { label:"Moonlighting",     icon:"◈", tier:"pro",     color:"#fbbf24", cat:"Career" },
  burnout:       { label:"Burnout Cost",     icon:"◉", tier:"pro",     color:"#f87171", cat:"Career" },
  plaid:         { label:"Linked Accounts",  icon:"◈", tier:"pro",     color:"#818cf8", cat:"Banking" },
  vault:         { label:"Document Vault",   icon:"◆", tier:"pro",     color:"#60a5fa", cat:"Core" },
  incomemap:     { label:"Income Map",        icon:"◎", tier:"free",    color:"#60a5fa", cat:"Core" },
  marketplace:   { label:"Providers",         icon:"◆", tier:"free",    color:"#fbbf24", cat:"Core" },
  offercompare:  { label:"Offer Compare",     icon:"◎", tier:"pro",     color:"#34d399", cat:"Career" },
  nwtracker:     { label:"Net Worth Track",  icon:"◎", tier:"free",    color:"#34d399", cat:"Core" },
  taxcalendar:   { label:"Tax Calendar",     icon:"◈", tier:"pro",     color:"#a78bfa", cat:"Tax" },
  emergency:     { label:"Emergency Fund",   icon:"◇", tier:"free",    color:"#fbbf24", cat:"Core" },
  docscan:       { label:"Doc Scanner",      icon:"◆", tier:"premium", color:"#60a5fa", cat:"AI" },
  aichat:        { label:"AI Advisor",       icon:"◎", tier:"premium", color:"#34d399", cat:"AI" },
  settings:      { label:"Settings",         icon:"◎", tier:"free",    always:true, cat:"System" },
  billing:       { label:"Billing",          icon:"◎", tier:"free",    always:true, cat:"System" },
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
  // Income
  salary: 0,
  married: false,
  moonlightIncome: 0,
  rentalIncome: 0,
  // Debt
  loans: 250000,
  mortgageBalance: 0,
  carLoan: 0,
  creditCardDebt: 0,
  // Assets
  savings: 50000,
  retirement: 100000,
  investments: 80000,
  hsa: 0,
  plan529: 0,
  cryptoAssets: 0,
  // Real Estate
  homeValue: 0,
  rentalProperties: 0,
  rentalPropertyValue: 0,
  rentalPropertyEquity: 0,
  // Insurance
  hasDI: false,
  hasUmbrella: false,
  hasLifeInsurance: false,
  diCoverageMonthly: 0,
  lifeCoverage: 0,
  malpracticePremium: 0,
  // Family
  hasSpouse: false,
  spouseSpecialty: "Internal Medicine",
  spouseSalary: 0,
  spouseLoans: 0,
  kids: 0,
  kidAges: [],
  // Estate
  hasWill: false,
  hasTrust: false,
  hasPOA: false,
  hasHealthcareDirective: false,
  // Retirement targets
  retireAge: 60,
  fiWithdrawalRate: 4,
  // App state
  priorities: [],
  connectedBanks: [],
  enabledModules: [],
  // Subscription
  plan: "trial",
  trialStartDate: null,
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

// Regional physician compensation (Medscape 2025 + Doximity 2025)
export const REGION_SALARY = {

  // Regions: avg salary (Medscape 2025)
  regions: {
    "Midwest": 385000,
    "South": 375000,
    "West": 370000,
    "Northeast": 360000,
  },
  national: 374000,
};

// Recommended provider categories for marketplace
export const PROVIDER_CATEGORIES = [
  { id:"tax", name:"Physician Tax Specialists", desc:"CPAs who specialize in physician W-2 + 1099 optimization", icon:"📊", examples:["Physician Tax Advisors","Earned CPA","WCG (formerly Watson CPA)"] },
  { id:"wealth", name:"Fee-Only Wealth Managers", desc:"Fiduciary advisors specializing in physician finances", icon:"💰", examples:["Earned Wealth","Physician Wealth Services","WCI-recommended advisors"] },
  { id:"insurance", name:"Insurance Brokers", desc:"Own-occupation DI + umbrella specialists for MDs", icon:"🛡️", examples:["Pattern Insurance","WhiteCoat DI","Guardian Direct"] },
  { id:"loans", name:"Loan Refinancing", desc:"Student loan refi with physician-specific rates", icon:"🎯", examples:["SoFi","Laurel Road","Splash Financial"] },
  { id:"mortgage", name:"Physician Mortgages", desc:"0% down, no PMI for MDs. Major banks + regional lenders", icon:"🏠", examples:["KeyBank","Regions","Fifth Third","Citizens"] },
  { id:"legal", name:"Asset Protection Attorneys", desc:"Trusts, LLCs, and estate planning for high-income MDs", icon:"⚖️", examples:["Physician's Resource","Anderson Business Advisors"] },
  { id:"contracts", name:"Contract Review", desc:"Employment contract attorneys specializing in physician agreements", icon:"📝", examples:["Contract Diagnostics","Resolve Physician Agency"] },
  { id:"banking", name:"Business Banking", desc:"High-yield accounts for practice owners", icon:"🏦", examples:["Mercury","Brex","Novo"] },
  { id:"realestate", name:"RE Investment Platforms", desc:"Syndications and crowdfunding for accredited investors", icon:"🏗️", examples:["CrowdStreet","Fundrise","Origin Investments"] },
  { id:"disability", name:"Disability Insurance", desc:"Own-occupation carriers with physician discounts", icon:"🔒", examples:["Guardian","MassMutual","Principal","Standard"] },
];

export const METROS_100 = [
  {c:"Rochester",s:"MN",avg:495532,col:87.5,g:3.0,home:367500,rent:1925},
  {c:"St. Louis",s:"MO",avg:484883,col:88.4,g:3.5,home:371280,rent:1944},
  {c:"Los Angeles",s:"CA",avg:470198,col:138.5,g:1.8,home:581700,rent:3047},
  {c:"San Jose",s:"CA",avg:469878,col:170.0,g:-1.1,home:714000,rent:3740},
  {c:"Sacramento",s:"CA",avg:460671,col:112.0,g:4.2,home:470400,rent:2464},
  {c:"Riverside",s:"CA",avg:455986,col:102.0,g:5.1,home:428400,rent:2244},
  {c:"San Francisco",s:"CA",avg:449830,col:170.0,g:0.8,home:714000,rent:3740},
  {c:"Minneapolis",s:"MN",avg:453000,col:97.7,g:3.3,home:410340,rent:2149},
  {c:"Charlotte",s:"NC",avg:448000,col:95.7,g:4.0,home:401940,rent:2105},
  {c:"Nashville",s:"TN",avg:445000,col:91.1,g:5.2,home:382620,rent:2004},
  {c:"Kansas City",s:"MO",avg:437624,col:88.4,g:5.0,home:371280,rent:1944},
  {c:"Indianapolis",s:"IN",avg:435000,col:90.5,g:4.8,home:380100,rent:1991},
  {c:"New York",s:"NY",avg:435986,col:128.7,g:2.1,home:540540,rent:2831},
  {c:"Columbus",s:"OH",avg:432000,col:91.0,g:3.5,home:382200,rent:2002},
  {c:"Oklahoma City",s:"OK",avg:430000,col:84.7,g:6.1,home:355740,rent:1863},
  {c:"Omaha",s:"NE",avg:428000,col:91.8,g:4.5,home:385560,rent:2019},
  {c:"Dallas",s:"TX",avg:427000,col:95.0,g:3.8,home:399000,rent:2090},
  {c:"Houston",s:"TX",avg:425000,col:92.1,g:4.1,home:386820,rent:2026},
  {c:"Atlanta",s:"GA",avg:423000,col:93.4,g:3.5,home:392280,rent:2054},
  {c:"Chicago",s:"IL",avg:421000,col:93.4,g:3.2,home:392280,rent:2054},
  {c:"Denver",s:"CO",avg:419000,col:105.0,g:3.0,home:441000,rent:2310},
  {c:"Phoenix",s:"AZ",avg:418000,col:102.2,g:4.5,home:429240,rent:2248},
  {c:"Portland",s:"OR",avg:416000,col:113.1,g:2.2,home:475020,rent:2488},
  {c:"Detroit",s:"MI",avg:415000,col:91.0,g:3.8,home:382200,rent:2002},
  {c:"Tampa",s:"FL",avg:413000,col:102.8,g:4.0,home:431760,rent:2261},
  {c:"San Antonio",s:"TX",avg:412000,col:88.0,g:4.3,home:369600,rent:1936},
  {c:"Austin",s:"TX",avg:410000,col:97.0,g:2.8,home:407400,rent:2134},
  {c:"Las Vegas",s:"NV",avg:408000,col:104.0,g:5.5,home:436800,rent:2288},
  {c:"Cincinnati",s:"OH",avg:407000,col:90.0,g:3.6,home:378000,rent:1980},
  {c:"Pittsburgh",s:"PA",avg:405000,col:92.0,g:2.8,home:386400,rent:2024},
  {c:"Milwaukee",s:"WI",avg:404000,col:95.0,g:3.4,home:399000,rent:2090},
  {c:"Jacksonville",s:"FL",avg:403000,col:96.0,g:5.0,home:403200,rent:2112},
  {c:"Memphis",s:"TN",avg:401000,col:87.0,g:4.2,home:365400,rent:1914},
  {c:"Louisville",s:"KY",avg:400000,col:90.3,g:3.8,home:379260,rent:1986},
  {c:"Salt Lake City",s:"UT",avg:399000,col:100.7,g:3.2,home:422940,rent:2215},
  {c:"New Orleans",s:"LA",avg:397000,col:91.2,g:5.8,home:383040,rent:2006},
  {c:"Raleigh",s:"NC",avg:396000,col:97.0,g:3.0,home:407400,rent:2134},
  {c:"Richmond",s:"VA",avg:394000,col:99.0,g:2.5,home:415800,rent:2178},
  {c:"Cleveland",s:"OH",avg:393000,col:89.0,g:3.2,home:373800,rent:1958},
  {c:"Birmingham",s:"AL",avg:392000,col:87.9,g:4.5,home:369180,rent:1933},
  {c:"San Diego",s:"CA",avg:390000,col:135.0,g:1.5,home:567000,rent:2970},
  {c:"Hartford",s:"CT",avg:389000,col:112.8,g:2.0,home:473760,rent:2481},
  {c:"Tucson",s:"AZ",avg:388000,col:95.0,g:4.8,home:399000,rent:2090},
  {c:"Knoxville",s:"TN",avg:387000,col:86.0,g:5.0,home:361200,rent:1892},
  {c:"Des Moines",s:"IA",avg:386000,col:89.4,g:4.0,home:375480,rent:1966},
  {c:"Boise",s:"ID",avg:385000,col:97.3,g:3.5,home:408660,rent:2140},
  {c:"Little Rock",s:"AR",avg:384000,col:89.0,g:4.2,home:373800,rent:1958},
  {c:"Tulsa",s:"OK",avg:383000,col:84.0,g:5.5,home:352800,rent:1848},
  {c:"Greenville",s:"SC",avg:382000,col:93.0,g:4.0,home:390600,rent:2046},
  {c:"Lexington",s:"KY",avg:381000,col:89.0,g:3.8,home:373800,rent:1958},
  {c:"Grand Rapids",s:"MI",avg:380000,col:88.0,g:4.5,home:369600,rent:1936},
  {c:"Spokane",s:"WA",avg:379000,col:95.0,g:3.2,home:399000,rent:2090},
  {c:"Wichita",s:"KS",avg:378000,col:86.0,g:4.8,home:361200,rent:1892},
  {c:"Madison",s:"WI",avg:377000,col:97.0,g:2.8,home:407400,rent:2134},
  {c:"Albuquerque",s:"NM",avg:376000,col:93.8,g:3.5,home:393960,rent:2063},
  {c:"Baton Rouge",s:"LA",avg:375000,col:90.0,g:4.0,home:378000,rent:1980},
  {c:"El Paso",s:"TX",avg:374000,col:85.0,g:5.0,home:357000,rent:1870},
  {c:"Fresno",s:"CA",avg:373000,col:98.0,g:4.5,home:411600,rent:2156},
  {c:"Dayton",s:"OH",avg:372000,col:87.0,g:3.5,home:365400,rent:1914},
  {c:"Akron",s:"OH",avg:371000,col:86.0,g:3.2,home:361200,rent:1892},
  {c:"Savannah",s:"GA",avg:370000,col:89.0,g:4.5,home:373800,rent:1958},
  {c:"Charleston",s:"SC",avg:369000,col:98.0,g:3.0,home:411600,rent:2156},
  {c:"Chattanooga",s:"TN",avg:368000,col:85.0,g:4.8,home:357000,rent:1870},
  {c:"Sioux Falls",s:"SD",avg:367000,col:93.4,g:5.0,home:392280,rent:2054},
  {c:"Fargo",s:"ND",avg:366000,col:92.2,g:4.2,home:387240,rent:2028},
  {c:"Billings",s:"MT",avg:365000,col:99.3,g:3.5,home:417060,rent:2184},
  {c:"Anchorage",s:"AK",avg:364000,col:127.2,g:2.0,home:534240,rent:2798},
  {c:"Honolulu",s:"HI",avg:363000,col:183.9,g:1.0,home:772380,rent:4045},
  {c:"Miami",s:"FL",avg:362000,col:112.0,g:2.5,home:470400,rent:2464},
  {c:"Seattle",s:"WA",avg:361000,col:114.2,g:2.8,home:479640,rent:2512},
  {c:"Washington",s:"DC",avg:360000,col:148.7,g:1.5,home:624540,rent:3271},
  {c:"Philadelphia",s:"PA",avg:359000,col:99.2,g:2.2,home:416640,rent:2182},
  {c:"Baltimore",s:"MD",avg:358000,col:105.0,g:3.8,home:441000,rent:2310},
  {c:"Wilmington",s:"DE",avg:357000,col:102.5,g:2.5,home:430500,rent:2255},
  {c:"Norfolk",s:"VA",avg:356000,col:97.0,g:3.0,home:407400,rent:2134},
  {c:"Harrisburg",s:"PA",avg:355000,col:95.0,g:3.2,home:399000,rent:2090},
  {c:"Syracuse",s:"NY",avg:354000,col:92.0,g:2.0,home:386400,rent:2024},
  {c:"Albany",s:"NY",avg:353000,col:95.0,g:2.5,home:399000,rent:2090},
  {c:"Buffalo",s:"NY",avg:352000,col:90.0,g:3.0,home:378000,rent:1980},
  {c:"Rochester",s:"NY",avg:351000,col:91.0,g:2.8,home:382200,rent:2002},
  {c:"Springfield",s:"MA",avg:350000,col:105.0,g:2.0,home:441000,rent:2310},
  {c:"Worcester",s:"MA",avg:349000,col:110.0,g:1.8,home:462000,rent:2420},
  {c:"New Haven",s:"CT",avg:348000,col:115.0,g:1.5,home:483000,rent:2530},
  {c:"Providence",s:"RI",avg:347000,col:109.5,g:3.5,home:459900,rent:2409},
  {c:"Portland",s:"ME",avg:346000,col:109.0,g:2.0,home:457800,rent:2398},
  {c:"Burlington",s:"VT",avg:345000,col:114.7,g:1.5,home:481740,rent:2523},
  {c:"Manchester",s:"NH",avg:344000,col:112.4,g:2.0,home:472080,rent:2472},
  {c:"Columbia",s:"SC",avg:343000,col:92.0,g:4.0,home:386400,rent:2024},
  {c:"Augusta",s:"GA",avg:342000,col:87.0,g:4.5,home:365400,rent:1914},
  {c:"Jackson",s:"MS",avg:341000,col:85.7,g:5.0,home:359940,rent:1885},
  {c:"Shreveport",s:"LA",avg:340000,col:86.0,g:4.8,home:361200,rent:1892},
  {c:"Lubbock",s:"TX",avg:339000,col:82.0,g:5.5,home:344400,rent:1804},
  {c:"Amarillo",s:"TX",avg:338000,col:83.0,g:5.2,home:348600,rent:1826},
  {c:"Midland",s:"TX",avg:337000,col:90.0,g:4.0,home:378000,rent:1980},
  {c:"Corpus Christi",s:"TX",avg:336000,col:85.0,g:4.5,home:357000,rent:1870},
  {c:"Bakersfield",s:"CA",avg:335000,col:95.0,g:4.8,home:399000,rent:2090},
  {c:"Durham",s:"NC",avg:334000,col:97.0,g:2.0,home:407400,rent:2134},
  {c:"Gainesville",s:"FL",avg:333000,col:95.0,g:3.0,home:399000,rent:2090},
  {c:"Ann Arbor",s:"MI",avg:332000,col:105.0,g:1.5,home:441000,rent:2310},
  {c:"Iowa City",s:"IA",avg:331000,col:93.0,g:2.5,home:390600,rent:2046}
];
