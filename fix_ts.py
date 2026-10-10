import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('metabolic_modifier: updatedProfile.metabolic_modifier || 1.0,', 'metabolic_modifier: (updatedProfile as any).metabolic_modifier || 1.0,')

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed TS error!")
