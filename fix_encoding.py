import os

def fix_file(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    # Fix the broken bullet points (various broken encodings)
    content = content.replace("A\u00b7", "\u2022")  # A· -> •
    content = content.replace("\u00c2\u00b7", "\u2022")  # Â· -> •
    content = content.replace("\ufffd\ufffd\ufffd", "\u2022")  # replacement chars -> •
    content = content.replace("??", "\u2022")  # ?? -> •
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Fixed: {path}")

files = [
    "src/components/clima/MacroScorecard.tsx",
    "src/components/clima/MealCard.tsx",
    "src/components/clima/MealPlanView.tsx",
    "src/app/dashboard/page.tsx",
]

for f in files:
    if os.path.exists(f):
        fix_file(f)

print("Done!")
