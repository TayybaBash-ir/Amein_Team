import os

mock_file = 'src/lib/mock.ts'
with open(mock_file, 'r', encoding='utf-8') as f:
    content = f.read()

if 'pantry_input?: string;' not in content:
    content = content.replace(
        "pantry_items?: string[];",
        "pantry_items?: string[];\n  pantry_input?: string;"
    )
    with open(mock_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched mock.ts")

form_file = 'src/components/clima/ClinicalIntakeForm.tsx'
with open(form_file, 'r', encoding='utf-8') as f:
    form = f.read()

# 1. Add pantry_input to default state
if 'pantry_input: "",' not in form:
    form = form.replace(
        'pantry_items: [],',
        'pantry_items: [],\n    pantry_input: "",'
    )

# 2. Replace the massive Pantry UI block
import re
pantry_ui_pattern = re.compile(r'<p className="mb-5 text-\[13px\] leading-relaxed text-neutral-400">.*?<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">', re.DOTALL)

new_ui = """<p className="mb-5 text-[13px] leading-relaxed text-neutral-400">
          Just tell us what you have in your kitchen, and we'll prioritize meals using those ingredients.
        </p>

        <div className="mb-6">
          <textarea
            className="w-full bg-white/5 border border-white/5 focus:bg-white/10 focus:border-white/20 hover:bg-white/[0.07] rounded-[1.5rem] px-5 py-4 outline-none text-white transition-all placeholder:text-neutral-500 text-sm md:text-base min-h-[120px] resize-none"
            placeholder="e.g., I have some chicken, rice, tomatoes, and onions. Maybe some eggs too."
            value={d.pantry_input || ""}
            onChange={(e) => set("pantry_input", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">"""

form = re.sub(pantry_ui_pattern, new_ui, form)

# 3. Remove PANTRY_GROUPS completely to clean up the code
groups_pattern = re.compile(r'const PANTRY_GROUPS = \{.*?} as const;\n', re.DOTALL)
form = re.sub(groups_pattern, '', form)

with open(form_file, 'w', encoding='utf-8') as f:
    f.write(form)
print("Patched ClinicalIntakeForm.tsx")
