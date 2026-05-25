import re

# 1. Add new icons to icons.jsx
icons_file = "/tmp/pw5/src/components/icons.jsx"
with open(icons_file, "r") as f:
    content = f.read()

# Add new icon paths before the closing };
new_icons = """  // Additional icons for modules using emojis
  graduation: I("M22 10l-10-5L2 10l10 5 10-5z M6 12v5c0 2 2.69 4 6 4s6-2 6-4v-5"),
  calendar: I("M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z M16 2v4 M8 2v4 M3 10h18"),
  beach: I("M17.5 19H9.5l2-5h4l2 5z M12 2v7 M4.22 10.22l1.42 1.42 M1 14h3 M19.78 10.22l-1.42 1.42 M23 14h-3 M8 14a4 4 0 018 0"),
  chart: I("M18 20V10 M12 20V4 M6 20v-6"),
  target: I("M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z M12 14a2 2 0 100-4 2 2 0 000 4z"),
  bank: I("M3 21h18 M3 10h18 M5 6l7-3 7 3 M4 10v11 M8 10v11 M12 10v11 M16 10v11 M20 10v11"),
  home: I("M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"),
  clipboard: I("M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2 M9 14l2 2 4-4"),
  shield: I("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"),
  bell: I("M18 8A6 6 0 006 8c0 7-3 9-6 13h18c-3-4-6-6-6-13z M13.73 21a2 2 0 01-3.46 0"),
  lock: I("M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4"),
  money: I("M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"),
  memo: I("M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"),
  briefcase: I("M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"),
  hospital: I("M3 3h18v18H3V3z M12 7v10 M7 12h10"),
  pill: I("M10.5 1.5l-8 8a5.66 5.66 0 008 8l8-8a5.66 5.66 0 00-8-8z M6 14L14 6"),
  scale: I("M12 3v18 M5 8l7-5 7 5 M3 13a5.44 5.44 0 004 0 M17 13a5.44 5.44 0 004 0 M3 13l2-5 M7 13l-2-5 M17 13l2-5 M21 13l-2-5"),
  star: I("M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"),
  chat: I("M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"),
  trendingup: I("M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6"),
  filetext: I("M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"),
  database: I("M12 2C6.48 2 2 4.02 2 6.5v11C2 19.98 6.48 22 12 22s10-2.02 10-4.5v-11C22 4.02 17.52 2 12 2z M2 6.5C2 8.98 6.48 11 12 11s10-2.02 10-4.5"),
  award: I("M12 15a7 7 0 100-14 7 7 0 000 14z M8.21 13.89L7 23l5-3 5 3-1.21-9.12"),
  checkCircle: I("M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3"),
"""

content = content.replace("};", new_icons + "};")
with open(icons_file, "w") as f:
    f.write(content)

# 2. Fix ChecklistHub.jsx
cl_file = "/tmp/pw5/src/modules/ChecklistHub.jsx"
with open(cl_file, "r") as f:
    cl = f.read()

# Add Icon import
cl = cl.replace(
    'import { Section, Card, Alert, Badge, Takeaway } from "../components/ui";',
    'import { Section, Card, Alert, Badge, Takeaway } from "../components/ui";\nimport { Icon } from "../components/icons";'
)

# Replace emoji icons with SVG icon names
cl = cl.replace('icon:"🎓"', 'icon:"graduation"')
cl = cl.replace('icon:"📅"', 'icon:"calendar"')
cl = cl.replace('icon:"🏖️"', 'icon:"beach"')

# Replace emoji rendering in tabs with Icon component
cl = cl.replace(
    '<span className="text-xl">{cl.icon}</span>',
    '<Icon name={cl.icon} size={20} className="mx-auto text-emerald-400/70" />'
)

# Replace plain O/empty checkbox with SVG check/circle
old_checkbox = '''<div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs flex-shrink-0 ${done ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.04] text-white/20"}`}>
                  {done ? "O" : ""}
                </div>'''
new_checkbox = '''<div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${done ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.06] text-white/15"}`}>
                  {done ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"><circle cx="12" cy="12" r="1"/></svg>}
                </div>'''
cl = cl.replace(old_checkbox, new_checkbox)

with open(cl_file, "w") as f:
    f.write(cl)

# 3. Fix DocumentVault.jsx
dv_file = "/tmp/pw5/src/modules/DocumentVault.jsx"
with open(dv_file, "r") as f:
    dv = f.read()

# Add Icon import after first import
first_import_end = dv.index('";') + 2
dv = dv[:first_import_end] + '\nimport { Icon } from "../components/icons";' + dv[first_import_end:]

# Replace emoji icons with icon names
emoji_map_dv = {
    'icon:"📊"': 'icon:"chart"',
    'icon:"📝"': 'icon:"memo"',
    'icon:"🛡️"': 'icon:"shield"',
    'icon:"💰"': 'icon:"money"',
    'icon:"🎯"': 'icon:"target"',
    'icon:"📈"': 'icon:"trendingup"',
    'icon:"🏠"': 'icon:"home"',
    'icon:"🏥"': 'icon:"hospital"',
    'icon:"📋"': 'icon:"clipboard"',
}
for old, new in emoji_map_dv.items():
    dv = dv.replace(old, new)

# Replace emoji rendering - find where icon is rendered
# Look for pattern like {cat.icon} or {c.icon}
dv = re.sub(r'<span[^>]*>\{(\w+)\.icon\}</span>', lambda m: f'<Icon name={{{m.group(1)}.icon}} size={{16}} className="opacity-70" />', dv)
# Also handle plain {xxx.icon} text nodes that render emojis
dv = re.sub(r'>\{(\w+)\.icon\}<', lambda m: f'><Icon name={{{m.group(1)}.icon}} size={{16}} className="opacity-70" /><', dv)

