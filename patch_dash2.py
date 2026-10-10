import os

page_file = 'src/app/dashboard/page.tsx'
with open(page_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<h2 className="editorial-title text-xl sm:text-2xl mb-0.5">Calculated Nutrition Plan</h2>',
    '<h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-1">Your Health Overview</h2>'
)
content = content.replace(
    'Personalized nutrition plan tailored for',
    'Perfectly balanced for'
)

with open(page_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched Dashboard")
