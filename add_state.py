import re

with open('src/components/clima/DashboardBento.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('const [mealDetailsOpen, setMealDetailsOpen] = useState(false);', 'const [mealDetailsOpen, setMealDetailsOpen] = useState(false);\n  const [checkInOpen, setCheckInOpen] = useState(false);')

with open('src/components/clima/DashboardBento.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("State injected!")
