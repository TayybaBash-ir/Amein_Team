import os
import re

idx_file = 'api/index.py'
with open(idx_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Pass pantry_input to analyze_clinical_conditions
if 'pantry_input=getattr(patient, "pantry_input", None)' not in content:
    content = content.replace(
        "patient.goal, patient.goal_amount, avg_temp, patient.pantry_items, forbidden_items,",
        "patient.goal, patient.goal_amount, avg_temp, patient.pantry_items, forbidden_items,\n        pantry_input=getattr(patient, 'pantry_input', None),"
    )

# 2. Append extracted_pantry and recalculate forbidden_items
injection = """
    if getattr(ai_rules, 'extracted_pantry', None):
        pantry_items.extend(ai_rules.extracted_pantry)
        forbidden_items = _forbidden_proteins(pantry_items)
        print("AI EXTRACTED PANTRY:", ai_rules.extracted_pantry)
"""
if 'AI EXTRACTED PANTRY' not in content:
    content = content.replace(
        "targets = get_nutritional_targets(",
        injection + "\n    targets = get_nutritional_targets("
    )

with open(idx_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched index.py")
