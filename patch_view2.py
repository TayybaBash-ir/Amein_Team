import os

view_file = 'src/components/clima/MealPlanView.tsx'
with open(view_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("Your Clinical Meal Plan", "Your Custom Menu")
content = content.replace(
    "Generated based on your exact macros and restrictions.", 
    "Crafted specifically for your body, taste, and goals."
)
content = content.replace(
    'rounded-3xl border border-white/10 bg-[#111113] transition-all hover:border-white/20 hover:bg-white/[0.04]',
    'rounded-[2rem] border border-white/[0.04] bg-white/[0.02] backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:scale-[1.01] hover:bg-white/[0.04]'
)

with open(view_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched MealPlanView")
