import re

with open('src/app/p/[id]/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('.table("saved_plans")', '.from("saved_plans")')

with open('src/app/p/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Supabase client syntax fixed!")
