import re

with open('src/app/p/[id]/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('<MealPlanView plan={plan} />', '<MealPlanView plan={plan} hideHeading={true} />')

with open('src/app/p/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Shared plan updated to hide heading")
