// Premium SVG Icon library - Lucide-inspired, stroke-based
// viewBox 0 0 24 24, stroke=currentColor, fill=none, strokeWidth=1.5

const I = (d, extra) => ({ d, ...extra });

export const ICON_PATHS = {
  // Core
  dashboard: I("M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M9 22V12h6v10"),
  salary: I("M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"),
  ficountdown: I("M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2"),
  spending: I("M21 4H3v16h18V4z M3 10h18 M7 15h2 M12 15h2"),
  loans: I("M2 7h20v13H2V7z M6 7V5a4 4 0 018 0v2 M12 14v2"),  // Tax
  tax: I("M4 2h16v20H4V2z M8 6h8 M8 10h8 M8 14h5 M15 22l3-3-3-3", { multi: "M15 22l3-3-3-3" }),
  statemove: I("M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 7v6 M9 10h6"),
  dualphys: I("M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75"),
  taxcalendar: I("M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z M16 2v4 M8 2v4 M3 10h18 M8 14h.01 M12 14h.01 M16 14h.01 M8 18h.01 M12 18h.01"),
  w4optimizer: I("M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z M14 2v6h6 M12 18v-6 M9 15l3 3 3-3"),
  backdoorroth: I("M15 3h6v6 M10 14L21 3 M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"),
  charitable: I("M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"),  // Wealth
  retirement: I("M22 12h-4l-3 9L9 3l-3 9H2"),
  realestate: I("M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"),
  estateplan: I("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"),
  nwtracker: I("M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6"),
  // Debt
  debtpayoff: I("M23 18l-9.5-9.5-5 5L1 6 M17 18h6v-6"),
  // Protection
  insurance: I("M18 8A6 6 0 006 8c0 7-3 9-6 13 6-1 12-6 12-13 0-3.31-2.69-6-6-6z"),
  disability: I("M22 12h-4l-3 9L9 3l-3 9H2"),
  malrisk: I("M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01"),  // Career
  contracts: I("M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"),
  practicebuy: I("M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"),
  moonlight: I("M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"),
  burnout: I("M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.5-2-2-3.5-2-5.5a7.5 7.5 0 0115 0c0 2-.5 3.5-2 5.5-.5 1-1 1.62-1 3a2.5 2.5 0 002.5 2.5 M8.5 14.5h7 M9 18h6 M10 21.5h4"),
  offercompare: I("M18 20V10 M12 20V4 M6 20v-6"),
  credentials: I("M12 15a7 7 0 100-14 7 7 0 000 14z M8.21 13.89L7 23l5-3 5 3-1.21-9.12"),
  negotiate: I("M17 18a2 2 0 002-2V8l-6-6H5a2 2 0 00-2 2v12a2 2 0 002 2h4 M14 2v6h6 M12 18a4 4 0 018 0 M16 14a2 2 0 100-4 2 2 0 000 4z"),
  partnership: I("M16 3.13a4 4 0 010 7.75 M21 21v-2a4 4 0 00-3-3.87 M13 7a4 4 0 11-8 0 4 4 0 018 0z M9 21v-2a4 4 0 014-4h0a4 4 0 014 4v2"),
  locumrates: I("M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z M8 2v16 M16 6v16"),
  rvucalc: I("M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z M8 12h8 M12 8v8 M7 7h.01"),  // Banking & AI
  plaid: I("M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"),
  vault: I("M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z M3 10h18 M12 10v10 M7 2v2 M17 2v2"),
  incomemap: I("M18 20V10 M12 20V4 M6 20v-6"),
  marketplace: I("M6 2L3 7v13a2 2 0 002 2h14a2 2 0 002-2V7l-3-5z M3 7h18 M16 11a4 4 0 01-8 0"),
  docscan: I("M2 7l4.41-4.41A2 2 0 017.83 2h8.34a2 2 0 011.42.59L22 7 M4 7v13a2 2 0 002 2h12a2 2 0 002-2V7 M12 16a4 4 0 100-8 4 4 0 000 8z"),
  aichat: I("M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1c.34-.6.99-1 1.73-1a2 2 0 110 4c-.74 0-1.39-.4-1.73-1H20a7 7 0 01-7 7v1c.6.34 1 .99 1 1.73a2 2 0 11-4 0c0-.74.4-1.39 1-1.73V23a7 7 0 01-7-7H3c-.34.6-.99 1-1.73 1a2 2 0 110-4c.74 0 1.39.4 1.73 1H4a7 7 0 017-7V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z"),
  // Other
  creep: I("M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z"),
  emergency: I("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 8v4 M12 16h.01"),
  checklists: I("M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"),
  wellness: I("M4.93 4.93l4.24 4.24 M19.07 4.93l-4.24 4.24 M12 2v4 M12 18v4 M4.93 19.07l4.24-4.24 M19.07 19.07l-4.24-4.24 M2 12h4 M18 12h4"),
  salarydb: I("M12 2C6.48 2 2 4.02 2 6.5v11C2 19.98 6.48 22 12 22s10-2.02 10-4.5v-11C22 4.02 17.52 2 12 2z M2 6.5C2 8.98 6.48 11 12 11s10-2.02 10-4.5 M2 12c0 2.48 4.48 4.5 10 4.5s10-2.02 10-4.5"),
  community: I("M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75"),  // System
  settings: I("M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"),
  billing: I("M1 4h22v16H1V4z M1 10h22"),
};

// Render helper
export const Icon = ({ name, size = 16, className = "" }) => {
  const icon = ICON_PATHS[name];
  if (!icon) return <span className={className} style={{width:size,height:size,display:"inline-block"}} />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      strokeLinejoin="round" className={className}>
      <path d={icon.d} />
    </svg>
  );
};

// Lock icon for paywall
export const LockIcon = ({ size = 48, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
    <circle cx="12" cy="16" r="1" />
  </svg>
);

export default Icon;