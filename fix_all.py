import re

# 1. HomeHero.tsx
with open('src/components/clima/HomeHero.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('from-[#1A1D1E]', 'from-background')
with open('src/components/clima/HomeHero.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

# 2. globals.css
with open('src/app/globals.css', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('to { transform: none; }', 'to { opacity: 1; transform: none; }')
with open('src/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(c)

# 3. MealPlanView.tsx
with open('src/components/clima/MealPlanView.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
# Remove Outside-order matches block
block_pattern = re.compile(r'\{externalDining\.length > 0 && \([\s\S]*?\}\)\}', re.DOTALL)
c = re.sub(block_pattern, '', c)
# Replace bg-black/70
c = c.replace('bg-black/70', 'bg-background/80')
with open('src/components/clima/MealPlanView.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

# 4. MealImage.tsx
with open('src/components/clima/MealImage.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('bg-black/60', 'bg-surface-2/60')
with open('src/components/clima/MealImage.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("All files updated successfully!")
