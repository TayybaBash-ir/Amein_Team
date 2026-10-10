import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('dietary_restrictions: updatedProfile.dietary_restrictions,', 'dietary_restrictions: updatedProfile.dietary_restrictions,\n            metabolic_modifier: updatedProfile.metabolic_modifier || 1.0,')

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated dashboard POST payload")
