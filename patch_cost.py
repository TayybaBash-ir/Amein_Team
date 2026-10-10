import os
import re

idx_file = 'api/index.py'
with open(idx_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix in generate_meal_plan
content = content.replace(
    "dish_cost = estimate_dish_cost(d, name)",
    "dish_cost = estimate_dish_cost({'protein_g': pro, 'carbs_g': carb, 'fat_g': fat}, name)"
)

# Fix in swap_meal
content = content.replace(
    "dish_cost = estimate_dish_cost(cand['candidate'], name)",
    "dish_cost = estimate_dish_cost({'protein_g': pro, 'carbs_g': carb, 'fat_g': fat}, name)"
)

with open(idx_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched estimate_dish_cost bugs")
