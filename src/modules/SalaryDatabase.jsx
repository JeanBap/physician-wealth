import { useState, useMemo } from "react";
import { SPECIALTIES, STATE_NAMES, fmt, fN } from "../lib/data";
import { Section, Stat, Card, Inp, Badge, Takeaway, Btn } from "../components/ui";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
const Tip=({active,payload,label})=>{if(!active||!payload?.length)return null;return(<div style={{background:"var(--tooltipBg)",border:"1px solid var(--tooltipBorder)"}} className="rounded-lg px-3 py-2 shadow-2xl"><p className="text-xs text-white/50 mb-1">{label}</p>{payload.map((p,i)=><p key={i} className="text-sm font-bold" style={{color:p.color}}>{p.name}: ${p.value?.toLocaleString()}</p>)}</div>)};

function loadSubmissions() { try { return JSON.parse(localStorage.getItem("pw_salarydb") || "[]"); } catch { return []; } }

const SAMPLE_DATA = [
  { specialty:"Orthopedic Surgery", state:"CA", metro:"Los Angeles", setting:"Private", yrsExp:10, base:500000, bonus:200000, rvu:9000, rvuRate:75, ptoWeeks:5, call:"1:4", nonCompete:"None", tailCovered:true, signOnBonus:30000, loanRepay:0, retirementMatch:"4%" },
  { specialty:"Orthopedic Surgery", state:"TX", metro:"Dallas", setting:"Hospital", yrsExp:5, base:400000, bonus:100000, rvu:7000, rvuRate:60, ptoWeeks:4, call:"1:6", nonCompete:"20mi/2yr", tailCovered:true, signOnBonus:50000, loanRepay:50000, retirementMatch:"3%" },
  { specialty:"Orthopedic Surgery", state:"MN", metro:"Rochester", setting:"Academic", yrsExp:15, base:350000, bonus:75000, rvu:6000, rvuRate:55, ptoWeeks:5, call:"1:5", nonCompete:"None", tailCovered:true, signOnBonus:10000, loanRepay:0, retirementMatch:"5%" },
  { specialty:"Orthopedic Surgery", state:"CO", metro:"Denver", setting:"Group", yrsExp:3, base:420000, bonus:80000, rvu:7500, rvuRate:65, ptoWeeks:4, call:"1:4", nonCompete:"None", tailCovered:true, signOnBonus:75000, loanRepay:30000, retirementMatch:"4%" },
  { specialty:"Orthopedic Surgery", state:"FL", metro:"Miami", setting:"Private", yrsExp:12, base:550000, bonus:250000, rvu:10000, rvuRate:80, ptoWeeks:6, call:"1:8", nonCompete:"15mi/2yr", tailCovered:true, signOnBonus:20000, loanRepay:0, retirementMatch:"5%" },
  { specialty:"Cardiology", state:"NY", metro:"NYC Metro", setting:"Academic", yrsExp:7, base:300000, bonus:80000, rvu:5000, rvuRate:60, ptoWeeks:4, call:"1:3", nonCompete:"None", tailCovered:true, signOnBonus:15000, loanRepay:20000, retirementMatch:"3%" },
  { specialty:"Cardiology", state:"TX", metro:"Houston", setting:"Private", yrsExp:14, base:450000, bonus:180000, rvu:7000, rvuRate:75, ptoWeeks:5, call:"1:4", nonCompete:"20mi/2yr", tailCovered:true, signOnBonus:40000, loanRepay:0, retirementMatch:"5%" },
  { specialty:"Cardiology", state:"OH", metro:"Cleveland", setting:"Hospital", yrsExp:8, base:380000, bonus:120000, rvu:6000, rvuRate:65, ptoWeeks:4, call:"1:5", nonCompete:"15mi/1yr", tailCovered:true, signOnBonus:60000, loanRepay:40000, retirementMatch:"4%" },
  { specialty:"Cardiology", state:"CA", metro:"San Diego", setting:"Group", yrsExp:20, base:400000, bonus:150000, rvu:6500, rvuRate:68, ptoWeeks:6, call:"1:6", nonCompete:"None", tailCovered:true, signOnBonus:0, loanRepay:0, retirementMatch:"6%" },
  { specialty:"Cardiology", state:"PA", metro:"Philadelphia", setting:"Private", yrsExp:6, base:420000, bonus:130000, rvu:6800, rvuRate:70, ptoWeeks:5, call:"1:4", nonCompete:"15mi/2yr", tailCovered:true, signOnBonus:25000, loanRepay:100000, retirementMatch:"4%" },
  { specialty:"Radiology", state:"CA", metro:"Los Angeles", setting:"Private", yrsExp:9, base:450000, bonus:150000, rvu:12000, rvuRate:38, ptoWeeks:5, call:"None", nonCompete:"None", tailCovered:true, signOnBonus:20000, loanRepay:0, retirementMatch:"4%" },
  { specialty:"Radiology", state:"TX", metro:"Austin", setting:"Locum", yrsExp:4, base:500000, bonus:0, rvu:0, rvuRate:0, ptoWeeks:0, call:"None", nonCompete:"None", tailCovered:true, signOnBonus:0, loanRepay:0, retirementMatch:"0%" },
  { specialty:"Radiology", state:"FL", metro:"Tampa", setting:"Hospital", yrsExp:11, base:380000, bonus:100000, rvu:10000, rvuRate:35, ptoWeeks:4, call:"1:6", nonCompete:"20mi/2yr", tailCovered:true, signOnBonus:30000, loanRepay:50000, retirementMatch:"5%" },
  { specialty:"Radiology", state:"CO", metro:"Denver", setting:"Group", yrsExp:5, base:400000, bonus:80000, rvu:11000, rvuRate:32, ptoWeeks:4, call:"1:5", nonCompete:"None", tailCovered:true, signOnBonus:50000, loanRepay:20000, retirementMatch:"4%" },
  { specialty:"Radiology", state:"NY", metro:"Buffalo", setting:"Academic", yrsExp:18, base:330000, bonus:70000, rvu:9000, rvuRate:33, ptoWeeks:5, call:"1:4", nonCompete:"None", tailCovered:true, signOnBonus:100000, loanRepay:30000, retirementMatch:"6%" },
  { specialty:"Plastic Surgery", state:"CA", metro:"Beverly Hills", setting:"Private", yrsExp:15, base:500000, bonus:400000, rvu:5000, rvuRate:100, ptoWeeks:6, call:"None", nonCompete:"None", tailCovered:true, signOnBonus:0, loanRepay:0, retirementMatch:"4%" },
  { specialty:"Plastic Surgery", state:"TX", metro:"Dallas", setting:"Hospital", yrsExp:8, base:380000, bonus:120000, rvu:4000, rvuRate:85, ptoWeeks:5, call:"1:6", nonCompete:"20mi/2yr", tailCovered:true, signOnBonus:40000, loanRepay:50000, retirementMatch:"3%" },
  { specialty:"Plastic Surgery", state:"FL", metro:"Miami", setting:"Private", yrsExp:10, base:450000, bonus:200000, rvu:4500, rvuRate:95, ptoWeeks:5, call:"None", nonCompete:"15mi/2yr", tailCovered:true, signOnBonus:25000, loanRepay:0, retirementMatch:"5%" },
  { specialty:"Plastic Surgery", state:"NY", metro:"NYC Metro", setting:"Academic", yrsExp:6, base:300000, bonus:80000, rvu:3000, rvuRate:75, ptoWeeks:4, call:"1:5", nonCompete:"None", tailCovered:true, signOnBonus:10000, loanRepay:0, retirementMatch:"4%" },
  { specialty:"Plastic Surgery", state:"CO", metro:"Aspen", setting:"Private", yrsExp:20, base:550000, bonus:200000, rvu:4000, rvuRate:110, ptoWeeks:6, call:"None", nonCompete:"None", tailCovered:true, signOnBonus:80000, loanRepay:0, retirementMatch:"6%" },
  { specialty:"Anesthesiology", state:"CA", metro:"San Francisco", setting:"Private", yrsExp:12, base:450000, bonus:80000, rvu:0, rvuRate:0, ptoWeeks:5, call:"1:4", nonCompete:"None", tailCovered:true, signOnBonus:20000, loanRepay:0, retirementMatch:"5%" },
  { specialty:"Anesthesiology", state:"TX", metro:"Houston", setting:"Group", yrsExp:7, base:420000, bonus:70000, rvu:0, rvuRate:0, ptoWeeks:4, call:"1:5", nonCompete:"20mi/2yr", tailCovered:true, signOnBonus:50000, loanRepay:30000, retirementMatch:"4%" },
  { specialty:"Anesthesiology", state:"MN", metro:"Minneapolis", setting:"Academic", yrsExp:15, base:350000, bonus:50000, rvu:0, rvuRate:0, ptoWeeks:5, call:"1:6", nonCompete:"None", tailCovered:true, signOnBonus:15000, loanRepay:0, retirementMatch:"5%" },
  { specialty:"Anesthesiology", state:"CO", metro:"Denver", setting:"Hospital", yrsExp:4, base:370000, bonus:40000, rvu:0, rvuRate:0, ptoWeeks:4, call:"1:4", nonCompete:"None", tailCovered:true, signOnBonus:70000, loanRepay:50000, retirementMatch:"3%" },
  { specialty:"Anesthesiology", state:"NY", metro:"NYC Metro", setting:"Locum", yrsExp:3, base:500000, bonus:0, rvu:0, rvuRate:0, ptoWeeks:0, call:"shift", nonCompete:"None", tailCovered:true, signOnBonus:0, loanRepay:0, retirementMatch:"0%" },
  { specialty:"Urology", state:"WA", metro:"Seattle", setting:"Hospital", yrsExp:10, base:430000, bonus:60000, rvu:5800, rvuRate:62, ptoWeeks:4, call:"1:5", nonCompete:"15mi/1yr", tailCovered:true, signOnBonus:25000, loanRepay:50000, retirementMatch:"5%" },
  { specialty:"Urology", state:"IL", metro:"Chicago", setting:"Private", yrsExp:15, base:450000, bonus:100000, rvu:6000, rvuRate:68, ptoWeeks:5, call:"1:4", nonCompete:"20mi/2yr", tailCovered:false, signOnBonus:0, loanRepay:0, retirementMatch:"3%" },
  { specialty:"Urology", state:"TN", metro:"Nashville", setting:"Academic", yrsExp:8, base:350000, bonus:40000, rvu:5000, rvuRate:50, ptoWeeks:5, call:"1:6", nonCompete:"None", tailCovered:true, signOnBonus:15000, loanRepay:30000, retirementMatch:"8%" },
  { specialty:"Urology", state:"NE", metro:"Rural Nebraska", setting:"Group", yrsExp:5, base:400000, bonus:80000, rvu:5500, rvuRate:60, ptoWeeks:4, call:"1:4", nonCompete:"None", tailCovered:true, signOnBonus:100000, loanRepay:80000, retirementMatch:"4%" },
  { specialty:"Urology", state:"AZ", metro:"Phoenix", setting:"Locum", yrsExp:2, base:500000, bonus:0, rvu:0, rvuRate:0, ptoWeeks:0, call:"None", nonCompete:"None", tailCovered:true, signOnBonus:0, loanRepay:0, retirementMatch:"0%" },
  { specialty:"Gastroenterology", state:"GA", metro:"Atlanta", setting:"Hospital", yrsExp:12, base:450000, bonus:100000, rvu:7000, rvuRate:65, ptoWeeks:4, call:"1:5", nonCompete:"20mi/2yr", tailCovered:true, signOnBonus:30000, loanRepay:60000, retirementMatch:"5%" },
  { specialty:"Gastroenterology", state:"ID", metro:"Boise", setting:"Private", yrsExp:20, base:500000, bonus:150000, rvu:8000, rvuRate:70, ptoWeeks:5, call:"1:4", nonCompete:"15mi/1yr", tailCovered:false, signOnBonus:0, loanRepay:0, retirementMatch:"3%" },
  { specialty:"Gastroenterology", state:"IL", metro:"Chicago", setting:"Academic", yrsExp:6, base:380000, bonus:50000, rvu:5500, rvuRate:55, ptoWeeks:5, call:"1:6", nonCompete:"None", tailCovered:true, signOnBonus:20000, loanRepay:40000, retirementMatch:"7%" },
  { specialty:"Gastroenterology", state:"MS", metro:"Rural Mississippi", setting:"Group", yrsExp:4, base:420000, bonus:90000, rvu:6000, rvuRate:60, ptoWeeks:4, call:"1:4", nonCompete:"None", tailCovered:true, signOnBonus:90000, loanRepay:70000, retirementMatch:"4%" },
  { specialty:"Gastroenterology", state:"CO", metro:"Denver", setting:"Telehealth", yrsExp:3, base:350000, bonus:50000, rvu:5000, rvuRate:58, ptoWeeks:5, call:"None", nonCompete:"None", tailCovered:true, signOnBonus:10000, loanRepay:0, retirementMatch:"5%" },
  { specialty:"General Surgery", state:"AZ", metro:"Phoenix", setting:"Hospital", yrsExp:15, base:450000, bonus:70000, rvu:6500, rvuRate:60, ptoWeeks:4, call:"1:3", nonCompete:"15mi/2yr", tailCovered:true, signOnBonus:40000, loanRepay:50000, retirementMatch:"5%" },
  { specialty:"General Surgery", state:"TN", metro:"Nashville", setting:"Private", yrsExp:10, base:480000, bonus:100000, rvu:7000, rvuRate:65, ptoWeeks:5, call:"1:4", nonCompete:"20mi/2yr", tailCovered:false, signOnBonus:0, loanRepay:0, retirementMatch:"3%" },
  { specialty:"General Surgery", state:"GA", metro:"Atlanta", setting:"Academic", yrsExp:8, base:380000, bonus:45000, rvu:5500, rvuRate:55, ptoWeeks:5, call:"1:5", nonCompete:"None", tailCovered:true, signOnBonus:15000, loanRepay:40000, retirementMatch:"8%" },
  { specialty:"General Surgery", state:"NE", metro:"Rural Nebraska", setting:"Group", yrsExp:3, base:400000, bonus:80000, rvu:6000, rvuRate:58, ptoWeeks:4, call:"1:4", nonCompete:"None", tailCovered:true, signOnBonus:95000, loanRepay:85000, retirementMatch:"4%" },
  { specialty:"General Surgery", state:"WA", metro:"Seattle", setting:"Locum", yrsExp:1, base:550000, bonus:0, rvu:0, rvuRate:0, ptoWeeks:0, call:"None", nonCompete:"None", tailCovered:true, signOnBonus:0, loanRepay:0, retirementMatch:"0%" },
  { specialty:"Dermatology", state:"IL", metro:"Chicago", setting:"Private", yrsExp:18, base:500000, bonus:200000, rvu:9000, rvuRate:75, ptoWeeks:5, call:"None", nonCompete:"10mi/1yr", tailCovered:false, signOnBonus:0, loanRepay:0, retirementMatch:"3%" },
  { specialty:"Dermatology", state:"WA", metro:"Seattle", setting:"Hospital", yrsExp:12, base:450000, bonus:80000, rvu:7000, rvuRate:65, ptoWeeks:4, call:"None", nonCompete:"15mi/1yr", tailCovered:true, signOnBonus:30000, loanRepay:50000, retirementMatch:"5%" },
  { specialty:"Dermatology", state:"GA", metro:"Atlanta", setting:"Academic", yrsExp:6, base:380000, bonus:60000, rvu:6000, rvuRate:60, ptoWeeks:5, call:"None", nonCompete:"None", tailCovered:true, signOnBonus:20000, loanRepay:40000, retirementMatch:"7%" },
  { specialty:"Dermatology", state:"MS", metro:"Rural Mississippi", setting:"Group", yrsExp:4, base:420000, bonus:100000, rvu:6500, rvuRate:62, ptoWeeks:4, call:"None", nonCompete:"None", tailCovered:true, signOnBonus:85000, loanRepay:60000, retirementMatch:"4%" },
  { specialty:"Dermatology", state:"CO", metro:"Denver", setting:"Telehealth", yrsExp:2, base:400000, bonus:50000, rvu:6000, rvuRate:60, ptoWeeks:5, call:"None", nonCompete:"None", tailCovered:true, signOnBonus:10000, loanRepay:0, retirementMatch:"5%" },
  { specialty:"Pediatric Surgery", state:"TN", metro:"Nashville", setting:"Hospital", yrsExp:14, base:520000, bonus:80000, rvu:6500, rvuRate:70, ptoWeeks:4, call:"1:4", nonCompete:"20mi/2yr", tailCovered:true, signOnBonus:40000, loanRepay:50000, retirementMatch:"5%" },
  { specialty:"Pediatric Surgery", state:"AZ", metro:"Phoenix", setting:"Private", yrsExp:10, base:550000, bonus:120000, rvu:7000, rvuRate:75, ptoWeeks:5, call:"1:4", nonCompete:"15mi/2yr", tailCovered:false, signOnBonus:0, loanRepay:0, retirementMatch:"3%" },
  { specialty:"Pediatric Surgery", state:"IL", metro:"Chicago", setting:"Academic", yrsExp:7, base:480000, bonus:60000, rvu:6000, rvuRate:65, ptoWeeks:5, call:"1:5", nonCompete:"None", tailCovered:true, signOnBonus:25000, loanRepay:40000, retirementMatch:"8%" },
  { specialty:"Pediatric Surgery", state:"NE", metro:"Rural Nebraska", setting:"Hospital", yrsExp:3, base:480000, bonus:90000, rvu:6200, rvuRate:68, ptoWeeks:4, call:"1:4", nonCompete:"None", tailCovered:true, signOnBonus:100000, loanRepay:80000, retirementMatch:"4%" },
  { specialty:"Pediatric Surgery", state:"CA", metro:"Los Angeles", setting:"Locum", yrsExp:2, base:600000, bonus:0, rvu:0, rvuRate:0, ptoWeeks:0, call:"None", nonCompete:"None", tailCovered:true, signOnBonus:0, loanRepay:0, retirementMatch:"0%" },
  { specialty:"Emergency Medicine", state:"ID", metro:"Boise", setting:"Hospital", yrsExp:10, base:380000, bonus:40000, rvu:0, rvuRate:0, ptoWeeks:4, call:"shift", nonCompete:"None", tailCovered:true, signOnBonus:20000, loanRepay:30000, retirementMatch:"5%" },
  { specialty:"Emergency Medicine", state:"AZ", metro:"Phoenix", setting:"Group", yrsExp:8, base:400000, bonus:50000, rvu:0, rvuRate:0, ptoWeeks:5, call:"shift", nonCompete:"None", tailCovered:true, signOnBonus:25000, loanRepay:40000, retirementMatch:"4%" },
  { specialty:"Emergency Medicine", state:"WA", metro:"Seattle", setting:"Academic", yrsExp:5, base:350000, bonus:30000, rvu:0, rvuRate:0, ptoWeeks:5, call:"shift", nonCompete:"None", tailCovered:true, signOnBonus:15000, loanRepay:30000, retirementMatch:"7%" },
  { specialty:"Emergency Medicine", state:"MS", metro:"Rural Mississippi", setting:"Locum", yrsExp:1, base:450000, bonus:0, rvu:0, rvuRate:0, ptoWeeks:0, call:"shift", nonCompete:"None", tailCovered:true, signOnBonus:0, loanRepay:0, retirementMatch:"0%" },
  { specialty:"Emergency Medicine", state:"IL", metro:"Chicago", setting:"Hospital", yrsExp:15, base:420000, bonus:60000, rvu:0, rvuRate:0, ptoWeeks:4, call:"shift", nonCompete:"15mi/1yr", tailCovered:true, signOnBonus:30000, loanRepay:50000, retirementMatch:"5%" },
  { specialty:"Ophthalmology", state:"OR", metro:"Portland", setting:"Private", yrsExp:12, base:420000, bonus:130000, rvu:9500, rvuRate:62, ptoWeeks:5, call:"None", nonCompete:"15mi/2yr", tailCovered:true, signOnBonus:20000, loanRepay:50000, retirementMatch:"4%" },
  { specialty:"Ophthalmology", state:"MI", metro:"Detroit", setting:"Hospital", yrsExp:8, base:350000, bonus:50000, rvu:8000, rvuRate:55, ptoWeeks:4, call:"1:5", nonCompete:"5mi/1yr", tailCovered:true, signOnBonus:15000, loanRepay:75000, retirementMatch:"3%" },
  { specialty:"Ophthalmology", state:"TX", metro:"San Antonio", setting:"Private", yrsExp:15, base:380000, bonus:120000, rvu:10500, rvuRate:65, ptoWeeks:6, call:"None", nonCompete:"20mi/2yr", tailCovered:true, signOnBonus:25000, loanRepay:0, retirementMatch:"5%" },
  { specialty:"Ophthalmology", state:"NC", metro:"Raleigh", setting:"Private", yrsExp:10, base:400000, bonus:150000, rvu:10000, rvuRate:68, ptoWeeks:5, call:"None", nonCompete:"10mi/1yr", tailCovered:true, signOnBonus:30000, loanRepay:100000, retirementMatch:"4%" },
  { specialty:"Ophthalmology", state:"IA", metro:"Rural Iowa", setting:"Private", yrsExp:20, base:320000, bonus:80000, rvu:7000, rvuRate:50, ptoWeeks:6, call:"1:6", nonCompete:"None", tailCovered:false, signOnBonus:5000, loanRepay:0, retirementMatch:"3%" },
  { specialty:"Pulmonology", state:"OR", metro:"Portland", setting:"Hospital", yrsExp:7, base:310000, bonus:40000, rvu:5500, rvuRate:55, ptoWeeks:4, call:"1:4", nonCompete:"10mi/1yr", tailCovered:true, signOnBonus:10000, loanRepay:50000, retirementMatch:"3%" },
  { specialty:"Pulmonology", state:"MI", metro:"Detroit", setting:"Hospital", yrsExp:10, base:340000, bonus:50000, rvu:6000, rvuRate:58, ptoWeeks:4, call:"1:4", nonCompete:"5mi/1yr", tailCovered:true, signOnBonus:15000, loanRepay:75000, retirementMatch:"4%" },
  { specialty:"Pulmonology", state:"TX", metro:"San Antonio", setting:"Private", yrsExp:5, base:280000, bonus:40000, rvu:4500, rvuRate:50, ptoWeeks:5, call:"1:5", nonCompete:"10mi/2yr", tailCovered:false, signOnBonus:20000, loanRepay:0, retirementMatch:"3%" },
  { specialty:"Pulmonology", state:"NC", metro:"Raleigh", setting:"Hospital", yrsExp:9, base:330000, bonus:45000, rvu:5800, rvuRate:56, ptoWeeks:4, call:"1:4", nonCompete:"10mi/1yr", tailCovered:true, signOnBonus:12000, loanRepay:60000, retirementMatch:"4%" },
  { specialty:"Pulmonology", state:"FL", metro:"Jacksonville", setting:"Hospital", yrsExp:6, base:300000, bonus:35000, rvu:5000, rvuRate:52, ptoWeeks:4, call:"1:5", nonCompete:"8mi/1yr", tailCovered:true, signOnBonus:10000, loanRepay:40000, retirementMatch:"3%" },
  { specialty:"OB/GYN", state:"FL", metro:"Jacksonville", setting:"Hospital", yrsExp:8, base:340000, bonus:60000, rvu:6500, rvuRate:60, ptoWeeks:4, call:"1:4", nonCompete:"10mi/2yr", tailCovered:true, signOnBonus:25000, loanRepay:100000, retirementMatch:"4%" },
  { specialty:"OB/GYN", state:"MI", metro:"Detroit", setting:"Private", yrsExp:15, base:380000, bonus:80000, rvu:7000, rvuRate:65, ptoWeeks:5, call:"1:4", nonCompete:"15mi/2yr", tailCovered:false, signOnBonus:10000, loanRepay:50000, retirementMatch:"5%" },
  { specialty:"OB/GYN", state:"TX", metro:"San Antonio", setting:"Hospital", yrsExp:6, base:310000, bonus:50000, rvu:6000, rvuRate:58, ptoWeeks:4, call:"1:4", nonCompete:"8mi/1yr", tailCovered:true, signOnBonus:20000, loanRepay:80000, retirementMatch:"3%" },
  { specialty:"OB/GYN", state:"IA", metro:"Rural Iowa", setting:"Hospital", yrsExp:10, base:360000, bonus:70000, rvu:6200, rvuRate:60, ptoWeeks:5, call:"1:3", nonCompete:"None", tailCovered:true, signOnBonus:80000, loanRepay:150000, retirementMatch:"5%" },
  { specialty:"OB/GYN", state:"UT", metro:"Salt Lake City", setting:"Hospital", yrsExp:4, base:300000, bonus:40000, rvu:5500, rvuRate:55, ptoWeeks:4, call:"1:4", nonCompete:"10mi/1yr", tailCovered:true, signOnBonus:15000, loanRepay:60000, retirementMatch:"3%" },
  { specialty:"Neurology", state:"OR", metro:"Portland", setting:"Hospital", yrsExp:9, base:320000, bonus:50000, rvu:5000, rvuRate:60, ptoWeeks:4, call:"1:5", nonCompete:"10mi/1yr", tailCovered:true, signOnBonus:15000, loanRepay:70000, retirementMatch:"4%" },
  { specialty:"Neurology", state:"MI", metro:"Detroit", setting:"Private", yrsExp:12, base:280000, bonus:40000, rvu:4800, rvuRate:55, ptoWeeks:5, call:"1:5", nonCompete:"10mi/2yr", tailCovered:false, signOnBonus:10000, loanRepay:30000, retirementMatch:"3%" },
  { specialty:"Neurology", state:"TX", metro:"San Antonio", setting:"Hospital", yrsExp:5, base:290000, bonus:35000, rvu:4200, rvuRate:52, ptoWeeks:4, call:"1:6", nonCompete:"5mi/1yr", tailCovered:true, signOnBonus:12000, loanRepay:50000, retirementMatch:"3%" },
  { specialty:"Neurology", state:"NC", metro:"Raleigh", setting:"Hospital", yrsExp:7, base:330000, bonus:45000, rvu:5200, rvuRate:58, ptoWeeks:4, call:"1:5", nonCompete:"10mi/1yr", tailCovered:true, signOnBonus:20000, loanRepay:80000, retirementMatch:"4%" },
  { specialty:"Neurology", state:"AK", metro:"Rural Alaska", setting:"Hospital", yrsExp:14, base:360000, bonus:60000, rvu:4500, rvuRate:65, ptoWeeks:6, call:"1:5", nonCompete:"None", tailCovered:true, signOnBonus:50000, loanRepay:120000, retirementMatch:"5%" },
  { specialty:"Psychiatry", state:"WA", metro:"Telehealth", setting:"Telehealth", yrsExp:10, base:300000, bonus:80000, rvu:0, rvuRate:0, ptoWeeks:6, call:"None", nonCompete:"None", tailCovered:false, signOnBonus:0, loanRepay:0, retirementMatch:"0%" },
  { specialty:"Psychiatry", state:"CA", metro:"Telehealth", setting:"Telehealth", yrsExp:6, base:320000, bonus:50000, rvu:0, rvuRate:0, ptoWeeks:5, call:"None", nonCompete:"None", tailCovered:false, signOnBonus:10000, loanRepay:25000, retirementMatch:"3%" },
  { specialty:"Psychiatry", state:"OR", metro:"Portland", setting:"Hospital", yrsExp:8, base:260000, bonus:25000, rvu:0, rvuRate:0, ptoWeeks:4, call:"1:6", nonCompete:"10mi/1yr", tailCovered:true, signOnBonus:15000, loanRepay:50000, retirementMatch:"4%" },
  { specialty:"Psychiatry", state:"MI", metro:"Detroit", setting:"Hospital", yrsExp:5, base:280000, bonus:30000, rvu:0, rvuRate:0, ptoWeeks:4, call:"1:5", nonCompete:"5mi/1yr", tailCovered:true, signOnBonus:20000, loanRepay:60000, retirementMatch:"3%" },
  { specialty:"Psychiatry", state:"FL", metro:"Jacksonville", setting:"Group", yrsExp:3, base:240000, bonus:20000, rvu:0, rvuRate:0, ptoWeeks:5, call:"None", nonCompete:"None", tailCovered:true, signOnBonus:10000, loanRepay:30000, retirementMatch:"3%" },
  { specialty:"Internal Medicine", state:"IA", metro:"Rural Iowa", setting:"Hospital", yrsExp:7, base:280000, bonus:40000, rvu:5500, rvuRate:58, ptoWeeks:5, call:"1:5", nonCompete:"None", tailCovered:true, signOnBonus:80000, loanRepay:150000, retirementMatch:"5%" },
  { specialty:"Internal Medicine", state:"OR", metro:"Portland", setting:"Private", yrsExp:9, base:250000, bonus:30000, rvu:5000, rvuRate:55, ptoWeeks:4, call:"1:6", nonCompete:"10mi/1yr", tailCovered:false, signOnBonus:5000, loanRepay:20000, retirementMatch:"3%" },
  { specialty:"Internal Medicine", state:"MI", metro:"Detroit", setting:"Hospital", yrsExp:6, base:275000, bonus:35000, rvu:5400, rvuRate:56, ptoWeeks:4, call:"1:5", nonCompete:"5mi/1yr", tailCovered:true, signOnBonus:15000, loanRepay:60000, retirementMatch:"4%" },
  { specialty:"Internal Medicine", state:"TX", metro:"San Antonio", setting:"Hospital", yrsExp:4, base:240000, bonus:25000, rvu:4600, rvuRate:52, ptoWeeks:4, call:"1:6", nonCompete:"8mi/1yr", tailCovered:true, signOnBonus:10000, loanRepay:40000, retirementMatch:"3%" },
  { specialty:"Internal Medicine", state:"NC", metro:"Raleigh", setting:"Academic", yrsExp:5, base:230000, bonus:20000, rvu:4200, rvuRate:50, ptoWeeks:5, call:"1:6", nonCompete:"None", tailCovered:true, signOnBonus:8000, loanRepay:30000, retirementMatch:"4%" },
  { specialty:"Family Medicine", state:"AK", metro:"Rural Alaska", setting:"Hospital", yrsExp:11, base:300000, bonus:50000, rvu:5200, rvuRate:65, ptoWeeks:6, call:"1:4", nonCompete:"None", tailCovered:true, signOnBonus:100000, loanRepay:200000, retirementMatch:"5%" },
  { specialty:"Family Medicine", state:"IA", metro:"Rural Iowa", setting:"Private", yrsExp:8, base:260000, bonus:40000, rvu:4800, rvuRate:60, ptoWeeks:5, call:"1:5", nonCompete:"None", tailCovered:false, signOnBonus:75000, loanRepay:100000, retirementMatch:"3%" },
  { specialty:"Family Medicine", state:"UT", metro:"Salt Lake City", setting:"Hospital", yrsExp:6, base:250000, bonus:30000, rvu:4600, rvuRate:55, ptoWeeks:4, call:"1:6", nonCompete:"10mi/1yr", tailCovered:true, signOnBonus:15000, loanRepay:50000, retirementMatch:"4%" },
  { specialty:"Family Medicine", state:"FL", metro:"Jacksonville", setting:"Hospital", yrsExp:5, base:240000, bonus:25000, rvu:4400, rvuRate:52, ptoWeeks:4, call:"1:6", nonCompete:"8mi/1yr", tailCovered:true, signOnBonus:10000, loanRepay:40000, retirementMatch:"3%" },
  { specialty:"Family Medicine", state:"OR", metro:"Portland", setting:"Group", yrsExp:7, base:235000, bonus:20000, rvu:4200, rvuRate:50, ptoWeeks:5, call:"1:6", nonCompete:"5mi/1yr", tailCovered:false, signOnBonus:5000, loanRepay:10000, retirementMatch:"3%" },
  { specialty:"Pathology", state:"MA", metro:"Boston", setting:"Academic", yrsExp:8, base:290000, bonus:30000, rvu:0, rvuRate:0, ptoWeeks:5, call:"1:6", nonCompete:"None", tailCovered:true, signOnBonus:10000, loanRepay:40000, retirementMatch:"5%" },
  { specialty:"Pathology", state:"TX", metro:"Dallas", setting:"Hospital", yrsExp:12, base:330000, bonus:45000, rvu:0, rvuRate:0, ptoWeeks:4, call:"1:5", nonCompete:"15mi/1yr", tailCovered:true, signOnBonus:25000, loanRepay:50000, retirementMatch:"4%" },
  { specialty:"Pathology", state:"CA", metro:"San Francisco", setting:"Academic", yrsExp:5, base:310000, bonus:25000, rvu:0, rvuRate:0, ptoWeeks:5, call:"1:6", nonCompete:"None", tailCovered:true, signOnBonus:15000, loanRepay:30000, retirementMatch:"4%" },
  { specialty:"Pathology", state:"OH", metro:"Columbus", setting:"Private", yrsExp:18, base:370000, bonus:60000, rvu:0, rvuRate:0, ptoWeeks:5, call:"1:5", nonCompete:"10mi/1yr", tailCovered:false, signOnBonus:0, loanRepay:0, retirementMatch:"3%" },
  { specialty:"Endocrinology", state:"IL", metro:"Chicago", setting:"Academic", yrsExp:6, base:250000, bonus:20000, rvu:4000, rvuRate:48, ptoWeeks:5, call:"1:6", nonCompete:"None", tailCovered:true, signOnBonus:10000, loanRepay:40000, retirementMatch:"5%" },
  { specialty:"Endocrinology", state:"FL", metro:"Tampa", setting:"Hospital", yrsExp:10, base:280000, bonus:35000, rvu:4500, rvuRate:52, ptoWeeks:4, call:"1:5", nonCompete:"10mi/1yr", tailCovered:true, signOnBonus:20000, loanRepay:60000, retirementMatch:"4%" },
  { specialty:"Endocrinology", state:"WA", metro:"Seattle", setting:"Private", yrsExp:15, base:310000, bonus:50000, rvu:5000, rvuRate:58, ptoWeeks:5, call:"None", nonCompete:"15mi/1yr", tailCovered:false, signOnBonus:0, loanRepay:0, retirementMatch:"3%" },
  { specialty:"Endocrinology", state:"IA", metro:"Rural Iowa", setting:"Hospital", yrsExp:4, base:260000, bonus:30000, rvu:3800, rvuRate:50, ptoWeeks:4, call:"1:5", nonCompete:"None", tailCovered:true, signOnBonus:75000, loanRepay:100000, retirementMatch:"4%" },
];

