import re

with open('src/components/clima/DashboardBento.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('row-span-2', '')

with open('src/components/clima/DashboardBento.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Removed row-span-2!")
