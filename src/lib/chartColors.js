// Theme-aware chart colors - reads CSS vars set by theme.js
const g = () => getComputedStyle(document.documentElement);
const v = (n) => g().getPropertyValue(`--${n}`).trim();

export function chartBarFill() { return v("chartBarFill") || "rgba(0,0,0,0.15)"; }
export function chartGrid() { return v("chartGrid") || "rgba(0,0,0,0.04)"; }
export function chartAxis() { return v("chartAxis") || "rgba(0,0,0,0.08)"; }
export function chartText() { return v("chartText") || "rgba(0,0,0,0.3)"; }
export function chartCircle() { return v("chartCircle") || "rgba(0,0,0,0.04)"; }
export function chartBarBg() { return v("chartBarBg") || "rgba(0,0,0,0.06)"; }
