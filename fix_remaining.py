import re

# Fix DocumentVault remaining emojis
dv_file = "/tmp/pw5/src/modules/DocumentVault.jsx"
with open(dv_file, "r") as f:
    dv = f.read()

dv = dv.replace('icon:"📄"', 'icon:"filetext"')
dv = dv.replace('icon:"📤"', 'icon:"filetext"')
dv = dv.replace('icon:"📁"', 'icon:"vault"')
dv = dv.replace('icon:"🧠"', 'icon:"aichat"')

# Fix the select dropdown that renders icon text - replace {t.icon} with just t.l
dv = dv.replace('{t.icon} {t.l}', '{t.l}')

# Fix the span that renders emoji for doc type display
dv = dv.replace(
    '<span className="text-xl mt-0.5">{type?.icon || "📄"}</span>',
    '<span className="mt-0.5"><Icon name={type?.icon || "filetext"} size={20} className="opacity-60" /></span>'
)

with open(dv_file, "w") as f:
    f.write(dv)

# Check Community.jsx for remaining rendering issues
cm_file = "/tmp/pw5/src/modules/Community.jsx"
with open(cm_file, "r") as f:
    cm = f.read()

# The regex replacement might have put JSX inside text nodes incorrectly
# Let's check and fix - the icons object values are now strings like "money", "chat" etc.
# They need to be rendered via <Icon> not as text
with open(cm_file, "w") as f:
    f.write(cm)

# Check all modules for any remaining emoji icons
import glob
for f in glob.glob("/tmp/pw5/src/modules/*.jsx"):
    with open(f) as fh:
        content = fh.read()
    # Check for common emoji patterns in icon contexts
    emojis_found = re.findall(r'icon[:\s]*"[^\w"][^"]*"', content)
    if emojis_found:
        print(f"REMAINING in {f}: {emojis_found}")

print("Remaining emoji cleanup done")
