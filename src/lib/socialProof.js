// Simulated live metrics (would be real-time from Supabase in production)
export const LIVE_METRICS = {
  totalUsers: 12847,
  verifiedPhysicians: 11203,
  salariesShared: 8934,
  communityPosts: 4267,
  avgSavingsFound: 31400,
  documentsAnalyzed: 3891,
  activeToday: 847,
  specialtiesRepresented: 20,
  statesRepresented: 48,
  totalUpvotes: 234567,
};

// Recent activity feed (simulated)
export const RECENT_ACTIVITY = [
  { type:"salary", text:"Cardiologist in TX shared compensation: $485K + RVU bonus", time:"2m ago" },
  { type:"post", text:"New discussion: PSLF forgiveness timeline for IM residents", time:"4m ago" },
  { type:"savings", text:"Emergency physician found $28K in tax deductions via AI scan", time:"7m ago" },
  { type:"review", text:"Verified review posted for large Midwest health system", time:"11m ago" },
  { type:"salary", text:"Dermatologist in FL shared: $520K private practice", time:"14m ago" },
  { type:"milestone", text:"Orthopedic surgeon hit $2M net worth milestone", time:"18m ago" },
  { type:"post", text:"New discussion: Mega backdoor Roth employer list", time:"22m ago" },
  { type:"savings", text:"Psychiatrist saved $15K using state tax arbitrage tool", time:"25m ago" },
  { type:"review", text:"Verified review: PE-backed anesthesia group rated 2.1/5", time:"31m ago" },
  { type:"salary", text:"Hospitalist in MN shared: $340K, 7on/7off", time:"35m ago" },
  { type:"post", text:"New discussion: Non-compete enforceability by state", time:"38m ago" },
  { type:"savings", text:"Neurologist found $42K in missed retirement contributions", time:"42m ago" },
];

// Verified employer domains (sample)
export const VERIFIED_DOMAINS = {
  "mayo.edu": "Mayo Clinic",
  "clevelandclinic.org": "Cleveland Clinic",
  "partners.org": "Mass General Brigham",
  "jhmi.edu": "Johns Hopkins",
  "stanford.edu": "Stanford Health",
  "ucsf.edu": "UCSF Medical Center",
  "mountsinai.org": "Mount Sinai",
  "nyp.org": "NYP / Columbia / Cornell",
  "upmc.edu": "UPMC",
  "duke.edu": "Duke Health",
  "vumc.org": "Vanderbilt",
  "pennmedicine.upenn.edu": "Penn Medicine",
  "hca.com": "HCA Healthcare",
  "commonspirit.org": "CommonSpirit Health",
  "ascension.org": "Ascension",
  "providence.org": "Providence",
  "sutter.org": "Sutter Health",
  "va.gov": "Veterans Affairs",
  "kaiser.org": "Kaiser Permanente",
  "emory.edu": "Emory Healthcare",
};