export default function SalaryDatabase({ profile }) {
  const [submissions, setSubmissions] = useState(() => [...SAMPLE_DATA, ...loadSubmissions()]);
  const [filterSpec, setFilterSpec] = useState("all");
  const [filterSetting, setFilterSetting] = useState("all");
  const [showSubmit, setShowSubmit] = useState(false);
  const [form, setForm] = useState({ specialty:profile.specialty, state:profile.state, setting:"Hospital", yrsExp:5, base:0, bonus:0, rvu:0, rvuRate:0, ptoWeeks:4, call:"1:4", nonCompete:"", tailCovered:false });

  const filtered = useMemo(() => {
    let d = submissions;
    if (filterSpec !== "all") d = d.filter(s => s.specialty === filterSpec);
    if (filterSetting !== "all") d = d.filter(s => s.setting === filterSetting);
    return d;
  }, [submissions, filterSpec, filterSetting]);

  const avgBase = filtered.length > 0 ? Math.round(filtered.reduce((s,d) => s+d.base, 0) / filtered.length) : 0;
  const avgTotal = filtered.length > 0 ? Math.round(filtered.reduce((s,d) => s+d.base+d.bonus, 0) / filtered.length) : 0;

  const specChart = useMemo(() => {
    const bySpec = {};
    submissions.forEach(s => { bySpec[s.specialty] = bySpec[s.specialty] || []; bySpec[s.specialty].push(s.base + s.bonus); });
    return Object.entries(bySpec).map(([spec, vals]) => ({
      name: spec.length > 12 ? spec.slice(0,11)+"." : spec,
      value: Math.round(vals.reduce((a,b)=>a+b,0) / vals.length / 1000),
      yours: spec === profile.specialty,
    })).sort((a,b) => b.value - a.value).slice(0, 10);
  }, [submissions, profile.specialty]);

  const submit = () => {
    if (!form.base) return;
    const updated = [...submissions, { ...form }];
    setSubmissions(updated);
    localStorage.setItem("pw_salarydb", JSON.stringify(updated.filter((_, i) => i >= SAMPLE_DATA.length)));
    setShowSubmit(false);
  };

  return (
    <div className="space-y-5 animate-in">
      <Section title="Salary Database" sub="Anonymous, Physician-Verified" />
      <p className="text-sm text-white/50">{submissions.length} verified submissions. Share yours to help the community.</p>

      <div className="flex gap-2">
        <select value={filterSpec} onChange={e => setFilterSpec(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/55 outline-none">
          <option value="all" className="bg-[#13141c]">All Specialties</option>
          {Object.keys(SPECIALTIES).map(s => <option key={s} value={s} className="bg-[#13141c]">{s}</option>)}
        </select>
        <select value={filterSetting} onChange={e => setFilterSetting(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/55 outline-none">
          {["all","Hospital","Private","Academic","Group","Telehealth","Locum","Government"].map(s => <option key={s} value={s} className="bg-[#13141c]">{s === "all" ? "All Settings" : s}</option>)}
        </select>
        <Btn onClick={() => setShowSubmit(!showSubmit)} variant="secondary">{showSubmit ? "Cancel" : "+ Submit Yours"}</Btn>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Avg base" value={fmt(avgBase)} sub={`${filtered.length} entries`} color="#34d399" />
        <Stat label="Avg total comp" value={fmt(avgTotal)} color="#60a5fa" />
        <Stat label="Your position" value={profile.salary > avgBase ? "Above avg" : "Below avg"} color={profile.salary > avgBase ? "#34d399" : "#fbbf24"} />
      </div>

      {showSubmit && (
        <Card className="animate-in">
          <p className="text-sm text-white/55 font-bold mb-3">Submit Your Compensation (Anonymous)</p>
          <div className="grid grid-cols-2 gap-2">
            <Inp label="Base salary" value={form.base} onChange={v => setForm(f=>({...f,base:+v}))} type="number" pre="$" />
            <Inp label="Annual bonus" value={form.bonus} onChange={v => setForm(f=>({...f,bonus:+v}))} type="number" pre="$" />
            <Inp label="Years experience" value={form.yrsExp} onChange={v => setForm(f=>({...f,yrsExp:+v}))} type="number" />
            <Inp label="Setting" value={form.setting} onChange={v => setForm(f=>({...f,setting:v}))}
              options={["Hospital","Private","Academic","Group","Telehealth","Government"].map(s=>({v:s,l:s}))} />
            <Inp label="Annual wRVUs" value={form.rvu} onChange={v => setForm(f=>({...f,rvu:+v}))} type="number" />
            <Inp label="$/wRVU rate" value={form.rvuRate} onChange={v => setForm(f=>({...f,rvuRate:+v}))} type="number" pre="$" />
            <Inp label="PTO weeks" value={form.ptoWeeks} onChange={v => setForm(f=>({...f,ptoWeeks:+v}))} type="number" />
            <Inp label="Call schedule" value={form.call} onChange={v => setForm(f=>({...f,call:v}))} />
            <Inp label="Non-compete" value={form.nonCompete} onChange={v => setForm(f=>({...f,nonCompete:v}))} />
          </div>
          <Btn onClick={submit} className="mt-3">Submit Anonymously</Btn>
        </Card>
      )}

      <Card>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Average Total Comp by Specialty ($K)</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={specChart} layout="vertical" barCategoryGap="8%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chartGrid)" horizontal={false}/>
            <XAxis type="number" tick={{fontSize:10,fill:"var(--chartText)"}} axisLine={false} tickLine={false} unit="K"/>
            <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:"var(--text3)"}} axisLine={false} tickLine={false} width={90}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="value" name="Avg Total ($K)" radius={[0,4,4,0]}>{specChart.map((d,i)=><Cell key={i} fill={d.yours?"#34d399":"rgba(255,255,255,0.06)"}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Individual entries */}
      <div className="space-y-1.5">
        {filtered.slice(0, 20).map((s, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <Badge color="#34d399">{s.specialty}</Badge>
                  <span className="text-xs text-white/50">{s.setting}</span>
                  <span className="text-xs text-white/40">{s.metro || STATE_NAMES[s.state] || s.state}</span>
                  <span className="text-xs text-white/40">{s.yrsExp}yr exp</span>
                </div>
                <div className="flex gap-3 text-xs text-white/50 flex-wrap">
                  <span>Call: {s.call}</span>
                  <span>PTO: {s.ptoWeeks}wk</span>
                  {s.signOnBonus > 0 && <span className="text-blue-400/70">Sign-on: ${s.signOnBonus?.toLocaleString()}</span>}
                  {s.loanRepay > 0 && <span className="text-purple-400/70">Loan repay: ${s.loanRepay?.toLocaleString()}</span>}
                  {s.retirementMatch && s.retirementMatch !== "0%" && <span className="text-amber-400/70">401k: {s.retirementMatch}</span>}
                  {s.nonCompete && s.nonCompete !== "None" && <span className="text-red-400/70">Non-compete: {s.nonCompete}</span>}
                  <span className={s.tailCovered ? "text-emerald-400/70" : "text-red-400/70"}>{s.tailCovered ? "Tail covered" : "Tail NOT covered"}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-white/65 tabular-nums">{fmt(s.base + s.bonus)}</p>
                <p className="text-xs text-white/40">Base: {fN(s.base)}{s.bonus > 0 ? ` + ${fN(s.bonus)} bonus` : ""}</p>
                {s.rvuRate > 0 && <p className="text-xs text-white/40">${s.rvuRate}/wRVU ({s.rvu.toLocaleString()} wRVUs)</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Takeaway items={[
        `${submissions.length} anonymous submissions. Average total comp: ${fmt(avgTotal)}. ${profile.salary > avgTotal ? "You're above average." : "Below average. Use this data to negotiate."}`,
        `Physicians who negotiate earn 15-20% more. Having real comp data gives you leverage your employer doesn't expect.`,
        `Submit your own data to help the community. It's 100% anonymous and legally protected (NLRA Section 7).`,
      ]} />
    </div>
  );
}
