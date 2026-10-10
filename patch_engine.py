import os
import re

engine_file = 'api/matching_engine.py'
with open(engine_file, 'r', encoding='utf-8') as f:
    content = f.read()

cost_logic = """
def estimate_dish_cost(macros, name=""):
    name = name.lower()
    protein_g = macros.get('protein_g', macros.get('protein', 0))
    carbs_g = macros.get('carbs_g', macros.get('carbs', 0))
    fat_g = macros.get('fat_g', macros.get('fat', 0))

    cost = 0.0

    if 'chicken' in name or 'murg' in name:
        cost += (protein_g / 0.25) * 0.7 
    elif 'beef' in name or 'gosht' in name:
        cost += (protein_g / 0.25) * 1.2
    elif 'mutton' in name:
        cost += (protein_g / 0.25) * 2.0
    elif 'egg' in name or 'omelette' in name:
        cost += (protein_g / 6.0) * 20.8
    elif 'milk' in name or 'shake' in name or 'chai' in name:
        cost += (protein_g / 0.034) * 0.35
    elif 'fish' in name:
        cost += (protein_g / 0.25) * 1.5
    else:
        cost += (protein_g / 0.25) * 0.4

    cost += carbs_g * 0.4
    cost += fat_g * 0.6
    cost += 30 # Overhead
    return cost

def estimate_plan_cost(dishes, mult=1.0):
    total = 0
    for d in dishes:
        if isinstance(d, dict):
            cost = estimate_dish_cost(d, d.get('name', ''))
            total += cost * mult
    return total
"""

if 'def estimate_dish_cost' not in content:
    content = content.replace("def calculate_penalty", cost_logic + "\ndef calculate_penalty")

# Add weekly_budget to find_best_meal_plan signature
content = re.sub(
    r'def find_best_meal_plan\(categorized, target_macros, preferences=None, iterations=2500, previously_selected=None\):',
    'def find_best_meal_plan(categorized, target_macros, preferences=None, iterations=2500, previously_selected=None, daily_budget=None):',
    content
)

# Find the loop body
# The loop looks like:
# for _ in range(iterations):
#     ...
#     score = calculate_penalty(plan_macros, target_macros)
#     if score < best_score: ...
replacement = """
        score = calculate_penalty(plan_macros, target_macros)
        
        # Budget Penalty
        if daily_budget is not None:
            estimated_cost = estimate_plan_cost(plan, multiplier)
            if estimated_cost > daily_budget:
                score += (estimated_cost - daily_budget) * 50  # Huge penalty for going over budget
        
        if score < best_score:
"""
if '# Budget Penalty' not in content:
    content = content.replace("        score = calculate_penalty(plan_macros, target_macros)\n        if score < best_score:", replacement)

with open(engine_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched matching_engine.py")
