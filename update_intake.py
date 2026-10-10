import re

with open('src/components/clima/ClinicalIntakeForm.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Remove conditions, allergies, dietary_restrictions from UI entirely
c = re.sub(r'\{listField\("Chronic conditions.*?\n', '', c)
c = re.sub(r'\{listField\("Dietary restrictions.*?\n', '', c)
c = re.sub(r'\{listField\("Allergies.*?\n', '', c)

# 2. Hide "AI Health Goal" when planMode === "recovery"
goal_ui_pattern = re.compile(r'(<div className="mb-6">\s*<label className=\{labelClass\}>AI Health Goal</label>\s*<input className=\{inputClass\} value=\{d\.goal \|\| ""\} placeholder="e\.g\.\s*\'I want to lose 5 kg weight in 1 month\'" onChange=\{\(e\) => set\("goal", e\.target\.value\)\} />\s*</div>)')
replacement = r'{planMode !== "recovery" && (\1)}'
c = re.sub(goal_ui_pattern, replacement, c)

with open('src/components/clima/ClinicalIntakeForm.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("ClinicalIntakeForm updated!")
