# Fix all remaining emojis
files_fixes = {
    "/tmp/pw5/src/modules/Onboarding.jsx": {
        'icon:"🔥"': 'icon:"burnout"',
        'icon:"🗺️"': 'icon:"locumrates"',
    },
    "/tmp/pw5/src/modules/Insurance.jsx": {
        'icon: "☂️"': 'icon: "insurance"',
    },
    "/tmp/pw5/src/modules/CredentialTracker.jsx": {
        'icon:"📜"': 'icon:"filetext"',
        'icon:"❤️"': 'icon:"wellness"',
        'icon:"🗺️"': 'icon:"locumrates"',
        'icon:"🏨"': 'icon:"hospital"',
        'icon:"🔢"': 'icon:"rvucalc"',
    },
    "/tmp/pw5/src/modules/Settings.jsx": {
        'icon:"👤"': 'icon:"community"',
    },
}

for filepath, replacements in files_fixes.items():
    with open(filepath, "r") as f:
        content = f.read()
    for old, new in replacements.items():
        content = content.replace(old, new)
    with open(filepath, "w") as f:
        f.write(content)

# Verify no more emojis in icon contexts
import re, glob
clean = True
for f in glob.glob("/tmp/pw5/src/modules/*.jsx"):
    with open(f) as fh:
        content = fh.read()
    emojis_found = re.findall(r'icon[:\s]*"[^\w"][^"]*"', content)
    if emojis_found:
        print(f"STILL in {f}: {emojis_found}")
        clean = False
if clean:
    print("ALL CLEAN - no emoji icons remain")