with open(dv_file, "w") as f:
    f.write(dv)

# 4. Fix Insurance.jsx  
ins_file = "/tmp/pw5/src/modules/Insurance.jsx"
with open(ins_file, "r") as f:
    ins = f.read()

first_import_end = ins.index('";') + 2
ins = ins[:first_import_end] + '\nimport { Icon } from "../components/icons";' + ins[first_import_end:]

ins = ins.replace('icon: "⚖️"', 'icon: "scale"')
ins = ins.replace('icon: "🔒"', 'icon: "lock"')
ins = ins.replace('icon: "🛡️"', 'icon: "shield"')

# Replace emoji rendering
ins = re.sub(r'<span[^>]*>\{(\w+)\.icon\}</span>', lambda m: f'<Icon name={{{m.group(1)}.icon}} size={{16}} className="opacity-70" />', ins)
ins = re.sub(r'>\{(\w+)\.icon\}<', lambda m: f'><Icon name={{{m.group(1)}.icon}} size={{16}} className="opacity-70" /><', ins)

with open(ins_file, "w") as f:
    f.write(ins)

# 5. Fix CredentialTracker.jsx
ct_file = "/tmp/pw5/src/modules/CredentialTracker.jsx"
with open(ct_file, "r") as f:
    ct = f.read()

first_import_end = ct.index('";') + 2
ct = ct[:first_import_end] + '\nimport { Icon } from "../components/icons";' + ct[first_import_end:]

ct = ct.replace('icon:"🏥"', 'icon:"hospital"')
ct = ct.replace('icon:"💊"', 'icon:"pill"')
ct = ct.replace('icon:"⚖️"', 'icon:"scale"')
ct = ct.replace('icon:"📋"', 'icon:"clipboard"')

ct = re.sub(r'<span[^>]*>\{(\w+)\.icon\}</span>', lambda m: f'<Icon name={{{m.group(1)}.icon}} size={{16}} className="opacity-70" />', ct)
ct = re.sub(r'>\{(\w+)\.icon\}<', lambda m: f'><Icon name={{{m.group(1)}.icon}} size={{16}} className="opacity-70" /><', ct)

with open(ct_file, "w") as f:
    f.write(ct)

# 6. Fix Settings.jsx
st_file = "/tmp/pw5/src/modules/Settings.jsx"
with open(st_file, "r") as f:
    st = f.read()

first_import_end = st.index('";') + 2
st = st[:first_import_end] + '\nimport { Icon } from "../components/icons";' + st[first_import_end:]

st = st.replace('icon:"💰"', 'icon:"money"')
st = st.replace('icon:"🛡️"', 'icon:"shield"')
st = st.replace('icon:"📊"', 'icon:"chart"')
st = st.replace('icon:"🔔"', 'icon:"bell"')
st = st.replace('icon:"🔒"', 'icon:"lock"')

st = re.sub(r'<span[^>]*>\{(\w+)\.icon\}</span>', lambda m: f'<Icon name={{{m.group(1)}.icon}} size={{16}} className="opacity-70" />', st)
st = re.sub(r'>\{(\w+)\.icon\}<', lambda m: f'><Icon name={{{m.group(1)}.icon}} size={{16}} className="opacity-70" /><', st)

with open(st_file, "w") as f:
    f.write(st)

# 7. Fix Onboarding.jsx
ob_file = "/tmp/pw5/src/modules/Onboarding.jsx"
with open(ob_file, "r") as f:
    ob = f.read()

if 'from "../components/icons"' not in ob:
    first_import_end = ob.index('";') + 2
    ob = ob[:first_import_end] + '\nimport { Icon } from "../components/icons";' + ob[first_import_end:]

ob = ob.replace('icon:"📊"', 'icon:"chart"')
ob = ob.replace('icon:"🎯"', 'icon:"target"')
ob = ob.replace('icon:"🏦"', 'icon:"bank"')
ob = ob.replace('icon:"🏠"', 'icon:"home"')
ob = ob.replace('icon:"📋"', 'icon:"clipboard"')
ob = ob.replace('icon:"🛡️"', 'icon:"shield"')
ob = ob.replace('icon:"📝"', 'icon:"memo"')
ob = ob.replace('icon:"💰"', 'icon:"money"')

ob = re.sub(r'<span[^>]*>\{(\w+)\.icon\}</span>', lambda m: f'<Icon name={{{m.group(1)}.icon}} size={{16}} className="opacity-70" />', ob)
ob = re.sub(r'>\{(\w+)\.icon\}<', lambda m: f'><Icon name={{{m.group(1)}.icon}} size={{16}} className="opacity-70" /><', ob)

with open(ob_file, "w") as f:
    f.write(ob)

# 8. Fix Community.jsx
cm_file = "/tmp/pw5/src/modules/Community.jsx"
with open(cm_file, "r") as f:
    cm = f.read()

if 'from "../components/icons"' not in cm:
    first_import_end = cm.index('";') + 2
    cm = cm[:first_import_end] + '\nimport { Icon } from "../components/icons";' + cm[first_import_end:]

# Replace the icons object
cm = cm.replace(
    'const icons = { salary:"💰", post:"💬", savings:"📊", review:"⭐", milestone:"🎯" };',
    'const icons = { salary:"money", post:"chat", savings:"chart", review:"star", milestone:"target" };'
)

# If icons are rendered as text, replace with Icon component
# Look for pattern like {icons[xxx]}
cm = re.sub(r'\{icons\[([^\]]+)\]\}', lambda m: f'<Icon name={{icons[{m.group(1)}]}} size={{14}} className="opacity-60" />', cm)

with open(cm_file, "w") as f:
    f.write(cm)

print("All emoji icons replaced with SVG Icon components across 8 files")
