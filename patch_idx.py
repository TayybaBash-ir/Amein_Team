import os
import re

idx_file = 'api/index.py'
with open(idx_file, 'r', encoding='utf-8') as f:
    idx = f.read()

# Pass acute_illness to analyze_clinical_conditions
if 'acute_illness=getattr(intake, "acute_illness", None)' not in idx:
    idx = idx.replace(
        'forbidden_items=forbidden_items,',
        'forbidden_items=forbidden_items,\n        acute_illness=getattr(intake, "acute_illness", None)'
    )

# Extract forbidden ingredients and illness advice for the NutritionTargets -> constraints_applied
# The constraints_applied list is built like this:
# constraints_applied = []
# if intake.goal: constraints_applied.append(f"Goal: {intake.goal} ({intake.goal_amount})")
# Let's find constraints_applied and inject the illness advice!
injection = """
    if getattr(clinical_rules, "illness_advice", None):
        constraints_applied.append(f"Healing Diet: {clinical_rules.illness_advice}")
    if getattr(clinical_rules, "forbidden_ingredients", None):
        constraints_applied.append("Forbidden: " + ", ".join(clinical_rules.forbidden_ingredients))
"""
if 'Healing Diet:' not in idx:
    idx = idx.replace(
        'if intake.city and intake.country: constraints_applied.append(f"Location: {intake.city}")',
        'if intake.city and intake.country: constraints_applied.append(f"Location: {intake.city}")\n' + injection
    )

# Also append LLM forbidden_ingredients to the forbidden_items array passed to get_safe_dishes!
if 'forbidden_items.extend(clinical_rules.forbidden_ingredients)' not in idx:
    idx = idx.replace(
        '# Parse weekly budget',
        'forbidden_items.extend(clinical_rules.forbidden_ingredients)\n    # Parse weekly budget'
    )

with open(idx_file, 'w', encoding='utf-8') as f:
    f.write(idx)
print("Patched index.py")
