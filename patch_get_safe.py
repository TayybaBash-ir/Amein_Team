import os
import re

idx_file = 'api/index.py'
with open(idx_file, 'r', encoding='utf-8') as f:
    content = f.read()

# I will just write a regex to replace the messy getattr with the clean one in the generate_meal_plan and swap_meal

# generate_meal_plan happens earlier in the file.
# We'll use re.sub with a custom function to know if we are in swap_meal or generate_meal_plan.

def repl(match):
    # match.group(0) is the full get_safe_dishes block
    text = match.group(0)
    if 'bool(req.patient' in text:
        # We are in swap_meal
        text = re.sub(r'acute_illness=.*', 'acute_illness=getattr(req.patient, "acute_illness", None)', text)
    else:
        # We are in generate_meal_plan
        text = re.sub(r'acute_illness=.*', 'acute_illness=getattr(patient, "acute_illness", None)', text)
    return text

content = re.sub(r'categorized = get_safe_dishes\([^)]+\)', repl, content, flags=re.DOTALL)

with open(idx_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Cleaned up get_safe_dishes getattr")
